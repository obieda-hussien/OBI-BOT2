import axios from 'axios';

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('❗️ اكتب: .مشاري 2:255');

  const match = text.trim().match(/^(\d{1,3})[:\s]+(\d{1,3})$/);
  if (!match) return m.reply('❗️ الصيغة غير صحيحة. مثال: .مشاري 2:255');

  const surah = match[1];
  const ayah = match[2];

  try {
    const res = await axios.get(`http://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.alafasy`);
    if (res.data.status !== 'OK') throw new Error('API returned error');

    const data = res.data.data;
    const ayahText = data.text;
    const surahName = data.surah.name;
    const audioUrl = data.audio;

    // إرسال الآية كـ نص
    await conn.sendMessage(m.chat, {
      text: `📖 *سورة ${surahName} - آية ${ayah}*\n\n${ayahText}`
    }, { quoted: m });

    // إرسال الصوت
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `Mishary-${surahName}-${ayah}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply('❌ حدث خطأ أثناء جلب البيانات أو الصوت.');
  }
};

handler.command = ['مشاري'];
handler.help = ['مشاري <سورة:آية>'];
handler.tags = ['islamic'];

export default handler;