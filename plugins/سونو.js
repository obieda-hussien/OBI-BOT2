//scrape by DEMON
import axios from "axios"

class SunoAPI {
  constructor() {
    this.baseURL = "https://suno.exomlapi.com"
    this.headers = {
      accept: "*/*",
      "content-type": "application/json",
      origin: "https://suno.exomlapi.com",
      referer: "https://suno.exomlapi.com/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
    }
    this.interval = 3000
    this.timeout = 300000
  }

  async generate({ prompt }) {
    let taskId, token
    try {
      const generateResponse = await axios.post(`${this.baseURL}/generate`, {
        prompt: prompt
      }, {
        headers: this.headers
      })
      ;({ taskId, token } = generateResponse.data)

      const startTime = Date.now()
      while (Date.now() - startTime < this.timeout) {
        await new Promise(resolve => setTimeout(resolve, this.interval))
        const statusResponse = await axios.post(`${this.baseURL}/check-status`, {
          taskId,
          token
        }, {
          headers: this.headers
        })

        if (statusResponse.data.results?.every(res => res.audio_url && res.image_url && res.lyrics)) {
          return statusResponse.data
        }
      }
      return { status: "timeout" }
    } catch (error) {
      return {
        status: "error",
        error: error.message
      }
    }
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(` *╭─❍〈 🎶 𝐒𝐔𝐍𝐎 𝐀𝐈 𝐌𝐔𝐒𝐈𝐂 〉❍─╮* 
 *│⌲ اكتب الأمر بالشكل ده ⬇️* 
 *│⌲ مثال : اغنية FORZEN* 
 *╰───═❍⊱❁✿❁⊰❍═───╯* `)

  m.reply(` *╭─❍〈 🎶 𝐒𝐔𝐍𝐎 𝐀𝐈 𝐌𝐔𝐒𝐈𝐂 〉❍─╮* 
 *│⌲ الأغنية علي وصول 🎧✨* 
 *│⌲ استني دقيقتين وهتجهز ⏳* 
 *╰───═❍⊱❁✿❁⊰❍═───╯* `)

  const api = new SunoAPI()
  const result = await api.generate({ prompt: text })

  if (result.status === "error") return m.reply(`وقع خطأ: ${result.error}`)
  if (result.status === "timeout") return m.reply("انتهى الوقت دون الحصول على النتائج")

  for (let item of result.results) {
    await conn.sendFile(m.chat, item.audio_url, 'audio.mp3', `Lyrics:\n${item.lyrics}`, m)
    await conn.sendFile(m.chat, item.image_url, 'image.jpg', '', m)
  }
}

handler.help = ['اغنية', 'اغنيه', 'suno']
handler.tags = ['ai']
handler.command = ['اغنية', 'اغنيه', 'suno']
handler.limit = true
export default handler