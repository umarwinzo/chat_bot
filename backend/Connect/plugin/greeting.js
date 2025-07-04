import { Queen } from "../lib/event.js";

// Auto-reply for greeting without prefix
Queen.addCommand({
  pattern: ["hi", "hello", "hey", "helo", "hii"],
  category: "greeting",
  onlyPm: false,
  onlyGroup: false,
  React: "👋",
  fromMe: false,
  desc: "Greeting response",
  usage: "hi"
}, async (message, sock) => {
  const greetings = [
    "👋 Hello there! How can I help you today?",
    "🤖 Hi! I'm your friendly bot assistant!",
    "✨ Hey! Ready to explore what I can do?",
    "🌟 Greetings! Let's make something awesome together!",
    "💫 Hello! Type .menu to see what I can do!",
    "🎉 Hi there! Welcome to Queen Bot Pro!",
    "🚀 Hey! Ready for some bot magic?",
    "💎 Hello! Your personal assistant is here!"
  ];
  
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `${randomGreeting}\n\n💡 *Quick commands:*\n• .menu - See all commands\n• .ping - Test bot speed\n• .help - Get help\n\n🤖 *Queen Bot Pro at your service!*` 
  });
});

Queen.addCommand({
  pattern: ["good morning", "gm", "morning"],
  category: "greeting",
  onlyPm: false,
  onlyGroup: false,
  React: "🌅",
  fromMe: false,
  desc: "Morning greeting",
  usage: "good morning"
}, async (message, sock) => {
  const morningTexts = [
    "🌅 Good Morning! Hope you have a wonderful day ahead! ☀️✨",
    "🌞 Rise and shine! Wishing you a fantastic morning! 🌟",
    "☀️ Good Morning! May your day be filled with joy and success! 🎉",
    "🌅 Morning! Ready to conquer the day? Let's go! 💪",
    "🌞 Good Morning! Another beautiful day to achieve great things! ✨"
  ];
  
  const randomMorning = morningTexts[Math.floor(Math.random() * morningTexts.length)];
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `${randomMorning}\n\n💡 *Start your day with:*\n• .weather <city> - Check weather\n• .news - Latest updates\n• .quote - Daily inspiration\n\n🤖 *Have a great day!*` 
  });
});

Queen.addCommand({
  pattern: ["good night", "gn", "night"],
  category: "greeting",
  onlyPm: false,
  onlyGroup: false,
  React: "🌙",
  fromMe: false,
  desc: "Night greeting",
  usage: "good night"
}, async (message, sock) => {
  const nightTexts = [
    "🌙 Good Night! Sweet dreams and rest well! 💤✨",
    "🌟 Sleep tight! May you have peaceful dreams! 😴",
    "🌙 Good Night! Tomorrow is another day full of possibilities! 🌟",
    "💤 Rest well! Recharge for another amazing day ahead! ✨",
    "🌙 Good Night! May your dreams be as wonderful as you are! 💫"
  ];
  
  const randomNight = nightTexts[Math.floor(Math.random() * nightTexts.length)];
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `${randomNight}\n\n🌟 *Sweet dreams!*\n\n🤖 *Queen Bot Pro wishes you well!*` 
  });
});

Queen.addCommand({
  pattern: ["how are you", "how r u", "wassup", "whatsup"],
  category: "greeting",
  onlyPm: false,
  onlyGroup: false,
  React: "😊",
  fromMe: false,
  desc: "How are you response",
  usage: "how are you"
}, async (message, sock) => {
  const responses = [
    "😊 I'm doing great! Thanks for asking! How about you?",
    "🤖 I'm functioning perfectly! Ready to help you with anything!",
    "✨ I'm fantastic! What can I do for you today?",
    "🚀 I'm running smoothly! How can I assist you?",
    "💫 I'm excellent! Always ready to help my users!",
    "🌟 I'm doing wonderful! What brings you here today?"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `${randomResponse}\n\n💡 *I can help you with:*\n• Commands (.menu)\n• Weather updates\n• Fun activities\n• And much more!\n\n🤖 *Queen Bot Pro*` 
  });
});

export {};