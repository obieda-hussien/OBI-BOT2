import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
    await m.react('💀');

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let name = await conn.getName(who);
    let edtr = `@${m.sender.split`@`[0]}`;
    let username = conn.getName(m.sender);

    // إرسال الأغنية
    let audioUrl = 'https://files.catbox.moe/954yqi.mp3';
    await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mp4', 
        ptt: false 
    }, { quoted: m });

    // تأخير 3 ثوانٍ قبل إرسال جهة الاتصال
    setTimeout(async () => {
        // VCARD
        let list = [{
            displayName: "｢💀┊𝙳𝙴𝙼𝙾𝙽┊💀｣",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:  ｢💀┊𝙳𝙴𝙼𝙾𝙽┊💀｣\nitem1.TEL;waid=201210850141:201210850141\nitem1.X-ABLabel:201210850141\nitem2.EMAIL;type=INTERNET: ahmedeopop@gmail.com\nitem2.X-ABLabel:البريد الإلكتروني\nitem3.URL:https://www.instagram.com/black_user_me/profilecard/?igsh=aXE0ODY1djY2ZGNz/angelito.kzx\nitem3.X-ABLabel:إنستغرام\nitem4.ADR:;; مصر;;;;\nitem4.X-ABLabel:الدولة\nEND:VCARD`,
        }];

        await conn.sendMessage(m.chat, {
            contacts: {
                displayName: `${list.length} جهة اتصال`,
                contacts: list
            },
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: 'مرحبا، هذا هو مطور البوت',
                    body: 'للتواصل مع المطور مباشرة',
                    thumbnailUrl: 'https://files.catbox.moe/d80hd8.jpg',
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, {
            quoted: m
        });

        let txt = `👋 *مرحبًا \`${username}\` هذا هو*\n*جهة اتصال مطور البوت*`;

        await conn.sendMessage(m.chat, {
            text: txt,
            footer: '｢💀┊𝙳𝙴𝙼𝙾𝙽┊💀｣',
            buttons: [
                {
                    buttonId: ".menu",
                    buttonText: {
                        displayText: 'قائمة البوت'
                    },
                    type: 1
                },
                {
                    buttonId: ".اختبار",
                    buttonText: {
                        displayText: 'اختبار'
                    },
                    type: 1
                }
            ],
            viewOnce: true,
            headerType: 1
        }, { quoted: m });

    }, 3000); // تأخير لمدة 3 ثواني
};

handler.help = ['owner', 'creator'];
handler.tags = ['main'];
handler.command = /^(owner|المطور|مطور|dueño)$/i;

export default handler;