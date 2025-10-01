let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) throw '✳️ الرجاء الرد على ملصق للتحويل'
    let xx = m.quoted
    const buffer = await xx.download()
    await conn.sendMessage(m.chat, { image: buffer, caption: '𝒅𝒐𝒏𝒆✓' }, { quoted: m })
}

handler.help = ['لصورة <sticker>']
handler.tags = ['sticker']
handler.command = ['لصورة', 'لصوره', 'aimg']
export default handler