import { Queen } from "../lib/event.js";

Queen.addCommand({
  pattern: ["weather"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🌤️",
  desc: "Get weather information",
  usage: ".weather <city>"
}, async (message, sock, args) => {
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a city name!\nUsage: .weather <city>") });
    return;
  }
  
  try {
    const city = args.join(' ');
    // Mock weather data (replace with real API)
    const weather = {
      location: city,
      temperature: Math.floor(Math.random() * 30) + 15,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Partly Cloudy'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 5
    };
    
    const weatherText = `🌤️ *Weather in ${weather.location}*\n\n` +
                       `🌡️ Temperature: ${weather.temperature}°C\n` +
                       `☁️ Condition: ${weather.condition}\n` +
                       `💧 Humidity: ${weather.humidity}%\n` +
                       `💨 Wind Speed: ${weather.windSpeed} km/h\n\n` +
                       `📅 Updated: ${new Date().toLocaleString()}`;
    
    await sock.sendMessage(message.key.remoteJid, { text: weatherText });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to get weather information!") });
  }
});

Queen.addCommand({
  pattern: ["time"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "⏰",
  desc: "Get current time",
  usage: ".time"
}, async (message, sock) => {
  const now = new Date();
  const timeText = `⏰ *Current Time*\n\n📅 Date: ${now.toDateString()}\n🕐 Time: ${now.toLocaleTimeString()}\n🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  
  await sock.sendMessage(message.key.remoteJid, { text: timeText });
});

Queen.addCommand({
  pattern: ["calc", "calculate"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🧮",
  desc: "Mathematical calculator",
  usage: ".calc <expression>"
}, async (message, sock, args) => {
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a mathematical expression!\nExample: .calc 2 + 2") });
    return;
  }
  
  try {
    const expression = args.join(' ');
    // Simple calculator (be careful with eval in production)
    const result = eval(expression.replace(/[^0-9+\-*/().\s]/g, ''));
    
    const calcText = `🧮 *Calculator*\n\n📝 Expression: ${expression}\n🔢 Result: ${result}`;
    await sock.sendMessage(message.key.remoteJid, { text: calcText });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Invalid mathematical expression!") });
  }
});

Queen.addCommand({
  pattern: ["uptime"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "⏱️",
  desc: "Check bot uptime",
  usage: ".uptime"
}, async (message, sock) => {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const uptimeText = `⏱️ *Bot Uptime*\n\n🕐 ${days}d ${hours}h ${minutes}m ${seconds}s\n\n✅ Bot is running smoothly!`;
  
  await sock.sendMessage(message.key.remoteJid, { text: uptimeText });
});

Queen.addCommand({
  pattern: ["translate", "tr"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🌐",
  desc: "Translate text",
  usage: ".translate <text>"
}, async (message, sock, args) => {
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide text to translate!") });
    return;
  }
  
  const text = args.join(' ');
  // Mock translation (replace with real API)
  const translatedText = `Translated: ${text} (This is a demo translation)`;
  
  await sock.sendMessage(message.key.remoteJid, { text: `🌐 *Translation*\n\n${translatedText}` });
});

export {};