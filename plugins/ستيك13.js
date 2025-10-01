import sharp from 'sharp'

let handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image')) {
    return m.reply('🖼️ رجاءً رد على صورة علشان أطبق عليها تأثير flop (انعكاس أفقي)')
  }

  try {
    const img = await m.quoted.download()
    let image = sharp(img).resize({ width: 1024 }).flop() // flop أفقي

    const buffer = await image.webp().toBuffer()
    await conn.sendFile(m.chat, buffer, 'flop.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير flop')
  }
}

handler.help = ['flop']
handler.tags = ['effects']
handler.command = ['flop']

export default handler