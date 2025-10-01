import sharp from 'sharp'

let handler = async (m, { conn, args, usedPrefix }) => {
  if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image'))
    return m.reply(`🖼️ رجاءً رد على صورة أو ستيكر\n📌 الاستخدام: *${usedPrefix}opacity [value]*`)

  let val = parseFloat(args[0])
  if (isNaN(val) || val < 0 || val > 1) 
    return m.reply('⚠️ القيمة يجب أن تكون بين 0 و 1 (مثلاً 0.5)')

  try {
    const imgBuffer = await m.quoted.download()
    const input = sharp(imgBuffer).resize({ width: 1024 }).png()

    // قراءة بيانات الصورة لتحديد الأبعاد
    const metadata = await input.metadata()
    const { width, height } = metadata

    // إنشاء طبقة شفافة بنفس أبعاد الصورة مع ألفا = val
    const transparentLayer = {
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: val }
      }
    }

    const buffer = await input
      .composite([{ input: transparentLayer, blend: 'dest-in' }])
      .webp()
      .toBuffer()

    await conn.sendFile(m.chat, buffer, 'opacity.webp', '', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ حصل خطأ أثناء تطبيق تأثير opacity')
  }
}

handler.help = ['opacity [value]']
handler.tags = ['effects']
handler.command = ['opacity']

export default handler