import fetch from 'node-fetch';

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args.length) 
            return conn.reply(m.chat, ` *اكتب لينك المستودع 🧰.* 
*مثال :* ${usedPrefix + command} https://github.com/FzTeis/Sylphiette`, m);

        if (!regex.test(args[0])) 
            return conn.reply(m.chat, `⚠️ *اكتب لينك جيت شغال .* `, m);

        let [_, user, repo] = args[0].match(regex) || [];
        repo = repo.replace(/.git$/, '');
        let url = `https://api.github.com/repos/${user}/${repo}/zipball`;

        let response = await fetch(url, { method: 'HEAD' });
        let filename = response.headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];

        m.react('⌛');
        await conn.sendFile(m.chat, url, filename, null, m);
        m.react('🌱');
    } catch (e) {
        return conn.reply(m.chat, JSON.stringify({ error: e.message }, null, 2), m);
    }
};

handler.help = ["جيت"];
handler.command = ["جيت"];
handler.tags = ["download"];

export default handler;