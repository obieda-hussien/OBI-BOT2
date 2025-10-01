import yts from "yt-search";
import axios from "axios";
import FormData from "form-data";
import { yta } from "./_ytdl.js"; // نفس دالة الكود التاني

const limit = 100;

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply("📌 *اكتب اسم او رابط فيديو علي اليوتيوب.*");

  m.react("⏳");

  const res = await yts(text);
  if (!res || !res.all || res.all.length === 0) {
    return m.reply("❌ لم يتم العثور على نتائج.");
  }

  const video = res.all[0];
  const videoUrl = video.url;

  const caption = `\`\`\`⊜─⌈ 📻 ◜تشغيل يوتيوب◞ 📻 ⌋─⊜\`\`\`
≡ 🌿 *العنوان* : » ${video.title}
≡ 🌾 *المؤلف* : » ${video?.author?.name || "غير متوفر"}
≡ 🌱 *المدة* : » ${video?.duration?.timestamp || "غير متوفر"}
≡ 🌴 *المشاهدات* : » ${video.views}
≡ ☘️ *الرابط* : » ${videoUrl}`;

  await conn.sendFile(m.chat, await (await fetch(video.thumbnail)).buffer(), "thumb.jpg", caption, m);

  try {
    // 🎵 شغل (mp3) — مع fallback
    if (command === "شغل") {
      try {
        const api = await yta(videoUrl);

        try {
          // المحاولة الأولى: إرسال الرابط مباشرة
          await conn.sendFile(m.chat, api.result.download, api.result.title, "", m);
          await m.react("✔️");
        } catch (err) {
          // fallback: تحميل الملف من الرابط ثم إرساله كبفر
          const { data } = await axios.get(api.result.download, { responseType: "arraybuffer" });
          await conn.sendFile(m.chat, data, api.result.title + ".mp3", "", m);
          await m.react("✔️");
        }
      } catch (error) {
        return m.reply("❌ خطأ أثناء التحميل: " + error.message);
      }

    // 🎬 شغل2 (mp4) — كما في الكود الأول بدون تغيير
    } else if (command === "شغل2" || command === "شغل فيد") {
      const result = await ytdl(videoUrl, "720");
      if (!result.success) throw new Error(result.error.message);

      const response = await axios.head(result.data.downloadUrl);
      const sizeMB = Number(response.headers["content-length"]) / (1024 * 1024);
      const asDocument = sizeMB >= limit;

      await conn.sendFile(
        m.chat,
        result.data.downloadUrl,
        result.data.title,
        `🎬 *${result.data.title}*\n📥 الجودة: ${result.data.quality}`,
        m,
        null,
        { mimetype: "video/mp4", asDocument }
      );

      await m.react("✔️");
    }

  } catch (error) {
    return m.reply("❌ خطأ أثناء التحميل: " + error.message);
  }
};

handler.help = ["شغل", "شغل2"];
handler.tags = ["تنزيل"];
handler.command = ["شغل", "شغل2", "شغل فيد"];

export default handler;

// ✅ دالة ytdl كما في الكود الأول بدون تعديل
async function ytdl(url, quality = "720") {
  try {
    const validQuality = { "480": 480, "1080": 1080, "720": 720, "360": 360, "audio": "mp3" };
    if (!validQuality[quality]) {
      return {
        success: false,
        error: { message: "⚠️ الجودة غير مدعومة. الجودات: " + Object.keys(validQuality).join(", ") }
      };
    }

    const q = validQuality[quality];
    const { data: start } = await axios.get(
      `https://p.oceansaver.in/ajax/download.php?button=1&start=1&end=1&format=${q}&iframe_source=https://allinonetools.com/&url=${encodeURIComponent(url)}`,
      {
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    );

    if (!start || !start.progress_url) return { success: false, error: { message: "فشل بدء التحميل." } };

    let attempts = 0;
    let maxAttempts = 40;
    let datas;

    while (attempts < maxAttempts && !datas?.download_url) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const { data } = await axios.get(start.progress_url, {
          timeout: 15000,
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        datas = data;
      } catch {}
      attempts++;
    }

    if (!datas?.download_url) return { success: false, error: { message: "⏱️ العملية استغرقت وقتًا طويلاً." } };

    return {
      success: true,
      data: {
        title: start.info?.title || "Unknown Title",
        image: start.info?.image || "",
        downloadUrl: datas.download_url,
        quality,
        type: quality === "audio" ? "mp3" : "mp4"
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error?.response?.data?.message || error.message || "❌ خطأ أثناء تحميل الفيديو." }
    };
  }
}