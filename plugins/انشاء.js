import fs from "fs"

function extractGroupCode(link) {
  let match = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
  return match ? match[1] : null
}

let handler = async (m, { conn, command, text }) => {
  try {
    switch (command) {
      // 🟢 إنشاء الجروب
      case "انشاء":
        if (!text) return m.reply(`*✏️ اكتب اسم الجروب!*`)
        m.reply(`⌛ جاري إنشاء الجروب...`)
        
        let group = await conn.groupCreate(text, [m.sender])
        let groupId = group.gid || group.id
        let inviteCode = await conn.groupInviteCode(groupId)
        let url = `https://chat.whatsapp.com/${inviteCode}`

        m.reply(
          `✅ *تم إنشاء الجروب بنجاح*\n\n` +
          `*📛 الاسم:* ${text}\n` +
          `*🆔 ID:* ${groupId}\n` +
          `*🔗 الرابط:* ${url}`
        )
        break

      // 🟡 تغيير صورة الجروب
      case "صورة":
        if (!m.quoted || !/image/.test(m.quoted.mimetype || ""))
          return m.reply(`📷 اعمل ريبلاي على صورة + ابعت لينك الجروب بعد الأمر`)

        if (!text) return m.reply(`🔗 اكتب لينك الجروب بعد الأمر`)

        let codePic = extractGroupCode(text)
        if (!codePic) return m.reply(`⚠️ لينك الجروب غير صحيح!`)

        let infoPic = await conn.groupGetInviteInfo(codePic)
        let media = await m.quoted.download()
        await conn.updateProfilePicture(infoPic.id, media)

        m.reply(`✅ تم تغيير صورة الجروب *${infoPic.subject}* بنجاح`)
        break

      // 🔵 تغيير اسم الجروب
      case "اسم":
        if (!text) return m.reply(`✏️ اكتب الاسم الجديد + لينك الجروب\n\n📌 مثال:\nاسم جروب جديد | https://chat.whatsapp.com/xxxx`)

        let [newName, link] = text.split("|").map(v => v.trim())
        if (!newName || !link) return m.reply(`⚠️ لازم تكتب الاسم + لينك الجروب مفصولين بـ |`)

        let codeName = extractGroupCode(link)
        if (!codeName) return m.reply(`⚠️ لينك الجروب غير صحيح!`)

        let infoName = await conn.groupGetInviteInfo(codeName)
        await conn.groupUpdateSubject(infoName.id, newName)

        m.reply(`✅ تم تغيير اسم الجروب لـ: *${newName}*`)
        break
    }
  } catch (e) {
    console.error(e)
    m.reply(`⚠️ حصل خطأ: ${e.message}`)
  }
}

handler.help = [
  'انشاء <اسم الجروب>',
  'صورة (بالرد على صورة + لينك جروب)',
  'اسم <اسم جديد | لينك جروب>'
]
handler.tags = ['owner']
handler.command = /^(انشاء|صورة|اسم)$/i
handler.owner = true

export default handler