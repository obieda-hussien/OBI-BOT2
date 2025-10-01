let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `🌷 ابعت لينك بوست القناة هنا!`, m);
    }

    let match = text.match(/https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)\/(\d+)/i);
    if (!match) {
      return conn.reply(m.chat, `🌱 ادخل لينك بوست قناة صحيح.`, m);
    }

    let channelId = match + '@newsletter';
    let postId = match;

    let teks = `*ID القناة:* ${channelId}\n*ID البوست:* ${postId}`;
    await m.reply(teks);
    m.react("☑️");
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, `حصل خطأ: ${error.message}`, m);
  }
};
handler.command = ["postid", "بوست"];
handler.help = ["postid"];
handler.tags = ["tools"];
export default handler;