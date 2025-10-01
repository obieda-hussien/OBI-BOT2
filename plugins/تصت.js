const handler = async function (m, { conn, command }) {
  await conn.reply(m.chat, 'شغال يروحي🎀', m);
};

handler.command = ['تصت'];
export default handler;