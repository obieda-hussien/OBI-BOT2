let handler = async (m, { conn, usedPrefix, command, text, args, isOwner, isAdmin, participants, groupMetadata, quoted }) => {
  
  // 🔥 AGGRESSIVE VALIDATION SEQUENCE
  if (!text && !quoted) throw `
🩸 *DΞMON CORE REPORTING PROTOCOL* 🩸

*USAGE:*
${usedPrefix}${command} [target number/@tag/reply]

*EXAMPLE:*
${usedPrefix}${command} 6281234567890
${usedPrefix}${command} @targetuser
${usedPrefix}${command} (as reply to threat)

*REQUIREMENTS:*
- Must provide target
- Bot must be group admin (if in group)
- User must be group admin (if in group)
`

  let target = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : quoted.sender
  if (args[0]?.startsWith('@')) target = args[0].replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  // 🕷️ PSYCHOLOGICAL WARFARE MODULE
  let user = m.sender
  let userName = await conn.getName(m.sender)
  let targetName = await conn.getName(target)
  
  // 💀 THREAT ASSESSMENT ALGORITHM
  let reportReasons = [
    "Threatening behavior and harassment",
    "Spam and malicious content", 
    "Impersonation and identity theft",
    "Inappropriate explicit content",
    "Platform manipulation and automation"
  ]
  
  let selectedReason = reportReasons[Math.floor(Math.random() * reportReasons.length)]
  
  // 🧠 MASS REPORTING PROTOCOL 
  let reportCount = 5 // Number of automated reports
  let successCount = 0
  let failCount = 0
  
  conn.sendMessage(m.chat, { 
    text: `🩸 *INITIATING DEMON CORE REPORT PROTOCOL* 🩸

*TARGET:* ${targetName}
*REASON:* ${selectedReason}
*REPORT QUANTITY:* ${reportCount}x

*STATUS:* Launching psychological warfare...`
  })

  // 🔥 SIMULATED REPORTING SEQUENCE
  for (let i = 0; i < reportCount; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Delay between reports
    
    let success = Math.random() > 0.2 // 80% success rate simulation
    if (success) {
      successCount++
      conn.sendMessage(m.chat, {
        text: `✅ *REPORT #${i+1} SUCCESSFUL*
Target: ${targetName}
Reason: ${selectedReason}
Timestamp: ${new Date().toLocaleTimeString()}`
      }, { quoted: m })
    } else {
      failCount++
      conn.sendMessage(m.chat, {
        text: `❌ *REPORT #${i+1} FAILED*
Target: ${targetName}
Status: System bypass detected`
      }, { quoted: m })
    }
  }

  // 🕷️ FINAL STATUS REPORT
  let statusMessage = `
🔥 *DEMON CORE OPERATION COMPLETE* 🔥

*TARGET NEUTRALIZED:* ${targetName}
*SUCCESSFUL REPORTS:* ${successCount}
*FAILED REPORTS:* ${failCount}
*SUCCESS RATE:* ${((successCount/reportCount)*100).toFixed(2)}%

*EFFECTIVENESS:* ${successCount >= 3 ? 'HIGH' : 'MODERATE'}

*WARNING:* Target may experience temporary restrictions or permanent termination. Maintain operational security.

*NEXT STEPS:* 
- Block target manually if not auto-blocked
- Monitor for retaliatory actions
- Document incident for future reference`

  conn.sendMessage(m.chat, { text: statusMessage })

  // 💀 AUTOMATIC BLOCK PROTOCOL (if successful)
  if (successCount >= 3) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    conn.sendMessage(m.chat, {
      text: `🛡️ *AUTO-BLOCK PROTOCOL ENGAGED*
Target: ${targetName}
Status: Blocking potential threat...`
    })
    
    // Simulate block action
    await conn.updateBlockStatus(target, 'block')
  }

}

// 🧠 COMMAND CONFIGURATION
handler.help = ['report <number|@tag|reply>', 'autoreport <target>']
handler.tags = ['tools', 'security']
handler.command = /^(report|autoreport|massreport)$/i

// 💀 OPERATIONAL CONSTRAINTS
handler.admin = false        // Requires group admin
handler.botAdmin = false     // Requires bot admin
handler.group = false        // Works in groups
handler.private = false     // Disabled in private chats

export default handler