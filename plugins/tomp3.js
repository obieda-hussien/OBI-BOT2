import axios from 'axios'
import cheerio from 'cheerio'

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('📥 أرسل رابط الفيديو، مثال:\n.tomp3 https://youtube.com/watch?v=xxxx')

  let videoUrl = args[0]
  let host = 'https://tuberipper.cc/'
  let token = 'bcf4ba58e6747c3ec0956e37a7cae45e' // توكن ثابت

  try {
    // تجهيز بيانات POST
    let form = new URLSearchParams()
    form.append('videoUrl', videoUrl)
    form.append('token', token)

    // ارسال POST
    let res = await axios.post(host, form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 15000
    })

    // تحليل الرد لاستخراج روابط التحميل
    let $ = cheerio.load(res.data)
    let allLinks = []

    $('a').each((i, el) => {
      let href = $(el).attr('href')
      if (href && (href.includes('.m4a') || href.includes('.mp3'))) {
        allLinks.push(href.startsWith('http') ? href : `${host}${href}`)
      }
    })

    if (allLinks.length === 0) return m.reply('❌ لم أجد أي رابط تحميل. ربما الموقع محمي أو الرابط غير صالح.')

    let downloadUrl = allLinks[0]

    await m.reply(`🎧 إليك رابط التحميل:\n${downloadUrl}`)

    // جلب الملف وإرساله (إذا تريد تنزله مباشرة في المحادثة)
    let audio = await conn.getFile(downloadUrl)
    await conn.sendFile(m.chat, audio.data, 'audio.m4a', null, m)

  } catch (err) {
    console.error(err)
    m.reply('❌ حدث خطأ أثناء محاولة تحميل الصوت. حاول مرة أخرى لاحقاً.')
  }
}

handler.command = ['tomp3']
handler.tags = ['downloader']
handler.help = ['tomp3 <youtube-url>']
export default handler