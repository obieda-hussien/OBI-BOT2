import { sendFromAI } from '../lib/myutils.js'

let handler = async (m, { conn }) => {
  try {
    await sendFromAI(conn, m, 'Hi!')
  } catch (e) {
    m.reply('⚠️ حصل خطأ:\n' + e.toString())
  }
}

handler.help = ['fromai']
handler.tags = ['example']
handler.command = /^fromai$/i
handler.private = true

export default handler