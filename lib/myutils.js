export async function sendFromAI(conn, m, text) {
  return await conn.sendMessage(
    m.chat,
    { 
      text, 
      contextInfo: { 
        forwardedNewsletterMessageInfo: { 
          newsletterJid: '120363043860127734@newsletter', // ID وهمي
          serverMessageId: '', 
          newsletterName: 'الذكاء الاصطناعي' 
        } 
      } 
    },
    { quoted: m }
  )
}