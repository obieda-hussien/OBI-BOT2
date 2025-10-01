import sharp from 'sharp'

let handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image')) {
    return m.reply('🖼️ رجاءً رد على صورة علشان أطبق عليها تأثير sharpen (زيادة الحدة)')
  }

  try {
    const img = await m.quoted.download()
    let image = sharp(img).resize({ width: 1024 })
    image = image.sharpen()
    const buffer = await image.webp().toBuffer()

    await conn.sendFile(m.chat, buffer, 'sharpen.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير sharpen')
  }
}

handler.help = ['sharpen']
handler.tags = ['effects']
handler.command = ['sharpen']

export default handler