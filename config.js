import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

global.rowner = [
  ['201210850141', " AHMEDELUTUPER", true],
['201507551167', "AHMEDELUTUPER", true],
]
global.owner = [['201507551167', "AHMEDELUTUPER", true], ]
global.onlyBotCanUse = true; // تعني إن الأوامر تشتغل بس لو البوت هو المرسل
global.mods = [] 
global.prems = []
global.APIs = {
  xteam: 'https://api.xteam.xyz', 
  nrtm: 'https://fg-nrtm.ddns.net',
  bg: 'http://bochil.ddns.net',
  fgmods: 'https://api-fgmods.ddns.net'
}
global.APIKeys = {
  'https://api.xteam.xyz': 'd90a9e986e18778b',
  'https://zenzapis.xyz': '675e34de8a', 
  'https://api-fgmods.ddns.net': 'TU-APIKEY'
}

// Sticker WM & البادئة
global.prefijo = ""; // اتركها فارغة لتعدد البادئات
global.packname = "ѕуℓρнιєттє'ѕ | αℓρнα ν1";
global.footer = "ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ ɪ'ᴍ ғᴢ ~";
global.wm = "ѕуℓρнιєттє'ѕ | αℓρнα ν1";
global.author = "ɪ'ᴍ ғᴢ ~"
global.link = 'https://chat.whatsapp.com/JQMyVsc8U4iEHi7qLFgYNH';
global.logo = 'https://files.cloudmini.net/download/xO27.jpeg'; 

global.wait = "\`جاري التحميل . . . انتظر لحظة.\`"
global.rwait = '⌛'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌' 
global.xmoji = '🔥' 
//############
global.imagen = fs.readFileSync('./src/img.jpg');
global.cheerio = cheerio;
global.fs = fs;
global.fetch = fetch;
global.axios = axios;
global.moment = moment;
//############
global.jadi = "Data/Sesiones/Subbots"
global.Sesion = "Data/Sesiones/Principal"
global.dbname = "Data/database.json"

//Tiempo del bot
global.d = new Date(new Date + 3600000)
global.locale = 'ar'
global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
global.fecha = d.toLocaleDateString('ar', { day: 'numeric', month: 'numeric', year: 'numeric' })
global.mes = d.toLocaleDateString('ar', { month: 'long' })
global.año = d.toLocaleDateString('ar', { year: 'numeric' })
global.tiempo = d.toLocaleString('ar', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
global.botdate = `⫹⫺ Date :  ${moment.tz('America/Los_Angeles').format('DD/MM/YY')}` //Asia/Jakarta
global.bottime = `𝗧 𝗜 𝗠 𝗘 : ${moment.tz('America/Los_Angeles').format('HH:mm:ss')}`

global.multiplier = 250
global.maxwarn = '2' // أقصى عدد للتحذيرات

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("تحديث ملف 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
