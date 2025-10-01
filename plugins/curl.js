import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const runCurl = (url) => {
  return new Promise((resolve, reject) => {
    exec(`curl -L --max-time 10 "${url}"`, { maxBuffer: 1024 * 1000 }, (error, stdout, stderr) => {
      if (error) return reject(error.message);
      resolve(stdout.trim());
    });
  });
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `⚠️ اكتب رابط بعد الأمر\nمثال:\n${usedPrefix + command} https://example.com`;

  const url = args[0];

  try {
    const result = await runCurl(url);

    if (!result) throw '📭 الرابط لا يحتوي على محتوى نصي.';

    if (result.length > 4000) {
      const fileName = `curl-result-${Date.now()}.txt`;
      const filePath = path.join('./tmp', fileName);

      fs.writeFileSync(filePath, result);

      await conn.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'text/plain',
        fileName,
        caption: '📄 تم جلب الصفحة كاملة في ملف لأن المحتوى طويل.',
      }, { quoted: m });

      fs.unlinkSync(filePath);
    } else {
      await conn.sendMessage(m.chat, {
        text: `📄 محتوى الرابط:\n\n${result}`
      }, { quoted: m });
    }

  } catch (err) {
    await conn.sendMessage(m.chat, {
      text: `❌ حدث خطأ أثناء تنفيذ curl:\n${err}`
    }, { quoted: m });
  }
};

handler.help = ['curl <رابط>'];
handler.tags = ['tools'];
handler.command = /^curl$/i;

export default handler;