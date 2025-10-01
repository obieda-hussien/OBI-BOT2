import sharp from 'sharp'

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image'))
    return m.reply(`🖼️ رجاءً رد على صورة أو ستيكر\n📌 الاستخدام: *${usedPrefix}rotate [90|180|270]*`)

  let angle = parseInt(args[0])
  if (![90, 180, 270].includes(angle))
    return m.reply('⚠️ القيمة يجب أن تكون 90 أو 180 أو 270 فقط')

  try {
    const imgBuffer = await m.quoted.download()
    const input = sharp(imgBuffer).rotate(angle).resize({ width: 1024 }).webp()
    const buffer = await input.toBuffer()

    await conn.sendFile(m.chat, buffer, 'rotate.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير التدوير')
  }
}

handler.help = ['rotate [90|180|270]']
handler.tags = ['effects']
handler.command = ['rotate']

export default handler