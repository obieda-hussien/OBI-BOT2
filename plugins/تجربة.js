import fs from 'fs'
import Jimp from 'jimp'
import { sticker } from '../lib/sticker.js'

async function processEffect(m, conn, q, effectFn, name, value) {
  let img = await q.download()
  let jimp = await Jimp.read(img)
  await effectFn(jimp, value)
  let out = await jimp.getBufferAsync(Jimp.MIME_PNG)
  let stkr = await sticker(out, false, name, 'by Ahmed')
  return conn.sendFile(m.chat, stkr, 'effect.webp', '', m)
}

const effects = {
  blur: j => j.blur(5),
  invert: j => j.invert(),
  grayscale: j => j.grayscale(),
  sepia: j => j.sepia(),
  sharpen: j => j.convolute([
    [ 0, -1,  0],
    [-1,  5, -1],
    [ 0, -1,  0]
  ]),
  brightness: (j, val = 1.2) => j.brightness(val - 1),
  contrast: (j, val = 1.2) => j.contrast(val - 1),
  threshold: (j, val = 128) => {
    j.scan(0, 0, j.bitmap.width, j.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0]
      const green = this.bitmap.data[idx + 1]
      const blue = this.bitmap.data[idx + 2]
      const avg = (red + green + blue) / 3
      const bw = avg > val ? 255 : 0
      this.bitmap.data[idx + 0] = bw
      this.bitmap.data[idx + 1] = bw
      this.bitmap.data[idx + 2] = bw
    })
  },
  saturate: (j, val = 1.5) => {
    j.color([{ apply: 'saturate', params: [ (val - 1) * 100 ] }])
  },
  'hue-rotate': (j, val = 90) => {
    j.color([{ apply: 'hue', params: [val] }])
  },
  pixelate: (j, val = 10) => j.pixelate(val),
  flip: j => j.flip(false, true),
  flop: j => j.flip(true, false),
  tint: (j, val = '#FF0000') => {
    j.color([{ apply: 'mix', params: [val, 50] }])
  },
  opacity: (j, val = 0.5) => {
    j.opacity(val)
  },
  posterize: (j, val = 5) => {
    j.posterize(val)
  },
  duotone: (j, val = ['#000000', '#FFFFFF']) => {
    j.grayscale()
    let [color1, color2] = val
    j.scan(0, 0, j.bitmap.width, j.bitmap.height, function (x, y, idx) {
      let gray = this.bitmap.data[idx]
      let t = gray / 255
      function lerp(a, b, t) { return a + (b - a) * t }
      let c1 = Jimp.cssColorToHex(color1)
      let c2 = Jimp.cssColorToHex(color2)
      let r = lerp((c1 >> 16) & 0xFF, (c2 >> 16) & 0xFF, t)
      let g = lerp((c1 >> 8) & 0xFF, (c2 >> 8) & 0xFF, t)
      let b = lerp(c1 & 0xFF, c2 & 0xFF, t)
      this.bitmap.data[idx + 0] = r
      this.bitmap.data[idx + 1] = g
      this.bitmap.data[idx + 2] = b
    })
  },
  solarize: (j, val = 128) => {
    j.scan(0, 0, j.bitmap.width, j.bitmap.height, function (x, y, idx) {
      for (let i = 0; i < 3; i++) {
        let v = this.bitmap.data[idx + i]
        this.bitmap.data[idx + i] = v > val ? 255 - v : v
      }
    })
  }
}

const requiresValue = new Set([
  'brightness', 'contrast', 'threshold', 'saturate', 'hue-rotate', 'pixelate',
  'tint', 'opacity', 'posterize', 'duotone', 'solarize'
])

const genHandler = (cmd, fn, hasArgs = false) => {
  let handler = async (m, { conn, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = q?.mimetype || ''
    if (!/image\/(jpe?g|png|webp)/.test(mime))
      return m.reply(`🖼️ رجاءً رد على صورة أو ستيكر\n📌 الاستخدام: *${usedPrefix + command} ${hasArgs ? '[قيمة]' : ''}*`)

    let value = undefined
    if (hasArgs) {
      if (!args[0]) return m.reply('⚠️ هذه الأمر يحتاج قيمة، مثال: ' + usedPrefix + command + ' 1.5')
      if (command === 'tint') {
        value = args[0]
        if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return m.reply('⚠️ يرجى إدخال لون هكس صحيح مثل #FF0000')
      } else if (command === 'duotone') {
        if (args.length < 2) return m.reply('⚠️ يرجى إدخال لونين هكس مثل: ' + usedPrefix + command + ' #000000 #FFFFFF')
        value = args.slice(0, 2)
        if (!value.every(c => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c))) return m.reply('⚠️ يرجى إدخال لونين هكس صحيحين')
      } else {
        value = parseFloat(args[0])
        if (isNaN(value)) return m.reply('⚠️ القيمة غير صحيحة')
      }
    }

    await processEffect(m, conn, q, fn, command, value)
  }

  handler.help = [cmd + (hasArgs ? ' [قيمة]' : '')]
  handler.tags = ['image']
  handler.command = new RegExp(`^${cmd}$`, 'i')
  return handler
}

let handlers = [
  genHandler('blur', effects.blur),
  genHandler('invert', effects.invert),
  genHandler('grayscale', effects.grayscale),
  genHandler('sepia', effects.sepia),
  genHandler('sharpen', effects.sharpen),
  genHandler('brightness', effects.brightness, true),
  genHandler('contrast', effects.contrast, true),
  genHandler('threshold', effects.threshold, true),
  genHandler('saturate', effects.saturate, true),
  genHandler('hue-rotate', effects['hue-rotate'], true),
  genHandler('pixelate', effects.pixelate, true),
  genHandler('flip', effects.flip),
  genHandler('flop', effects.flop),
  genHandler('tint', effects.tint, true),
  genHandler('opacity', effects.opacity, true),
  genHandler('posterize', effects.posterize, true),
  genHandler('duotone', effects.duotone, true),
  genHandler('solarize', effects.solarize, true),
]

export default handlers