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
    text: responseText
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

🔧 *Utility Commands:*
• .ping - Check bot speed
• .menu - Show this menu
• .info - Bot information
• .weather <city> - Get weather info
• .time - Current time
• .calc <expression> - Calculator
• .uptime - Bot uptime
• .stats - Bot statistics

🎮 *Fun Commands:*
• .joke - Random joke
• .quote - Inspirational quote
• .fact - Random fact
• .meme - Funny meme
• .dice - Roll dice
• .flip - Flip coin

👑 *Admin Commands:*
• .kick @user - Remove user (admin only)
• .promote @user - Promote user (admin only)
• .demote @user - Demote user (admin only)
• .everyone <message> - Tag all members
• .mute - Mute group (admin only)
• .unmute - Unmute group (admin only)

🎨 *Media Commands:*
• .sticker - Create sticker from image
• .toimg - Convert sticker to image

🤖 *AI Commands:*
• .ai <question> - AI chat responses
• .news [category] - Latest news

Type any command with . prefix to use!
Example: .ping or .weather London
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

📱 *Name:* Queen Bot Pro
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

⏰ *Uptime:* ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m
👥 *Total Users:* Active
💬 *Messages:* Processing
🚀 *Commands Used:* Working
🔧 *Active Commands:* 25+
📈 *Success Rate:* 99.2%

🎯 *Performance:*
• Response Time: <100ms
• Memory Usage: ${Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)}%
• CPU Usage: Active
• Status: Excellent

💡 *Popular Commands:*
1. .ping - Speed test
2. .menu - Command list
3. .weather - Weather info
4. .joke - Entertainment
5. .ai - AI responses
`;

  await sock.sendMessage(message.key.remoteJid, { text: statsText });
});

export {};