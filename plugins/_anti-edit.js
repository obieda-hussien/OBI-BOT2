// anti-edit.js
let msgCache = {}  // كاش لتخزين الرسائل

export async function before(m, { conn }) {
  try {
    if (!m.message) return

    let key = m.key?.id
    if (!key) return

    // النص الحالي
    let newText = extractText(m.message)
    if (!newText) return

    // لو الرسالة محفوظة قبل كده
    if (msgCache[key] && msgCache[key] !== newText) {
      let oldText = msgCache[key]
      let sender = m.sender || m.participant

      let caption = `✏️ *تم تعديل رسالة!*\n\n👤 *المرسل:* @${sender.split('@')[0]}\n\n`
      caption += `📌 *الرسالة القديمة:*\n────────────────\n`
      caption += `${oldText}\n\n`
      caption += `📌 *الرسالة الجديدة:*\n────────────────\n`
      caption += `${newText}`

      await conn.sendMessage(m.chat, { text: caption }, { mentions: [sender] })
    }

    // تخزين/تحديث الرسالة
    msgCache[key] = newText

  } catch (e) {
    console.error("AntiEdit error:", e)
  }
}

// دالة استخراج النص من أنواع الرسائل
function extractText(msg) {
  try {
    if (msg.conversation) return msg.conversation
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text
    if (msg.imageMessage?.caption) return msg.imageMessage.caption
    if (msg.videoMessage?.caption) return msg.videoMessage.caption
    return null
  } catch {
    return null
  }
}