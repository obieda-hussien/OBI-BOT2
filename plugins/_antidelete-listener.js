export async function before(m, { conn }) {

  try {

    // لو الخاصية مقفولة → تجاهل

    if (!global.db.data.settings.antidelete) return

    

    // البايلز بيبعت message.type == "protocolMessage" لو في رسالة اتمسحت

    if (m.message?.protocolMessage?.type === 0) {

      let key = m.message.protocolMessage.key

      let deletedMsg = await conn.loadMessage(key.remoteJid, key.id)

      

      if (deletedMsg) {

        await conn.sendMessage(m.chat, { 

          forward: deletedMsg 

        }, { quoted: m })

      }

    }

  } catch (e) {

    console.error('AntiDelete error:', e)

  }

}