import sharp from 'sharp'

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image'))
    return m.reply(`🖼️ رجاءً رد على صورة أو ستيكر\n📌 الاستخدام: *${usedPrefix}tint [color]*\n🎨 أمثلة: red, blue, #00ff00`)

  let color = args[0]
  if (!color) return m.reply('⚠️ من فضلك اكتب لون بصيغة اسم أو Hex مثل: red أو #00ffff')

  try {
    const imgBuffer = await m.quoted.download()

    const buffer = await sharp(imgBuffer)
      .resize({ width: 1024 })
      .tint(color)
      .webp()
      .toBuffer()

    await conn.sendFile(m.chat, buffer, 'tint.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير tint\n🧪 تأكد أن اللون صحيح (مثلاً red أو #00ff00)')
  }
}

handler.help = ['tint [color]']
handler.tags = ['effects']
handler.command = ['tint']

export default handler