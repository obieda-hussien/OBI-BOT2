const handler = async function (m, { conn, text }) {
  try {
    let targetGroup = m.chat;

    // استخراج لينك الجروب لو موجود
    const linkRegex = /(https:\/\/chat\.whatsapp\.com\/[0-9A-Za-z]+)/i;
    const match = text ? text.match(linkRegex) : null;

    if (match) {
      const inviteLink = match[1];
      text = text.replace(inviteLink, "").trim();
      try {
        const code = inviteLink.split("/")[3];
        const info = await conn.groupGetInviteInfo(code);
        if (info && info.id) targetGroup = info.id;
      } catch {
        return m.reply("❌ اللينك غير صالح أو لا أملك صلاحية معاينة الجروب.");
      }
    }

    // المشاركين
    const meta = await conn.groupMetadata(targetGroup);
    const users = meta.participants.map(u => u.id);

    // لو في ريبلاي ناخدها كأساس
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || "";

    const isSticker = (q.mtype || "") === "stickerMessage";
    const isGif = (q.mtype || "") === "videoMessage" && q.msg && q.msg.gifPlayback;
    const hasMedia =
      isSticker ||
      isGif ||
      /image|video|audio|document/.test(mime) ||
      /viewOnce/i.test(q.mtype || "");

    if (hasMedia) {
      // تحميل الميديا أو الاستيكر
      const media = await q.download();

      let type = "document";
      if (isSticker) type = "sticker";
      else if (isGif) type = "video";
      else if (/image/i.test(mime)) type = "image";
      else if (/video/i.test(mime)) type = "video";
      else if (/audio/i.test(mime)) type = "audio";

      const content = { mentions: users };
      content[type] = media;

      // لو GIF نحدد خاصية gifPlayback
      if (isGif) content.gifPlayback = true;

      // الكابتشن للنصوص فقط (مش استيكر / فويس)
      if (!isSticker && !isGif && type !== "audio") {
        let captionText = text || q.text || "";
        if (captionText.trim().length) {
          content.caption = captionText.trim();
        }
      }

      if (type === "audio") {
        const isPtt = !!(q.ptt || (q.msg && q.msg.ptt));
        if (isPtt) content.ptt = true;
        content.mimetype = mime || "audio/mpeg";
      }

      if (type === "document") {
        content.fileName = (q.msg && q.msg.fileName) || "file";
        content.mimetype = mime || "application/octet-stream";
      }

      await conn.sendMessage(targetGroup, content);
      return;
    }

    // في حالة النصوص فقط
    let finalText = text || q.text || "";
    if (finalText.trim().length) {
      await conn.sendMessage(targetGroup, {
        text: finalText.trim(),
        mentions: users
      });
    } else {
      m.reply("ℹ️ مفيش محتوى لإرساله.");
    }

  } catch (err) {
    console.error(err);
    m.reply("❌ حصل خطأ أثناء تنفيذ المنشن.");
  }
};

handler.command = ['مشن2'];
handler.owner = false;
handler.group = false;
export default handler;