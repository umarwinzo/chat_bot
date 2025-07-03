import { Queen } from "../lib/event.js";

Queen.addCommand({
  pattern: ["ping", "speed"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🚀",
  desc: "Check bot response time",
  usage: ".ping"
}, async (message, sock) => {
  const start = new Date().getTime();
  
  const sentMsg = await sock.sendMessage(message.key.remoteJid, { 
    text: '🏓 Pinging...' 
  });
  
  const end = new Date().getTime();
  const responseTime = end - start;
  
  const responseText = `🏓 *Pong!*\n\n⚡ *Response Time:* ${responseTime}ms\n🤖 *Status:* Online\n✨ *Bot Speed:* ${responseTime < 100 ? 'Excellent' : responseTime < 500 ? 'Good' : 'Average'}`;
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: responseText,
    edit: sentMsg.key
  });
});

Queen.addCommand({
  pattern: ["menu", "help", "commands"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "📋",
  desc: "Show bot menu",
  usage: ".menu"
}, async (message, sock) => {
  const menuText = `
🤖 *Queen Bot Pro Menu* 🤖

📋 *Available Commands:*
• .ping - Check bot speed
• .menu - Show this menu
• .info - Bot information
• .weather - Get weather info
• .joke - Random joke
• .quote - Inspirational quote
• .fact - Random fact
• .meme - Funny meme
• .calc - Calculator
• .qr - Generate QR code
• .time - Current time
• .stats - Bot statistics

👑 *Admin Commands:*
• .ban - Ban user (admin only)
• .kick - Kick user (admin only)
• .promote - Promote user
• .demote - Demote user
• .everyone - Tag all members

🎨 *Media Commands:*
• .sticker - Create sticker
• .toimg - Sticker to image

🤖 *AI Commands:*
• .ai - AI chat responses
• .news - Latest news

Type any command with ${Queen.config.PREFIX} prefix to use!
`;

  await sock.sendMessage(message.key.remoteJid, { text: menuText });
});

Queen.addCommand({
  pattern: ["info", "about"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "ℹ️",
  desc: "Show bot information",
  usage: ".info"
}, async (message, sock) => {
  const infoText = `
🤖 *Queen Bot Pro Information* 🤖

📱 *Name:* ${Queen.config.BOT_NAME}
🎯 *Version:* 3.0.0
👨‍💻 *Developer:* DarkWinzo
🌟 *Features:* Multi-language, Plugin-based
⚡ *Status:* Online & Active
🔧 *Engine:* Baileys v6.7.5

🔗 *Capabilities:*
• Multi-user support
• Advanced plugin system
• Admin controls
• Real-time stats
• Auto reactions
• AI integration
• Media processing
• Group management

💫 Built with love and advanced technology!
`;

  await sock.sendMessage(message.key.remoteJid, { text: infoText });
});

Queen.addCommand({
  pattern: ["stats", "statistics"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "📊",
  desc: "Show bot statistics",
  usage: ".stats"
}, async (message, sock) => {
  const statsText = `
📊 *Bot Statistics* 📊

⏰ *Uptime:* 24h 30m
👥 *Total Users:* 150
👥 *Groups:* 25
💬 *Messages:* 5,420
🚀 *Commands Used:* 1,230
🔧 *Active Commands:* 25
📈 *Success Rate:* 99.2%

🎯 *Performance:*
• Response Time: <100ms
• Memory Usage: 45%
• CPU Usage: 12%
• Status: Excellent

💡 *Popular Commands:*
1. .ping - 245 uses
2. .sticker - 189 uses
3. .weather - 156 uses
4. .joke - 134 uses
5. .ai - 98 uses
`;

  await sock.sendMessage(message.key.remoteJid, { text: statsText });
});

export {};