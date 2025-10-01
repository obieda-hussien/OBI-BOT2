let handler = async (m, { conn, participants }) => {
  try {
    m.reply(`🚨 جاري طرد جميع الأعضاء من الجروب...`)

    // 🟡 رقم الأونر (إنت)
    let owner = m.sender 
    // 🟢 رقم البوت
    let bot = conn.user.id 

    // هنجمع كل الأعضاء اللي هيتطردوا
    let kickList = participants
      .map(u => u.id)
      .filter(id => id !== owner && id !== bot)

    // 🛑 لو مفيش حد يتطرد
    if (kickList.length === 0) return m.reply(`⚠️ مفيش أعضاء ينفع يتطردوا.`)

    // 🟢 طرد الأعضاء دفعة واحدة
    await conn.groupParticipantsUpdate(m.chat, kickList, 'remove')

    m.reply(`✅ تم طرد *${kickList.length}* عضو من الجروب دفعة واحدة.`)
  } catch (e) {
    console.error(e)
    m.reply(`⚠️ حصل خطأ: ${e.message}`)
  }
}

handler.help = ['طرد_الكل']
handler.tags = ['group']
handler.command = /^طرد_الكل$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler