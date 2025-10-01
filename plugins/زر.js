export async function handler(m, { conn }) {
  // إذا كانت الرسالة من زر
  if (m.text === 'btn1') {
    await m.reply('لقد ضغطت الزر btn1')
  }
}

handler.command = ['زر']  // ممكن تضع اسم أمر لو تريد، أو تترك بدون أمر
handler.customPrefix = /^btn1$/  // متطابق مع النص btn1
handler.tags = ['general']
handler.help = ['زر']

export default handler