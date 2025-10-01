import { sticker } from '../lib/sticker.js'
import sharp from 'sharp'
import axios from "axios"
import FormData from "form-data"

const api = axios.create({ baseURL: "https://api4g.iloveimg.com" })

const getTaskId = async () => {
    const { data: html } = await axios.get("https://www.iloveimg.com/id/hapus-latar-belakang")
    api.defaults.headers.post["authorization"] = `Bearer ${html.match(/ey[a-zA-Z0-9?%-_/]+/g)[1]}`
    return html.match(/taskId = '(\w+)/)[1]
}

const uploadImageToServer = async (imageBuffer) => {
    const taskId = await getTaskId()
    const fileName = Math.random().toString(36).slice(2) + ".jpg"
    const form = new FormData()
    form.append("name", fileName)
    form.append("chunk", "0")
    form.append("chunks", "1")
    form.append("task", taskId)
    form.append("preview", "1")
    form.append("file", imageBuffer, fileName)

    const reqUpload = await api.post("/v1/upload", form, { headers: form.getHeaders() }).catch((e) => e.response)
    if (reqUpload.status !== 200) throw reqUpload.data || reqUpload.statusText

    return { serverFilename: reqUpload.data.server_filename, taskId }
}

const removeBg = async (imageBuffer) => {
    const { serverFilename, taskId } = await uploadImageToServer(imageBuffer)
    const form = new FormData()
    form.append("task", taskId)
    form.append("server_filename", serverFilename)

    const reqRmbg = await api.post("/v1/removebackground", form, {
        headers: form.getHeaders(),
        responseType: "arraybuffer"
    }).catch((e) => e.response)

    const type = reqRmbg.headers["content-type"]
    if (reqRmbg.status !== 200 || !/image/.test(type)) throw new Error("فشل في إزالة الخلفية")

    return reqRmbg.data
}

let handler = async (m, { conn, args }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image/.test(mime)) return m.reply("🖼️ رد على صورة لتحويلها إلى ستيكر بدون خلفية")

    let img = await q.download?.()
    if (!img) return m.reply("⚠️ لم أستطع تحميل الصورة")

    try {
        // ✅ تصغير قبل الإرسال
        let resized = await sharp(img).resize({ width: 1024 }).toBuffer()
        let cleanImg = await removeBg(resized)

        // ✅ تحويل نهائي لستيكر
        const buffer = await sharp(cleanImg)
            .resize(512, 512, {
                fit: 'cover',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp()
            .toBuffer()

        let txt = args.join(' ')
        let pack = global.wm
        let author = global.author
        if (txt) {
            const parts = txt.split("|")
            pack = (parts[0] || '').trim() || global.wm
            author = (parts[1] || '').trim() || global.author
        }

        const stiker = await sticker(buffer, false, pack, author)
        if (stiker) {
            return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        } else {
            return m.reply("❌ فشل تحويل الصورة إلى ستيكر.")
        }
    } catch (e) {
        console.error(e)
        return m.reply("❌ حدث خطأ أثناء المعالجة.")
    }
}

handler.help = ['ستيك2']
handler.tags = ['tools']
handler.command = ['ستيك2']

export default handler