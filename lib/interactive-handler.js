import { proto, generateWAMessage, areJidsSameUser } from '@whiskeysockets/baileys';

export async function all(m, chatUpdate) {

  if (m.isBaileys || !m.message) return;

  let id =

    m.message.buttonsResponseMessage?.selectedButtonId ||

    m.message.templateButtonReplyMessage?.selectedId ||

    m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||

    (m.message.interactiveResponseMessage

      ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || '{}')?.id

      : null);

  if (!id) return;

  const text =

    m.message.buttonsResponseMessage?.selectedDisplayText ||

    m.message.templateButtonReplyMessage?.selectedDisplayText ||

    m.message.listResponseMessage?.title ||

    '';

  let isIdMessage = false;

  let usedPrefix = '';

  for (const name in global.plugins) {

    const plugin = global.plugins[name];

    if (!plugin?.command || typeof plugin !== 'function') continue;

    const _prefix = plugin.customPrefix || global.prefijo || '.';

    const str2Regex = s => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

    const match = (_prefix instanceof RegExp

      ? [[_prefix.exec(id), _prefix]]

      : Array.isArray(_prefix)

        ? _prefix.map(p => {

            const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));

            return [re.exec(id), re];

          })

        : [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]]

    ).find(p => p[1]);

    if ((usedPrefix = match?.[0]?.[0] || '')) {

      const noPrefix = id.replace(usedPrefix, '');

      let [command] = noPrefix.trim().split(/\s+/);

      command = (command || '').toLowerCase();

      const isMatch = plugin.command instanceof RegExp

        ? plugin.command.test(command)

        : Array.isArray(plugin.command)

          ? plugin.command.some(cmd =>

              cmd instanceof RegExp ? cmd.test(command) : cmd === command)

          : typeof plugin.command === 'string'

            ? plugin.command === command

            : false;

      if (isMatch) {

        isIdMessage = true;

        break;

      }

    }

  }

  const messages = await generateWAMessage(m.chat, {

    text: isIdMessage ? id : text,

    mentions: m.mentionedJid

  }, {

    userJid: this.user.id,

    quoted: m.quoted?.fakeObj

  });

  messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);

  messages.key.id = m.key.id;

  messages.pushName = m.pushName;

  if (m.isGroup) messages.key.participant = messages.participant = m.sender;

  const msg = {

    ...chatUpdate,

    messages: [proto.WebMessageInfo.fromObject(messages)].map(v => (v.conn = this, v)),

    type: 'append',

  };

  this.ev.emit('messages.upsert', msg);

}