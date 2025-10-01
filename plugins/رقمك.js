const handler = async (m, { conn }) => {
  try {
    let number;
    if (m.quoted) {
      number = m.quoted.sender.split('@')[0];
    } else if (m.mentionedJid && m.mentionedJid.length) {
      number = m.mentionedJid[0].split('@')[0];
    } else {
      return conn.reply(m.chat, ' *اعمل ريبلاي علي الشخص أو منشن عليه 🔢* ', m);
    }
    conn.reply(m.chat, ` *رقمو اهوه يروحي :* ${number}😉`, m);
  } catch (e) {
    conn.reply(m.chat, 'حدث خطأ ما', m);
  }
};

handler.command = ['رقم', 'الرقم', 'رقمك'];

export default handler;