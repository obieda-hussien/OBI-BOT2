let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text: ' *🙈دوس يقلبي* ',
    footer: 'DEMON',
    buttons: [
      {
        buttonId: '.تم',
        buttonText: {
          displayText: '🌝🍷دوس '
        },
        type: 1
      }
    ],
    viewOnce: true,
    headerType: 1
  }, { quoted: m });
};

handler.command = ['زر']; // لما المستخدم يكتب .زر
handler.help = ['زر'];
handler.tags = ['test'];

export default handler;