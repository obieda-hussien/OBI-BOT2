const handler = async (m, { conn, isOwner, text }) => {
  try {
    // لو الرسالة من نوع ViewOnce
    if (m.mtype && m.mtype.includes("viewOnce") && !isOwner) {
      let media = await conn.downloadMediaMessage(m);

      if (/image/.test(m.msg.mimetype)) {
        await conn.sendFile(
          m.chat,
          media,
          Date.now() + ".jpg",
          m.msg?.caption || text || "",
          m
        );
      } else if (/video/.test(m.msg.mimetype)) {
        await conn.sendFile(
          m.chat,
          media,
          Date.now() + ".mp4",
          m.msg?.caption || text || "",
          m
        );
      } else if (/audio/.test(m.msg.mimetype)) {
        await conn.sendFile(
          m.chat,
          media,
          Date.now() + ".mp3",
          "",
          m,
          null,
          { mimetype: "audio/mp4", ptt: true } // بيرجع كـ فويس نوت
        );
      }
    }
  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, "❌ خطأ: " + e.message, m);
  }
};

// ده Event مش أمر
handler.customPrefix = /^$/;
handler.command = new RegExp; 
handler.group = false; // يشتغل في الجروبات والخاص مع بعض
export default handler;