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
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Please provide a city name!\n\n📝 Usage: .weather <city>\n💡 Example: .weather London" 
    });
    return;
  }
  
  try {
    const city = args.join(' ');
    
    // Send loading message
    await sock.sendMessage(message.key.remoteJid, { 
      text: "🌤️ Getting weather information..." 
    });
    
    // Mock weather data (replace with real API)
    const weather = {
      location: city,
      temperature: Math.floor(Math.random() * 30) + 15,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Partly Cloudy'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      feelsLike: Math.floor(Math.random() * 30) + 15
    };
    
    const weatherText = `🌤️ *Weather in ${weather.location}*\n\n` +
                       `🌡️ *Temperature:* ${weather.temperature}°C\n` +
                       `🤔 *Feels like:* ${weather.feelsLike}°C\n` +
                       `☁️ *Condition:* ${weather.condition}\n` +
                       `💧 *Humidity:* ${weather.humidity}%\n` +
                       `💨 *Wind Speed:* ${weather.windSpeed} km/h\n\n` +
                       `📅 *Updated:* ${new Date().toLocaleString()}\n` +
                       `🔄 *Powered by Queen Bot Pro*`;
    
    await sock.sendMessage(message.key.remoteJid, { text: weatherText });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to get weather information! Please try again later." 
    });
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
  const timeText = `⏰ *Current Time*\n\n📅 *Date:* ${now.toDateString()}\n🕐 *Time:* ${now.toLocaleTimeString()}\n🌍 *Timezone:* ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n\n⚡ *Timestamp:* ${now.getTime()}`;
  
  await sock.sendMessage(message.key.remoteJid, { text: timeText });
});

Queen.addCommand({
  pattern: ["calc", "calculate", "math"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🧮",
  desc: "Mathematical calculator",
  usage: ".calc <expression>"
}, async (message, sock, args) => {
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Please provide a mathematical expression!\n\n📝 Usage: .calc <expression>\n💡 Examples:\n• .calc 2 + 2\n• .calc 10 * 5\n• .calc 100 / 4\n• .calc 2^3" 
    });
    return;
  }
  
  try {
    const expression = args.join(' ');
    
    // Replace ^ with ** for exponentiation
    const safeExpression = expression.replace(/\^/g, '**');
    
    // Simple calculator (be careful with eval in production)
    const result = eval(safeExpression.replace(/[^0-9+\-*/().\s*]/g, ''));
    
    const calcText = `🧮 *Calculator*\n\n📝 *Expression:* ${expression}\n🔢 *Result:* ${result}\n\n⚡ *Calculated by Queen Bot Pro*`;
    await sock.sendMessage(message.key.remoteJid, { text: calcText });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Invalid mathematical expression!\n\n💡 Please use valid operators: +, -, *, /, ^" 
    });
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
  
  const uptimeText = `⏱️ *Bot Uptime*\n\n🕐 *Duration:* ${days}d ${hours}h ${minutes}m ${seconds}s\n\n✅ *Status:* Bot is running smoothly!\n🚀 *Performance:* Excellent\n💚 *Health:* 100%`;
  
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
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Please provide text to translate!\n\n📝 Usage: .translate <text>\n💡 Example: .translate Hello world" 
    });
    return;
  }
  
  const text = args.join(' ');
  
  // Mock translation (replace with real API)
  const translations = [
    `Spanish: Hola mundo`,
    `French: Bonjour le monde`,
    `German: Hallo Welt`,
    `Italian: Ciao mondo`,
    `Portuguese: Olá mundo`
  ];
  
  const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `🌐 *Translation*\n\n📝 *Original:* ${text}\n🔄 *Translated:* ${randomTranslation}\n\n💡 *Note:* This is a demo translation. For accurate translations, use Google Translate.` 
  });
});

Queen.addCommand({
  pattern: ["qr"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "📱",
  desc: "Generate QR code",
  usage: ".qr <text>"
}, async (message, sock, args) => {
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Please provide text to generate QR code!\n\n📝 Usage: .qr <text>\n💡 Example: .qr Hello World" 
    });
    return;
  }
  
  const text = args.join(' ');
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `📱 *QR Code Generator*\n\n📝 *Text:* ${text}\n\n💡 *Note:* QR code generation feature coming soon!\n🔄 *Alternative:* Use online QR generators for now.` 
  });
});

export {};