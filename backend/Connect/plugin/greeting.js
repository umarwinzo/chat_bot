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
  const greetings = Queen.getString("GREETINGS") || [
    "👋 Hello there! How can I help you today?",
    "🤖 Hi! I'm your friendly bot assistant!",
    "✨ Hey! Ready to explore what I can do?",
    "🌟 Greetings! Let's make something awesome together!",
    "💫 Hello! Type .menu to see what I can do!"
  ];
  
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  await sock.sendMessage(message.key.remoteJid, { text: randomGreeting });
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
  const morningText = "🌅 Good Morning! Hope you have a wonderful day ahead! ☀️✨";
  await sock.sendMessage(message.key.remoteJid, { text: morningText });
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
  const nightText = "🌙 Good Night! Sweet dreams and rest well! 💤✨";
  await sock.sendMessage(message.key.remoteJid, { text: nightText });
});

export {};