import fetch from 'node-fetch'

let handler = async (m, { conn, text, args }) => {
  if (!text) throw '*❗️ من فضلك أرسل الرابط الذي تريد اختصاره.*';

  try {
    const urlToShorten = args[0];
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`);
    const shortUrl = await response.text();

    if (!shortUrl) throw '*❌ حدث خطأ أثناء محاولة اختصار الرابط.*';

    const replyText =
      `*🔗 اختصار الرابط*\n\n` +
      `*الرابط الأصلي:*\n${urlToShorten}\n\n` +
      `*الرابط المختصر:*\n${shortUrl}`;

    await conn.reply(m.chat, replyText, m);
  } catch (error) {
    await conn.reply(m.chat, `❌ حدث خطأ:\n${error.message || error}`, m);
  }
}

handler.help = ['tinyurl', 'shorten'].map(v => v + ' <الرابط>');
handler.tags = ['tools'];
handler.command = /^(tinyurl|short|acortar|corto|اختصار)$/i;

export default handler;