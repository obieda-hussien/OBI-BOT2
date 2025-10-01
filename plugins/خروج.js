let handler = async (m, { conn, text, isOwner }) => {
  // لو اللي كاتب مش owner
  if (!isOwner) {
    await conn.reply(m.chat, ' *خد🖕🏻😒* ', m);
    return;
  }

  // لو owner
  let id = text ? text : m.chat;

  // رد رسالة تأكيد الخروج
  await conn.reply(id, '┊❄️┊:•⪼ اخذت امر من مطوري بالخروج', m);

  // اخرج من الجروب
  await conn.groupLeave(id);
};

handler.command = /^(اخرج|اطلع|غادر|خروج)$/i;
handler.group = true;      // الأمر يعمل فقط في الجروبات

export default handler;