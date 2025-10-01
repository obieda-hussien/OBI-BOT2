import sharp from 'sharp'

let handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image')) {
    return m.reply('🖼️ رجاءً رد على صورة علشان أطبق عليها تأثير flip (انعكاس رأسي)')
  }

  try {
    const img = await m.quoted.download()
    let image = sharp(img).resize({ width: 1024 }).flip() // flip رأسي

    const buffer = await image.webp().toBuffer()
    await conn.sendFile(m.chat, buffer, 'flip.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير flip')
  }
}

handler.help = ['flip']
handler.tags = ['effects']
handler.command = ['flip']

export default handler