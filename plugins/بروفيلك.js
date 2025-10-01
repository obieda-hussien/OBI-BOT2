const handler = async (m, { conn, args }) => {
  try {
    let jid;
    if (m.mentionedJid && m.mentionedJid.length) {
      jid = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
      jid = m.quoted.sender;
    } else if (args.length) {
      let number = args.join(' ').replace(/[^0-9]/g, '');
      jid = number ? number + '@s.whatsapp.net' : m.sender;
    } else {
      jid = m.sender;
    }
    let url = await conn.profilePictureUrl(jid, 'image');
    await conn.sendFile(m.chat, url, 'profile.jpg', '*وصلت 📸*', m);
  } catch (e) {
    await conn.reply(m.chat, '🚩 الشخص ده مش حاطط صورة بروفايل!', m);
  }
};

handler.command = ['ava', 'بروفيلك', 'بروفيل'];

export default handler;