import { Queen } from "../lib/event.js";

Queen.addCommand({
  pattern: ["joke"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "😂",
  desc: "Get a random joke",
  usage: ".joke"
}, async (message, sock) => {
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything! 😄",
    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the math book look so sad? Because it had too many problems! 📚",
    "What do you call a sleeping bull? A bulldozer! 🐂",
    "Why don't skeletons fight each other? They don't have the guts! 💀",
    "What do you call a bear with no teeth? A gummy bear! 🐻",
    "Why don't programmers like nature? It has too many bugs! 🐛",
    "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭"
  ];
  
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  await sock.sendMessage(message.key.remoteJid, { text: `😂 *Random Joke*\n\n${randomJoke}` });
});

Queen.addCommand({
  pattern: ["quote"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "✨",
  desc: "Get an inspirational quote",
  usage: ".quote"
}, async (message, sock) => {
  const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "In the middle of difficulty lies opportunity. - Albert Einstein"
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  await sock.sendMessage(message.key.remoteJid, { text: `✨ *Inspirational Quote*\n\n${randomQuote}` });
});

Queen.addCommand({
  pattern: ["fact"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "🧠",
  desc: "Get a random fact",
  usage: ".fact"
}, async (message, sock) => {
  const facts = [
    "🧠 Octopuses have three hearts and blue blood!",
    "🌍 A day on Venus is longer than its year!",
    "🐝 Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs!",
    "🦈 Sharks have been around longer than trees!",
    "🌙 The Moon is moving away from Earth at about 3.8 cm per year!",
    "🐧 Penguins can jump as high as 6 feet in the air!",
    "🧬 Humans share 60% of their DNA with bananas!",
    "🐙 An octopus has three hearts, nine brains, and blue blood!",
    "🌊 The Pacific Ocean is larger than all land masses combined!",
    "⚡ Lightning strikes the Earth about 100 times per second!"
  ];
  
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  await sock.sendMessage(message.key.remoteJid, { text: `🤯 *Random Fact*\n\n${randomFact}` });
});

Queen.addCommand({
  pattern: ["meme"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "🤣",
  desc: "Get a random meme",
  usage: ".meme"
}, async (message, sock) => {
  const memes = [
    "🤣 *Programming Meme*\n\n99 little bugs in the code,\n99 little bugs,\nTake one down, patch it around,\n117 little bugs in the code! 🐛",
    "😂 *Life Meme*\n\nMe: I'll go to bed early tonight\nAlso me at 3 AM: Just one more episode... 📺",
    "🤪 *Tech Meme*\n\nThere are only 10 types of people in the world:\nThose who understand binary and those who don't! 💻",
    "😅 *Coffee Meme*\n\nCoffee: Because adulting is hard ☕\nAlso coffee: *Makes you more anxious about adulting* 😰",
    "🤓 *Student Meme*\n\nTeacher: The test will be easy\nThe test: If x = happiness, solve for life 📚",
    "😴 *Monday Meme*\n\nMonday morning motivation:\n*Error 404: Motivation not found* 💤"
  ];
  
  const randomMeme = memes[Math.floor(Math.random() * memes.length)];
  await sock.sendMessage(message.key.remoteJid, { text: randomMeme });
});

Queen.addCommand({
  pattern: ["dice", "roll"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "🎲",
  desc: "Roll a dice",
  usage: ".dice"
}, async (message, sock) => {
  const diceValue = Math.floor(Math.random() * 6) + 1;
  const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `🎲 *Dice Roll*\n\n${diceEmojis[diceValue - 1]} You rolled: **${diceValue}**` 
  });
});

Queen.addCommand({
  pattern: ["flip", "coin"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "🪙",
  desc: "Flip a coin",
  usage: ".flip"
}, async (message, sock) => {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  const emoji = result === 'Heads' ? '👑' : '🔄';
  
  await sock.sendMessage(message.key.remoteJid, { 
    text: `🪙 *Coin Flip*\n\n${emoji} Result: **${result}**` 
  });
});

export {};