const { Queen } = require("../lib/event");

Queen.addCommand({
  pattern: ["weather"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🌤️",
  desc: "Get weather information",
  usage: ".weather <city>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a city name!\nUsage: .weather <city>") });
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
    
    await client.sendMessage(message.key.remoteJid, { text: weatherText });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to get weather information!") });
  }
});

Queen.addCommand({
  pattern: ["translate", "tr"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🌐",
  desc: "Translate text",
  usage: ".translate <text>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide text to translate!") });
    return;
  }
  
  const text = args.join(' ');
  // Mock translation (replace with real API)
  const translatedText = `Translated: ${text} (This is a demo translation)`;
  
  await client.sendMessage(message.key.remoteJid, { text: `🌐 *Translation*\n\n${translatedText}` });
});

Queen.addCommand({
  pattern: ["qr"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "📱",
  desc: "Generate QR code",
  usage: ".qr <text>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide text for QR code!") });
    return;
  }
  
  const text = args.join(' ');
  await client.sendMessage(message.key.remoteJid, { text: Queen.infoMessage(`QR code for: ${text}\n(QR generation feature coming soon!)`) });
});

Queen.addCommand({
  pattern: ["time"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "⏰",
  desc: "Get current time",
  usage: ".time"
}, async (message, client) => {
  const now = new Date();
  const timeText = `⏰ *Current Time*\n\n📅 Date: ${now.toDateString()}\n🕐 Time: ${now.toLocaleTimeString()}\n🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  
  await client.sendMessage(message.key.remoteJid, { text: timeText });
});

Queen.addCommand({
  pattern: ["calc", "calculate"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🧮",
  desc: "Mathematical calculator",
  usage: ".calc <expression>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a mathematical expression!\nExample: .calc 2 + 2") });
    return;
  }
  
  try {
    const expression = args.join(' ');
    // Simple calculator (be careful with eval in production)
    const result = eval(expression.replace(/[^0-9+\-*/().\s]/g, ''));
    
    const calcText = `🧮 *Calculator*\n\n📝 Expression: ${expression}\n🔢 Result: ${result}`;
    await client.sendMessage(message.key.remoteJid, { text: calcText });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Invalid mathematical expression!") });
  }
});

module.exports = {};