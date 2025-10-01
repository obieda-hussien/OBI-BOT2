const handler = async function (m, { conn, args, command }) {
  if (args.length < 2) return m.reply(`❌ الاستخدام:\n.${command} <رقم الشخص> <رقم الاستوري>`);

  const jid = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
  const index = parseInt(args[1]) - 1;

  if (!global.savedStories || !global.savedStories[jid]) {
    return m.reply('❌ لم يتم رصد أي استوري من هذا الرقم حتى الآن.');
  }

  const stories = global.savedStories[jid];
  const story = stories[index];

  if (!story) return m.reply('❌ رقم الاستوري غير موجود.');

  try {
    const buffer = await conn.downloadMediaMessage(story);
    const mimeType = story.message?.imageMessage ? 'image' : story.message?.videoMessage ? 'video' : null;

    if (mimeType === 'image') {
      await conn.sendFile(m.chat, buffer, 'story.jpg', null, m);
    } else if (mimeType === 'video') {
      await conn.sendFile(m.chat, buffer, 'story.mp4', null, m);
    } else {
      await m.reply('❌ نوع استوري غير مدعوم أو نصي فقط.');
    }
  } catch (e) {
    console.error(e);
    m.reply('❌ خطأ أثناء تحميل الاستوري.');
  }
};

handler.command = ['getstory'];
export default handler;