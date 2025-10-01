import sharp from 'sharp'

let handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image')) {
    return m.reply('🖼️ رجاءً رد على صورة علشان أطبق عليها تأثير sepia')
  }

  try {
    const img = await m.quoted.download()
    let image = sharp(img).resize({ width: 1024 })
    image = image.recomb([
      [0.393, 0.769, 0.189],
      [0.349, 0.686, 0.168],
      [0.272, 0.534, 0.131],
    ])
    const buffer = await image.webp().toBuffer()

    await conn.sendFile(m.chat, buffer, 'sepia.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير sepia')
  }
}

handler.help = ['sepia']
handler.tags = ['effects']
handler.command = ['sepia']

export default handler