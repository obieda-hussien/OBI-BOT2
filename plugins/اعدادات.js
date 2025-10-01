let handler = async (m, { conn, command, text, participants, isOwner }) => {
  try {
    // 🟡 تحديد الشخص (mention | رد | رقم مكتوب)
    let target = m.mentionedJid?.[0] || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
    if (!target) return m.reply(`🚩 اعمل منشن أو رد على رسالة أو اكتب رقم.`)

    let number = target.split('@')[0]
    let member = participants.find(u => u.id == target)

    switch (command) {
      // 🔵 إضافة عضو
      case "اضافة":
        if (member) return m.reply(`🚩 @${number} موجود بالفعل في الجروب.`, null, { mentions: [target] })
        await conn.groupParticipantsUpdate(m.chat, [target], "add")
        m.reply(`✅ تمت إضافة @${number} بنجاح.`, null, { mentions: [target] })
        break

      // 🟠 طرد عضو
      case "طرد":
        if (!isOwner && m.sender !== conn.user.jid) {
          return m.reply("😏 *كسمك* ")
        }
        if (!member) return m.reply(`🚩 @${number} مش موجود في الجروب.`, null, { mentions: [target] })
        await conn.groupParticipantsUpdate(m.chat, [target], "remove")
        m.reply(`✅ تم طرد @${number} من الجروب.`, null, { mentions: [target] })
        break

      // 🟢 رفع مشرف
      case "رفع":
        if (!member) return m.reply(`🚩 @${number} مش موجود في الجروب.`, null, { mentions: [target] })
        await conn.groupParticipantsUpdate(m.chat, [target], "promote")
        m.reply(`✅ تم رفع @${number} إلى مشرف.`, null, { mentions: [target] })
        break

      // 🔴 تنزيل مشرف
      case "تنزيل":
        if (!member) return m.reply(`🚩 @${number} مش موجود في الجروب.`, null, { mentions: [target] })
        await conn.groupParticipantsUpdate(m.chat, [target], "demote")
        m.reply(`✅ تم تنزيل @${number} من المشرفين.`, null, { mentions: [target] })
        break
    }
  } catch (e) {
    console.error(e)
    m.reply(`⚠️ حصل خطأ: ${e.message}`)
  }
}

// 📝 معلومات الكوماندات
handler.help = ['اضافة @عضو', 'طرد @عضو', 'رفع @عضو', 'تنزيل @عضو']
handler.tags = ['group']
handler.command = /^(اضافة|طرد|رفع|تنزيل)$/i
handler.group = true
handler.admin = false
handler.botAdmin = false

export default handler