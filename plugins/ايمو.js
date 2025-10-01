import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';

const handler = async (m, { args, conn }) => {
    if (!args[0]) return m.reply(" *مثال :*  ايمو 🐤");
    
    try {
        const unicode = emojiUnicode(args[0]);
        const url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicode}/512.webp`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Failed to download the emoji image.');
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = await getMimeTypeFromBuffer(buffer);

        if (!/image/.test(mimeType)) return;

        await conn.sendFile(m.chat, url, "", "", m);
    } catch (e) {
        // No error reply
    }
};

handler.command = ["ايمو"];
handler.help = ["ايمو"];
handler.tags = ["sticker"];
handler.noCmdStore = true;
handler.onlyGroup = true;
handler.limit = true;
export default handler;

async function getMimeTypeFromBuffer(buffer) {
    const type = await fileTypeFromBuffer(buffer);
    return type ? type.mime : null;
}

function emojiUnicode(input) {
    return emojiUnicode.raw(input).split(' ').map(val => {
        return parseInt(val).toString(16);
    }).join(' ');
}

emojiUnicode.raw = function (input) {
    if (input.length === 1) {
        return input.charCodeAt(0).toString();
    } else if (input.length > 1) {
        const pairs = [];
        for (let i = 0; i < input.length; i++) {
            if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) {
                if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
                    pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + 
                               (input.charCodeAt(i + 1) - 0xdc00) + 0x10000);
                }
            } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
                pairs.push(input.charCodeAt(i));
            }
        }
        return pairs.join(' ');
    }
    return '';
};