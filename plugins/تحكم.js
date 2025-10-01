import { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } from "@whiskeysockets/baileys";
import moment from "moment-timezone";
import NodeCache from "node-cache";
import readline from "readline";
import qrcode from "qrcode";
import crypto from "crypto";
import fs from "fs";
import pino from "pino";
import * as ws from "ws";
const { CONNECTING } = ws;
import { Boom } from "@hapi/boom";
import { makeWASocket } from "../lib/simple.js";

if (!Array.isArray(global.conns)) {
    global.conns = [];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner }) => {
    let parent = args[0] && args[0] === "plz" ? _conn : await global.conn;

    if (!((args[0] && args[0] === "plz") || (await global.conn).user.jid === _conn.user.jid)) {
        return m.reply(`هذا الأمر يمكن استخدامه فقط مع البوت الرئيسي! wa.me/${global.conn.user.jid.split('@')[0]}?text=${usedPrefix}code`);
    }

    const helpMsg = `❌ الأمر غير صحيح اتبع المثال الذي في الأسفل.\n\n🔹 اكتب الأمر مع رقمك هكذا:\nتنصيب 201XXXXXXXX\n\nمثال:\nتنصيب 201157009451`;

    // تم حذف أمر removeall من هنا
    const serbotCommands = ['contacts', 'chats', 'send', 'block', 'unblock', 'delsbot', 'restart', 'groups', 'up', 'low', 'add2', 'remove'];

    const findActiveSerbot = (phoneNumber) => {
        return global.conns.find(c => c?.user?.jid?.startsWith(phoneNumber) && c.ws?.readyState === ws.OPEN);
    };

    if (serbotCommands.includes(command)) {
        const parts = args.join(' ').split('|').map(s => s.trim());
        const serbotNumber = parts[0];
        const groupLink = parts.length > 1 ? parts[1] : '';
        const targetNumber = parts.length > 1 ? parts[parts.length - 1] : '';
        
        if (!serbotNumber) {
            return m.reply(`الرجاء تحديد رقم البوت الفرعي:\nمثال: ${usedPrefix}${command} 201157009451`);
        }

        const conn = findActiveSerbot(serbotNumber);
        if (!conn) {
            return m.reply('البوت الفرعي غير متصل أو الرقم غير صحيح.');
        }

        try {
            if (command === 'contacts') {
                const contacts = Object.values(conn.contacts || {}).map(v => `wa.me/${v.id.split('@')[0]}`).join('\n');
                m.reply(`جهات اتصال البوت الفرعي:\n${contacts || 'لا توجد جهات اتصال.'}`);
                return;
            }

            if (command === 'chats') {
                const chats = Object.values(conn.chats || {}).map(v => `${v.name || 'محادثة خاصة'}: wa.me/${v.id.split('@')[0]}`).join('\n');
                m.reply(`محادثات البوت الفرعي:\n${chats || 'لا توجد محادثات.'}`);
                return;
            }
            
            // --- START: MODIFIED SEND COMMAND ---
            if (command === 'send') {
                const targetIdentifier = parts.length > 1 ? parts[1] : '';

                if (!targetIdentifier) {
                    return m.reply(`❌ صيغة الأمر غير صحيحة.\n\n*مثال (للمجموعات):*\n${usedPrefix}send ${serbotNumber} | https://...\n\n*مثال (للأرقام):*\n${usedPrefix}send ${serbotNumber} | 20123456789`);
                }

                if (!m.quoted) {
                    return m.reply('⚠️ الرجاء الرد على الرسالة التي تريد إرسالها.');
                }

                let finalTargetJid;
                try {
                    // التحقق إذا كان المستهدف هو رابط مجموعة
                    if (targetIdentifier.includes('chat.whatsapp.com')) {
                        const inviteCode = targetIdentifier.split('chat.whatsapp.com/')[1];
                        if (!inviteCode) throw new Error('رابط المجموعة غير صالح.');
                        
                        const groupInfo = await conn.groupGetInviteInfo(inviteCode);
                        finalTargetJid = groupInfo.id;
                    } else { // إذا لم يكن رابط، افترضه كرقم هاتف
                        finalTargetJid = `${targetIdentifier.replace(/\D/g, '')}@s.whatsapp.net`;
                    }
                } catch (e) {
                    console.error(e);
                    return m.reply(`حدث خطأ أثناء معالجة المستلم: ${e.message}`);
                }

                if (!finalTargetJid) {
                    return m.reply('لم يتم تحديد مستلم صالح.');
                }

                // إرسال الرسالة المقتبسة (التي تم الرد عليها)
                const quoted = m.quoted;
                let mediaMessage = quoted.isMedia || quoted.isEphemeralMedia;

                if (mediaMessage) {
                    const media = await quoted.download();
                    let messageType = Object.keys(quoted.message)[0];
                    await conn.sendMessage(finalTargetJid, { 
                        [messageType.replace('Message', '').toLowerCase()]: media, 
                        mimetype: quoted.mimetype,
                        caption: quoted.text || '' // لإضافة النص مع الصورة أو الفيديو
                    });
                    m.reply(`✅ تم إرسال الوسائط بنجاح.`);
                } else if (quoted.text) {
                    await conn.sendMessage(finalTargetJid, { text: quoted.text });
                    m.reply(`✅ تم إرسال الرسالة النصية بنجاح.`);
                } else {
                    m.reply('❌ لا يمكن إرسال هذا النوع من الرسائل. يرجى الرد على نص أو وسائط.');
                }
                return;
            }
            // --- END: MODIFIED SEND COMMAND ---

            if (command === 'block' || command === 'unblock') {
                if (!targetNumber) {
                    return m.reply(`الرجاء تحديد رقم الشخص المراد ${command === 'block' ? 'حظره' : 'فك حظره'}.`);
                }
                const status = command === 'block' ? 'block' : 'unblock';
                const finalTargetJid = `${targetNumber.replace(/\D/g, '')}@s.whatsapp.net`;
                await conn.updateBlockStatus(finalTargetJid, status);
                m.reply(`تم ${status === 'block' ? 'حظر' : 'رفع الحظر عن'} الرقم ${targetNumber}.`);
                return;
            }
            
            if (command === 'groups') {
                const allGroups = await conn.groupFetchAllParticipating();
                const groupIds = Object.keys(allGroups);
                let adminGroups = [];
                for (const gid of groupIds) {
                    try {
                        const groupMeta = await conn.groupMetadata(gid);
                        const botMember = groupMeta.participants.find(p => p.id === conn.user.jid);
                        if (botMember?.admin === 'admin' || botMember?.admin === 'superadmin') {
                            const inviteCode = await conn.groupInviteCode(gid);
                            adminGroups.push(`*${groupMeta.subject}*\nhttps://chat.whatsapp.com/${inviteCode}`);
                        }
                    } catch (e) {
                        console.error(`خطأ في معالجة المجموعة ${gid}:`, e);
                        const groupInfo = allGroups[gid];
                        adminGroups.push(`*${groupInfo.subject}*\n(لا يمكن إنشاء رابط دعوة)`);
                    }
                }
                const replyText = `قائمة المجموعات التي يكون فيها البوت الفرعي مشرفًا:\n\n${adminGroups.join('\n\n') || 'لا يوجد مجموعات.'}`;
                await m.reply(replyText);
                return;
            }
            
            const groupActionCommands = ['up', 'low', 'add2', 'remove'];
            if (groupActionCommands.includes(command)) {
                const numberBlock = parts.slice(2).join(' ');
                const targetNumbers = numberBlock.split(/\s+/).filter(num => num.length > 0);
                if (!groupLink) return m.reply(`الرجاء توفير رابط المجموعة.\nمثال: ${usedPrefix}${command} ${serbotNumber} | <رابط المجموعة> | <رقم الهدف>`);
                if (!targetNumbers.length) return m.reply(`الرجاء توفير رقم واحد على الأقل للعملية.\nمثال: ${usedPrefix}${command} ${serbotNumber} | <رابط المجموعة> | <رقم الهدف>`);
                const inviteCode = groupLink.split('chat.whatsapp.com/')[1];
                if (!inviteCode) return m.reply('رابط المجموعة غير صالح.');
                const groupInfo = await conn.groupGetInviteInfo(inviteCode).catch(() => null);
                if (!groupInfo) return m.reply('لم أتمكن من العثور على المجموعة من خلال الرابط.');
                const groupJid = groupInfo.id;
                const finalTargetJids = targetNumbers.map(num => `${num.replace(/\D/g, '')}@s.whatsapp.net`);
                let action = '';
                if (command === 'up') action = 'promote';
                else if (command === 'low') action = 'demote';
                else if (command === 'add2') action = 'add';
                else if (command === 'remove') action = 'remove';
                const response = await conn.groupParticipantsUpdate(groupJid, finalTargetJids, action);
                let successMsg = `تم تنفيذ الإجراء "${action}" بنجاح في مجموعة *${groupInfo.subject}*.\n`;
                let failMsg = '';
                response.forEach(res => {
                    const num = res.jid.split('@')[0];
                    if (!res.status.toString().startsWith('2')) {
                        failMsg += ` - فشل الإجراء للرقم ${num} (السبب: ${res.status}).\n`;
                    }
                });
                await m.reply(successMsg + (failMsg ? `\n*الأخطاء:*\n${failMsg}` : ''));
                return;
            }

            if (command === 'restart') {
                await conn.ws.close();
                m.reply(`تم إعادة تشغيل البوت الفرعي ${serbotNumber} بنجاح.`);
                return;
            }
            
            if (command === 'delsbot') {
                await conn.logout();
                m.reply(`تم فصل البوت الفرعي ${serbotNumber} بنجاح وحذف ملفات الجلسة.`);
                return;
            }
        } catch (e) {
            console.error(e);
            m.reply(`حدث خطأ أثناء تنفيذ الأمر. الخطأ الكامل هو:\n\n\`\`\`\n${e.stack || e}\n\`\`\``);
        }
        return;
    }

    if (command === 'list') {
        const connectedBots = global.conns.filter(c => c?.user?.jid && c.ws?.readyState === ws.OPEN).map(c => `wa.me/${c.user.jid.split('@')[0]}`).join('\n');
        m.reply(`البوتات الفرعية المتصلة:\n${connectedBots || 'لا توجد بوتات فرعية متصلة.'}`);
        return;
    }

    const rawText = (m?.text || "").trim();
    const textNoPrefix = usedPrefix && rawText.startsWith(usedPrefix) ? rawText.slice(usedPrefix.length).trim() : rawText;
    const afterCmd = textNoPrefix.replace(/^(?:تنصيب|code)/i, "");
    let extractedNumber = afterCmd.replace(/\D/g, "");

    if (!extractedNumber) {
        return m.reply(helpMsg);
    }
    
    if (extractedNumber.length < 9 || extractedNumber.length > 16) {
        return m.reply(`⚠️ تأكد من كتابة رقمك الدولي بشكل صحيح.\nمثال: 201153792220`);
    }

    async function serbot() {
        let authFolderB = crypto.randomBytes(10).toString("hex").slice(0, 8);
        if (!fs.existsSync("./serbot/" + authFolderB)) {
            fs.mkdirSync("./serbot/" + authFolderB, { recursive: true });
        }
        const { state, saveCreds } = await useMultiFileAuthState(`./serbot/${authFolderB}`);
        const msgRetryCounterCache = new NodeCache();
        const { version } = await fetchLatestBaileysVersion();
        const phoneNumber = extractedNumber;
        const MethodMobile = process.argv.includes("mobile");
        const connectionOptions = {
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            mobile: MethodMobile,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (clave) => {
                let jid = jidNormalizedUser(clave.remoteJid);
                let msg = await store.loadMessage(jid, clave.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: undefined,
            version
        };
        let conn = makeWASocket(connectionOptions);
        if (!state.creds.registered) {
            let cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
            if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) {
                await parent.reply(m.chat, `⚠️ اكتب رقمًا دوليًا يبدأ بكود الدولة.\nمثال مصر: 201XXXXXXXX`, m);
                return;
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(cleanedNumber);
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                let txt = ` –  *｢🎶┋𝙱𝙾𝚃-𝙳𝙴𝙼𝙾𝙽┋🎤｣*\n\n`;
                txt += `*┌  ✩  استخدم هذا الكود لتصبح بوت فرعي*\n`;
                txt += `*│  ✩  الخطوات:*\n`;
                txt += `*│  ✩  1 : اضغط على الثلاث نقاط*\n`;
                txt += `*│  ✩  2 : اضغط على الأجهزة المرتبطة*\n`;
                txt += `*│  ✩  3 : اختر ربط مع رقم الهاتف*\n`;
                txt += `*└  ✩  4 : اكتب الكود*\n\n`;
                txt += `*ملاحظة: هذا الكود يعمل فقط على الرقم الذي طلبه*`;
                await parent.reply(m.chat, txt, m);
                await parent.reply(m.chat, codeBot, m);
            }, 3000);
        }
        conn.isInit = false;
        let isInit = true;
        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin } = update;
            if (isNewLogin) conn.isInit = true;
            const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
                let i = global.conns.indexOf(conn);
                if (i < 0) return console.log(await creloadHandler(true).catch(console.error));
                delete global.conns[i];
                global.conns.splice(i, 1);
                if (code !== DisconnectReason.connectionClosed) {
                    parent.sendMessage(m.chat, { text: "تم فقد الاتصال.." }, { quoted: m });
                }
            }
            if (global.db?.data == null) loadDatabase?.();
            if (connection === "open") {
                conn.isInit = true;
                global.conns = global.conns.filter(c => c?.user?.jid !== conn.user.jid);
                global.conns.push(conn);
                await parent.reply(m.chat, `✅ تم الاتصال بنجاح مع واتساب.`, m);
            } else if (connection === "close") {
                const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    await parent.reply(m.chat, `تم تسجيل الخروج من البوت الفرعي.`, m);
                }
            }
        }
        setInterval(async () => {
            if (!conn.user || conn.ws.readyState !== ws.OPEN) {
                try { conn.ws.close(); } catch { }
                conn.ev.removeAllListeners();
                let i = global.conns.indexOf(conn);
                if (i < 0) return;
                delete global.conns[i];
                global.conns.splice(i, 1);
            }
        }, 60000);
        let handler = await import("../handler.js");
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
                if (Object.keys(Handler || {}).length) handler = Handler;
            } catch (e) {
                console.error(e);
            }
            if (restatConn) {
                try { conn.ws.close(); } catch { }
                conn.ev.removeAllListeners();
                conn = makeWASocket(connectionOptions);
                isInit = true;
            }
            if (!isInit) {
                conn.ev.off("messages.upsert", conn.handler);
                conn.ev.off("connection.update", conn.connectionUpdate);
                conn.ev.off("creds.update", conn.credsUpdate);
            }
            conn.handler = handler.handler.bind(conn);
            conn.connectionUpdate = connectionUpdate.bind(conn);
            conn.credsUpdate = saveCreds.bind(conn, true);
            conn.ev.on("messages.upsert", conn.handler);
            conn.ev.on("connection.update", conn.connectionUpdate);
            conn.ev.on("creds.update", conn.credsUpdate);
            isInit = false;
            return true;
        }
        creloadHandler(false);
    }

    if (command.startsWith('تنصيب') || command.startsWith('code')) {
        serbot();
    }
};

handler.help = ["code"];
handler.tags = ["serbot"];
// تم حذف أمر removeall من هنا
handler.command = /^(?:code|تنصيب|contacts|chats|send|block|unblock|delsbot|list|restart|groups|up|low|add2|remove)\d*$/i;
handler.rowner = false;

export default handler;