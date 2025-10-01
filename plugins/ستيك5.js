import sharp from 'sharp'

let handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image')) {
    return m.reply('🖼️ رجاءً رد على صورة علشان أطبق عليها تأثير grayscale (أبيض وأسود)')
  }

  try {
    const img = await m.quoted.download()
    let image = sharp(img).resize({ width: 1024 })
    image = image.greyscale()
    const buffer = await image.webp().toBuffer()

    await conn.sendFile(m.chat, buffer, 'grayscale.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير grayscale')
  }
}

handler.help = ['grayscale']
handler.tags = ['effects']
handler.command = ['grayscale']

export default handler