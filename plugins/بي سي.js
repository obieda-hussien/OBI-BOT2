function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let handler = async (m, { conn, text, command, quoted, participants }) => {
  try {
    // تحديد نوع البث
    let groups = Object.values(await conn.groupFetchAllParticipating()).map(v => v.id)
    let chats = Object.keys(conn.chats).filter(v => v.endsWith('@s.whatsapp.net'))
    let id = /bcgc|bcgcv/.test(command) ? groups : chats

    if (!id.length) return conn.reply(m.chat, `🚩 Error, no chat/group found.`, m)

    let group = /bcgc|bcgcv/.test(command)
    let q = quoted ? quoted : m
    let mime = (q.msg || q).mimetype || ''

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // إذا كان استيكر
    if (/image\/webp/.test(mime)) {
      let media = await q.download()
      for (let jid of id) {
        await sleep(1500)
        let member = group ? participants.map(v => v.id) : []
        await conn.sendMessage(jid, {
          sticker: media,
          contextInfo: { mentionedJid: member }
        })
      }
      return conn.reply(m.chat, `✅ تم إرسال البث إلى ${id.length} ${group ? 'groups' : 'chats'}`, m)
    }

    // إذا كان صورة أو فيديو
    if (/video|image\/(jpe?g|png)/.test(mime)) {
      let media = await q.download()
      for (let jid of id) {
        await sleep(1500)
        let member = group ? participants.map(v => v.id) : []
        await conn.sendFile(jid, media, '', text ? `乂  *BROADCAST*\n\n${text}` : (q.text || ''), null, {
          contextInfo: { mentionedJid: member },
          viewOnce: /bcgcv|bcv/.test(command)
        })
      }
      return conn.reply(m.chat, `✅ تم إرسال البث إلى ${id.length} ${group ? 'groups' : 'chats'}`, m)
    }

    // إذا كان صوت
    if (/audio/.test(mime)) {
      let media = await q.download()
      for (let jid of id) {
        await sleep(1500)
        let member = group ? participants.map(v => v.id) : []
        await conn.sendFile(jid, media, '', '', null, {
          ptt: q.ptt,
          contextInfo: { mentionedJid: member }
        })
      }
      return conn.reply(m.chat, `✅ تم إرسال البث إلى ${id.length} ${group ? 'groups' : 'chats'}`, m)
    }

    // إذا نص فقط
    if (text) {
      for (let jid of id) {
        await sleep(1500)
        let member = group ? participants.map(v => v.id) : []
        await conn.sendMessage(jid, {
          text: text,
          contextInfo: { mentionedJid: member }
        })
      }
      return conn.reply(m.chat, `✅ تم إرسال البث إلى ${id.length} ${group ? 'groups' : 'chats'}`, m)
    }

    conn.reply(m.chat, `🚩 استخدم الأمر مع نص أو رد على صورة/فيديو/صوت`, m)

  } catch (e) {
    conn.reply(m.chat, `❌ Error:\n\n${e}`, m)
  }
}

handler.help = ['bc <text>', 'bcgc <text>']
handler.tags = ['owner']
handler.command = /^(bc|bcgc|bcgcv|bcv)$/i
handler.owner = true

export default handler