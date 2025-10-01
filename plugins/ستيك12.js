import Jimp from 'jimp'

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image'))
    return m.reply(`🖼️ رجاءً رد على صورة أو ستيكر\n📌 الاستخدام: *${usedPrefix}posterize [levels]*`)

  let levels = parseInt(args[0]) || 5
  if (levels < 2 || levels > 30) return m.reply('⚠️ القيم المسموحة: من 2 إلى 30')

  try {
    const img = await m.quoted.download()
    const jimp = await Jimp.read(img)

    jimp.posterize(levels)

    const buffer = await jimp.getBufferAsync(Jimp.MIME_PNG)
    await conn.sendFile(m.chat, buffer, 'posterize.png', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير posterize')
  }
}

handler.help = ['posterize [levels]']
handler.tags = ['effects']
handler.command = ['posterize']

export default handler