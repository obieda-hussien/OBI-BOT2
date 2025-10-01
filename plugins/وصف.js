import { GoogleGenerativeAI } from "@google/generative-ai";
import FormData from "form-data";
import { fileTypeFromBuffer } from "file-type";

const apikeynyah = "AIzaSyB3Q74etnADQ_qSX3OJtzTnteGh-fd4df8"; // غيّر المفتاح هنا لو حبيت

async function upload(buffer) {
  let { ext } = await fileTypeFromBuffer(buffer);
  let bodyForm = new FormData();
  bodyForm.append("fileToUpload", buffer, "file." + ext);
  bodyForm.append("reqtype", "fileupload");

  let res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: bodyForm,
  });

  let data = await res.text();
  return data;
}

const handler = async (m, { conn }) => {
  if (!m.quoted || !/image/.test(m.quoted.mimetype))
    return m.reply("❌ من فضلك رد على صورة لتحليلها.");

  const imgBuffer = await m.quoted.download();
  if (!imgBuffer) return m.reply("❌ فشل تحميل الصورة.");

  try {
    await conn.sendPresenceUpdate("composing", m.chat);

    // رفع الصورة لموقع خارجي للحصول على رابط
    const link = await upload(imgBuffer);

    const genAI = new GoogleGenerativeAI(apikeynyah);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // نرسل للصورة والرابط مع نص طلب الوصف
    const result = await model.generateContent([
      {
        inlineData: {
          data: imgBuffer.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      "صف هذه الصورة باللغة العربية."
    ]);

    const description = result.response.text();

    if (!description) return m.reply("❌ لم أتمكن من وصف الصورة.");

    await m.reply(`🖼️ وصف الصورة:\n\n${description}`);
  } catch (e) {
    console.error(e);
    m.reply("❌ حدث خطأ أثناء تحليل الصورة.");
  }
};

handler.command = ["describe", "وصف", "وصفصورة"];
export default handler;