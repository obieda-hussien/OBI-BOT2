import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, args }) => {
  try {
    const input = args.join(' ').trim();
    let jid;

    // ✅ لو رابط قناة
    if (/whatsapp\.com\/channel\//.test(input)) {
      const res = await axios.get(input);
      const $ = cheerio.load(res.data);
      const imageUrl = $('meta[property="og:image"]').attr('content');
      let channelName = $('meta[property="og:title"]').attr('content').replace(' | WhatsApp Channel', '').trim();
      let channelDescription = $('meta[property="og:description"]').attr('content').replace(channelName, '').replace('WhatsApp Channel.', '').trim();
      const parts = channelDescription.split('. ');
      const followers = parts[parts.length - 1].replace(' followers', ' متابع');
      const description = parts.slice(0, parts.length - 1).join('. ').trim();
      if (imageUrl) {
        return await conn.sendFile(m.chat, imageUrl, 'channel.jpg', `*الأسم:* *${channelName}*\n*الوصف:* ${description ? '' + description + '' : ''}\n*المتابعين:* *${followers}*`, m);
      } else {
        throw 'no_channel_image';
      }
    }

    // ✅ لو رابط جروب
    const match = input.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
    if (match) {
      const code = match[1];
      const groupInfo = await conn.groupGetInviteInfo(code);
      const groupName = groupInfo.subject;
      const groupDescription = groupInfo.desc || 'لا يوجد وصف';
      const participants = groupInfo.size + ' عضو';
      const groupPicture = await conn.profilePictureUrl(groupInfo.id, 'image');
      if (groupPicture) {
        return await conn.sendFile(m.chat, groupPicture, 'group.jpg', `*الأسم:* *${groupName}*\n*الوصف:* ${groupDescription}\n*الأعضاء:* *${participants}*`, m);
      } else {
        throw 'no_group_picture';
      }
    } else if (m.mentionedJid && m.mentionedJid.length) {
      jid = m.mentionedJid[0];
    } else if (m.quoted && (m.quoted.sender || m.quoted.participant)) {
      jid = m.quoted.sender || m.quoted.participant;
    } else if (args.length) {
      if (input.endsWith('@s.whatsapp.net') || input.endsWith('@g.us') || input.endsWith('@broadcast')) {
        jid = input;
      } else {
        let number = input.replace(/[^0-9]/g, '');
        jid = number ? number + '@s.whatsapp.net' : m.chat;
      }
    } else {
      jid = m.chat.endsWith('@g.us') || m.chat.endsWith('@broadcast') ? m.chat : m.sender;
    }

    let url = await conn.profilePictureUrl(jid, 'image');
    if (!url) throw 'no_profile_pic';
    const name = await conn.getName(jid);
    await conn.sendFile(m.chat, url, 'profile.jpg', `*${name}*`, m);
  } catch (e) {
    console.error('❌ Error:', e);
    await conn.reply(m.chat, '🚩 مفيش صورة بروفايل متاحة أو الرابط مش صحيح!', m);
  }
};

handler.command = ['ava', 'بروفيلك', 'بروفيل' , "بروف"];
export default handler;