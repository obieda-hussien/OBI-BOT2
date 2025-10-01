let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, {
      text: "Hi @0",
      footer: global.footer || 'Neoxr Bot',
      buttons: [
        { buttonId: '.runtime', buttonText: { displayText: 'Runtime' }, type: 1 },
        { buttonId: '.stat', buttonText: { displayText: 'Statistic' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  } catch (e) {
    await m.reply('⚠️ حصل خطأ:\n' + e.toString())
  }
}

handler.command = /^(button2)$/i
export default handler