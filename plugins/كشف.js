import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(m.chat, `⚠️ من فضلك اكتب كلمة للبحث عنها\nمثال:\n${usedPrefix}كشف plugin`, m)
  }

  await conn.reply(m.chat, `🔍 جاري البحث عن "${text}" في ملفات البلوجن داخل مجلد plugins...`, m)

  const basePath = './plugins'
  let files
  try {
    files = fs.readdirSync(basePath).filter(f => f.endsWith('.js'))
  } catch (e) {
    return conn.reply(m.chat, `❌ لم أتمكن من قراءة مجلد plugins: ${e.message}`, m)
  }

  const matchedResults = []
  const fileReadErrors = []

  // الأنماط المهمة للفلترة (يمكن تعديلها حسب بنية البلوجن الخاصة بك)
  const validPatterns = [
    /handler\.command\s*=\s*.*/,    // handler.command = ['cmd']
    /handler\.command\s*=\s*\/\^.*\$\//, // handler.command = /^cmd$/i
    /handler\.help\s*=\s*.*/,       // handler.help = ['help']
    /handler\.tags\s*=\s*.*/,       // handler.tags = ['tag']
    /export\s+default\s+handler/,       // export default handler
    /async\s+function\s+handler/,       // تعريف الدالة handler
  ]

  for (const fileName of files) {
    const filePath = path.join(basePath, fileName)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, idx) => {
        if (line.includes(text)) {
          // تحقق هل السطر يطابق أحد الأنماط المهمة
          if (validPatterns.some(pattern => pattern.test(line))) {
            matchedResults.push({
              fileName,
              lineNumber: idx + 1,
              lineContent: line.trim()
            })
          }
        }
      })
    } catch (err) {
      fileReadErrors.push({ fileName, error: err.message })
    }
  }

  if (matchedResults.length > 0) {
    let replyText = `✅ تم العثور على "${text}" في ملفات البلوجن:\n\n`
    matchedResults.forEach(({ fileName, lineNumber, lineContent }) => {
      replyText += `📄 الملف: ${fileName}\n🔢 السطر: ${lineNumber}\n➡️ ${lineContent}\n\n`
    })
    return conn.reply(m.chat, replyText.trim(), m)
  } else {
    let errorText = `❌ لم يتم العثور على "${text}" في ملفات البلوجن ضمن مجلد plugins.\n`
    if (fileReadErrors.length > 0) {
      errorText += '\n⚠️ أخطاء أثناء قراءة بعض الملفات:\n'
      fileReadErrors.forEach(({ fileName, error }) => {
        errorText += `- الملف: ${fileName}\n  السبب: ${error}\n`
      })
    }
    return conn.reply(m.chat, errorText.trim(), m)
  }
}

handler.help = ['كشف *<كلمة>*']
handler.tags = ['owner']
handler.command = ['كشف']
handler.rowner = true

export default handler