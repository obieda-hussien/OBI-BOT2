let handler = async (m, { conn }) => {
    try {
        if (!m.quoted || (!/imageMessage|videoMessage/.test(m.quoted.mtype))) {
            return conn.sendMessage(m.chat, { text: '🌳 Responde a un mensaje que sea para ver una vez.' }, { quoted: m });
        }

        let media = await m.quoted.download();
        let type = m.quoted.mtype.includes('video') ? 'video' : 'image';

        await conn.sendMessage(m.chat, {
            [type]: media,
            caption: m.quoted.caption || ''
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        conn.sendMessage(m.chat, { text: JSON.stringify(e, null, 2) }, { quoted: m });
    }
};

handler.help = ['فضح'];
handler.tags = ['tools'];
handler.command = ["rvo", "فضح", "viewonce"]

export default handler