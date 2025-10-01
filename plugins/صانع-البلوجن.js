import fs from 'fs'
import path from 'path'

const handler = async function (m, { text, conn, command }) {
  try {
    if (command === 'صنعبلوجن') {
      if (!text.includes('|')) return m.reply('❌ الصيغة غلط!\nاكتب:\n.صنعبلوجن اسم|أوامر مفصولة بفاصلة|الرد')

      const [nameRaw, commandsRaw, replyRaw] = text.split('|').map(v => v.trim())
      if (!nameRaw || !commandsRaw || !replyRaw) return m.reply('❌ لازم تكتب اسم، أوامر، ورد!')

      const commands = commandsRaw.split(',').map(cmd => cmd.trim()).filter(Boolean)
      const name = nameRaw.replace(/[^a-zA-Z0-9_-]/g, '')
      const replyText = replyRaw.replace(/`/g, '\\`')

      const pluginCode = `
const handler = async function (m, { conn }) {
  await conn.reply(m.chat, \`${replyText}\`, m);
};

handler.command = ${JSON.stringify(commands)};
export default handler;
`.trim()

      const filePath = path.join('./plugins', `${name}.js`)
      fs.writeFileSync(filePath, pluginCode)

      await conn.reply(m.chat, `✅ تم إنشاء البلوجن \`${name}.js\`\n📌 أوامر: ${commands.join(', ')}\n💬 الرد: ${replyRaw}`, m)
    } else if (command === 'حذفبلوجن') {
      if (!text) return conn.reply(m.chat, '❌ اكتب اسم البلوجن اللي عايز تحذفه\nمثال:\n.حذفبلوجن ترحيب', m)

      const fileName = text.trim().replace(/[^a-zA-Z0-9_-]/g, '') + '.js'
      const filePath = path.join('./plugins', fileName)

      if (!fs.existsSync(filePath)) {
        return conn.reply(m.chat, `❌ مفيش بلوجن بالاسم ده: *${fileName}*`, m)
      }

      fs.unlinkSync(filePath)
      await conn.reply(m.chat, `✅ تم حذف البلوجن: *${fileName}* بنجاح`, m)
    }
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ حصل خطأ أثناء تنفيذ الأمر', m)
  }
}

handler.command = ['صنعبلوجن', 'حذفبلوجن']
handler.rowner = true
export default handler