import sharp from 'sharp'

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image'))
    return m.reply(`🖼️ رجاءً رد على صورة\n📌 الاستخدام: *${usedPrefix}hue [value]*\n🎨 value من 0 إلى 360`)

  let val = parseInt(args[0]) || 90
  if (isNaN(val) || val < 0 || val > 360) return m.reply('⚠️ القيمة يجب أن تكون بين 0 و 360')

  try {
    const imgBuffer = await m.quoted.download()

    const buffer = await sharp(imgBuffer)
      .resize({ width: 1024 })
      .modulate({ hue: val }) // تدوير الألوان
      .webp()
      .toBuffer()

    await conn.sendFile(m.chat, buffer, 'hue.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير hue-rotate')
  }
}

handler.help = ['hue [value]']
handler.tags = ['effects']
handler.command = ['hue', 'huerotate', 'huerotate']

export default handler