import sharp from 'sharp'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image')) {
    return m.reply(`🖼️ رد على صورة علشان نطبق القص\n📌 الاستخدام: *${usedPrefix + command} left top width height*`)
  }

  if (args.length < 4) {
    return m.reply('⚠️ لازم تكتب 4 أرقام: left top width height\nمثال: #crop 100 50 300 300')
  }

  let [left, top, width, height] = args.map(v => parseInt(v))

  if ([left, top, width, height].some(v => isNaN(v) || v < 1))
    return m.reply('⚠️ القيم لازم تكون أرقام صحيحة وكبيرة من 1')

  try {
    const imgBuffer = await m.quoted.download()

    const cropped = await sharp(imgBuffer)
      .extract({ left, top, width, height })
      .webp()
      .toBuffer()

    await conn.sendFile(m.chat, cropped, 'cropped.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء قص الصورة\n🧪 تأكد إن الأبعاد ضمن حجم الصورة الفعلي')
  }
}

handler.help = ['crop left top width height']
handler.tags = ['effects']
handler.command = ['crop']

export default handler