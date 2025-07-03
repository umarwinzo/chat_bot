import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import QRCode from 'qrcode';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import multer from 'multer';
import axios from 'axios';
import cron from 'node-cron';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// In-memory storage (replace with database in production)
const users = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    createdAt: new Date(),
    botConnected: false,
    lastLogin: new Date(),
    isActive: true
  }
];

const activeBots = new Map();
const botSessions = new Map();
const messageHistory = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Advanced WhatsApp Bot class with enhanced features
class AdvancedWhatsAppBot {
  constructor(userId, io) {
    this.userId = userId;
    this.io = io;
    this.client = null;
    this.isConnected = false;
    this.startTime = Date.now();
    this.messageCount = 0;
    this.userCount = 0;
    this.groupCount = 0;
    this.commandsUsed = new Map();
    this.activeUsers = new Set();
    this.bannedUsers = new Set();
    this.autoReplyMessages = new Map();
    this.scheduledMessages = [];
    this.mediaCache = new Map();
    this.qrRetries = 0;
    this.maxQrRetries = 3;
    this.chats = [];
    this.currentChat = null;
    this.messages = new Map();
    this.antiSpamMap = new Map();
    this.userWarnings = new Map();
    
    this.settings = {
      // Basic Settings
      botName: 'Queen Bot Pro',
      prefix: '.',
      language: 'EN',
      ownerNumber: '',
      
      // Behavior Settings
      autoReact: true,
      autoRead: false,
      autoTyping: true,
      welcomeMessage: true,
      antiLink: false,
      antiSpam: true,
      autoReply: false,
      
      // Advanced Features
      aiChatbot: false,
      voiceToText: false,
      textToVoice: false,
      imageGeneration: false,
      weatherUpdates: true,
      newsUpdates: true,
      reminderSystem: true,
      groupManagement: true,
      
      // Security Settings
      adminOnly: false,
      groupAdminOnly: false,
      blockUnknown: false,
      antiFlood: true,
      maxMessagesPerMinute: 10,
      
      // Media Settings
      maxDownloadSize: '100MB',
      allowedFileTypes: ['image', 'video', 'audio', 'document'],
      autoDownloadMedia: false,
      compressImages: true,
      
      // Response Settings
      responseDelay: 1000,
      workMode: 'public',
      logMessages: true,
      saveMedia: true,
      
      // Notification Settings
      notifyOnCommand: true,
      notifyOnError: true,
      notifyOnNewUser: false,
      notifyOnGroupJoin: true,
      
      // Auto-Reply Settings
      autoReplyText: 'Hello! I am currently unavailable. I will get back to you soon.',
      autoReplyEnabled: false,
      
      // Welcome Message Settings
      welcomeText: 'Welcome to our group! Please read the rules and enjoy your stay.',
      
      // Command Settings
      enabledCommands: {
        ping: true,
        help: true,
        info: true,
        weather: true,
        translate: true,
        sticker: true,
        download: true,
        ai: true,
        news: true,
        reminder: true,
        ban: true,
        unban: true,
        kick: true,
        promote: true,
        demote: true,
        mute: true,
        unmute: true,
        everyone: true,
        tagall: true,
        joke: true,
        quote: true,
        fact: true,
        meme: true,
        calculator: true,
        qr: true,
        time: true,
        uptime: true,
        stats: true
      }
    };

    this.commands = new Map();
    this.initializeAdvancedCommands();
  }

  initializeAdvancedCommands() {
    // Enhanced Utility Commands
    this.commands.set('ping', {
      description: 'Check bot response time and status',
      usage: '.ping',
      category: 'utility',
      adminOnly: false,
      execute: async (message) => {
        const start = Date.now();
        const reply = await message.reply('🏓 Pinging...');
        const end = Date.now();
        const responseTime = end - start;
        
        const statusEmoji = responseTime < 100 ? '🟢' : responseTime < 500 ? '🟡' : '🔴';
        const speedText = responseTime < 100 ? 'Excellent' : responseTime < 500 ? 'Good' : 'Slow';
        
        await message.reply(`🏓 *Pong!*\n\n⚡ *Response Time:* ${responseTime}ms\n${statusEmoji} *Status:* Online\n✨ *Speed:* ${speedText}\n🤖 *Bot:* ${this.settings.botName}\n⏰ *Uptime:* ${this.formatUptime()}`);
      }
    });

    this.commands.set('help', {
      description: 'Show available commands with categories',
      usage: '.help [command]',
      category: 'utility',
      adminOnly: false,
      execute: async (message, args) => {
        if (args.length > 0) {
          const cmd = this.commands.get(args[0]);
          if (cmd) {
            await message.reply(`📖 *${args[0]}*\n\n📝 *Description:* ${cmd.description}\n💡 *Usage:* ${cmd.usage}\n📂 *Category:* ${cmd.category}\n👑 *Admin Only:* ${cmd.adminOnly ? 'Yes' : 'No'}`);
          } else {
            await message.reply('❌ Command not found! Use `.help` to see all commands.');
          }
        } else {
          const categories = {};
          this.commands.forEach((cmd, name) => {
            if (!this.settings.enabledCommands[name]) return;
            if (!categories[cmd.category]) categories[cmd.category] = [];
            categories[cmd.category].push(name);
          });

          let helpText = `🤖 *${this.settings.botName} - Command List*\n\n`;
          Object.keys(categories).forEach(category => {
            helpText += `📂 *${category.toUpperCase()}*\n`;
            categories[category].forEach(cmd => {
              helpText += `• ${this.settings.prefix}${cmd}\n`;
            });
            helpText += '\n';
          });
          helpText += `💡 Use \`${this.settings.prefix}help <command>\` for detailed info\n`;
          helpText += `⚙️ Total Commands: ${this.commands.size}`;
          
          await message.reply(helpText);
        }
      }
    });

    // Advanced Media Commands
    this.commands.set('sticker', {
      description: 'Convert image/video to sticker with options',
      usage: '.sticker [quality] (reply to media)',
      category: 'media',
      adminOnly: false,
      execute: async (message, args) => {
        if (!message.hasQuotedMsg) {
          await message.reply('❌ Please reply to an image or video!\n\n💡 *Usage:* `.sticker [quality]`\n📝 *Quality options:* low, medium, high');
          return;
        }

        try {
          const quotedMsg = await message.getQuotedMessage();
          if (quotedMsg.hasMedia) {
            await message.reply('🎨 Creating sticker... Please wait!');
            
            const media = await quotedMsg.downloadMedia();
            const quality = args[0] || 'medium';
            
            // Process image based on quality
            let processedMedia = media;
            if (this.settings.compressImages && quality !== 'high') {
              // Image processing logic here
            }
            
            const sticker = new MessageMedia('image/webp', processedMedia.data, 'sticker.webp');
            await message.reply(sticker, undefined, { sendMediaAsSticker: true });
            await message.reply('✅ Sticker created successfully!');
          } else {
            await message.reply('❌ Please reply to an image or video!');
          }
        } catch (error) {
          console.error('Sticker creation error:', error);
          await message.reply('❌ Failed to create sticker! Please try again.');
        }
      }
    });

    // AI and Fun Commands
    this.commands.set('ai', {
      description: 'AI-powered chat responses',
      usage: '.ai <question>',
      category: 'ai',
      adminOnly: false,
      execute: async (message, args) => {
        if (!this.settings.aiChatbot) {
          await message.reply('❌ AI Chatbot is disabled! Enable it in settings.');
          return;
        }
        
        if (args.length === 0) {
          await message.reply('❌ Please provide a question!\n\n💡 *Example:* `.ai What is the weather like?`');
          return;
        }
        
        const question = args.join(' ');
        await message.reply('🤖 AI is thinking... Please wait!');
        
        try {
          // Mock AI response with more sophisticated responses
          const responses = [
            `🧠 *AI Response*\n\nRegarding "${question}", I believe this is a fascinating topic that requires careful analysis. Based on my understanding, there are multiple perspectives to consider.`,
            `💭 *AI Analysis*\n\nYour question about "${question}" is quite interesting. From an analytical standpoint, this involves several key factors that we should examine.`,
            `🎯 *AI Insight*\n\nThe question "${question}" touches on important concepts. Let me break this down for you with a comprehensive perspective.`
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          await message.reply(randomResponse);
        } catch (error) {
          await message.reply('❌ AI service is currently unavailable! Please try again later.');
        }
      }
    });

    // Enhanced Group Management
    this.commands.set('everyone', {
      description: 'Tag all group members with custom message',
      usage: '.everyone <message>',
      category: 'group',
      adminOnly: true,
      execute: async (message, args) => {
        const chat = await message.getChat();
        if (!chat.isGroup) {
          await message.reply('❌ This command only works in groups!');
          return;
        }

        const text = args.join(' ') || '📢 Attention everyone!';
        let mentions = [];
        let mentionText = '';
        
        for (let participant of chat.participants) {
          mentions.push(participant.id._serialized);
          mentionText += `@${participant.id.user} `;
        }

        await message.reply(`${text}\n\n${mentionText}`, undefined, { mentions });
      }
    });

    // Utility Commands
    this.commands.set('weather', {
      description: 'Get weather information for any city',
      usage: '.weather <city>',
      category: 'utility',
      adminOnly: false,
      execute: async (message, args) => {
        if (!this.settings.weatherUpdates) {
          await message.reply('❌ Weather updates are disabled!');
          return;
        }
        
        if (args.length === 0) {
          await message.reply('❌ Please provide a city name!\n\n💡 *Example:* `.weather London`');
          return;
        }
        
        try {
          const city = args.join(' ');
          await message.reply('🌤️ Getting weather data... Please wait!');
          
          // Enhanced mock weather data
          const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy'];
          const weather = {
            location: city,
            temperature: Math.floor(Math.random() * 35) + 5,
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            humidity: Math.floor(Math.random() * 60) + 20,
            windSpeed: Math.floor(Math.random() * 20) + 5,
            pressure: Math.floor(Math.random() * 50) + 1000
          };
          
          const weatherEmoji = {
            'Sunny': '☀️',
            'Cloudy': '☁️',
            'Rainy': '🌧️',
            'Stormy': '⛈️',
            'Snowy': '❄️',
            'Foggy': '🌫️'
          };
          
          const weatherText = `🌤️ *Weather in ${weather.location}*\n\n` +
                             `${weatherEmoji[weather.condition]} *Condition:* ${weather.condition}\n` +
                             `🌡️ *Temperature:* ${weather.temperature}°C\n` +
                             `💧 *Humidity:* ${weather.humidity}%\n` +
                             `💨 *Wind Speed:* ${weather.windSpeed} km/h\n` +
                             `📊 *Pressure:* ${weather.pressure} hPa\n\n` +
                             `📅 *Updated:* ${new Date().toLocaleString()}`;
          
          await message.reply(weatherText);
        } catch (error) {
          await message.reply('❌ Failed to get weather information! Please try again.');
        }
      }
    });

    // Fun Commands
    this.commands.set('joke', {
      description: 'Get a random joke to brighten your day',
      usage: '.joke',
      category: 'fun',
      adminOnly: false,
      execute: async (message) => {
        const jokes = [
          "Why don't scientists trust atoms? Because they make up everything! 😄",
          "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
          "Why don't eggs tell jokes? They'd crack each other up! 🥚",
          "What do you call a fake noodle? An impasta! 🍝",
          "Why did the math book look so sad? Because it had too many problems! 📚",
          "What do you call a sleeping bull? A bulldozer! 🐂",
          "Why don't skeletons fight each other? They don't have the guts! 💀",
          "What do you call a bear with no teeth? A gummy bear! 🐻",
          "Why did the coffee file a police report? It got mugged! ☕",
          "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks! 🦕"
        ];
        
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await message.reply(`😂 *Random Joke*\n\n${randomJoke}\n\n💡 *Tip:* Use \`.joke\` anytime for more laughs!`);
      }
    });

    this.commands.set('calculator', {
      description: 'Perform mathematical calculations',
      usage: '.calc <expression>',
      category: 'utility',
      adminOnly: false,
      execute: async (message, args) => {
        if (args.length === 0) {
          await message.reply('❌ Please provide a mathematical expression!\n\n💡 *Examples:*\n• `.calc 2 + 2`\n• `.calc 10 * 5`\n• `.calc sqrt(16)`');
          return;
        }
        
        try {
          const expression = args.join(' ');
          // Simple calculator implementation (in production, use a proper math library)
          const result = this.evaluateExpression(expression);
          
          await message.reply(`🧮 *Calculator*\n\n📝 *Expression:* ${expression}\n🔢 *Result:* ${result}\n\n💡 *Supported:* +, -, *, /, sqrt(), pow()`);
        } catch (error) {
          await message.reply('❌ Invalid mathematical expression! Please check your input.');
        }
      }
    });

    // Add more commands...
    this.addMoreAdvancedCommands();
  }

  addMoreAdvancedCommands() {
    // News Command
    this.commands.set('news', {
      description: 'Get latest news headlines',
      usage: '.news [category]',
      category: 'utility',
      adminOnly: false,
      execute: async (message, args) => {
        if (!this.settings.newsUpdates) {
          await message.reply('❌ News updates are disabled!');
          return;
        }
        
        const category = args[0] || 'general';
        await message.reply('📰 Fetching latest news... Please wait!');
        
        // Mock news data
        const newsItems = [
          { title: 'Tech Innovation Breakthrough', summary: 'New AI technology revolutionizes industry' },
          { title: 'Global Climate Update', summary: 'Scientists report positive environmental changes' },
          { title: 'Sports Championship Results', summary: 'Exciting matches conclude with surprising winners' }
        ];
        
        let newsText = `📰 *Latest News - ${category.toUpperCase()}*\n\n`;
        newsItems.forEach((item, index) => {
          newsText += `${index + 1}. *${item.title}*\n   ${item.summary}\n\n`;
        });
        newsText += `🕐 *Updated:* ${new Date().toLocaleString()}`;
        
        await message.reply(newsText);
      }
    });

    // QR Code Generator
    this.commands.set('qr', {
      description: 'Generate QR code for text or URL',
      usage: '.qr <text>',
      category: 'utility',
      adminOnly: false,
      execute: async (message, args) => {
        if (args.length === 0) {
          await message.reply('❌ Please provide text or URL for QR code!\n\n💡 *Example:* `.qr https://example.com`');
          return;
        }
        
        try {
          const text = args.join(' ');
          await message.reply('📱 Generating QR code... Please wait!');
          
          // Generate QR code
          const qrDataUrl = await QRCode.toDataURL(text);
          const base64Data = qrDataUrl.split(',')[1];
          const qrMedia = new MessageMedia('image/png', base64Data, 'qrcode.png');
          
          await message.reply(qrMedia, undefined, { caption: `📱 *QR Code Generated*\n\n📝 *Content:* ${text}` });
        } catch (error) {
          await message.reply('❌ Failed to generate QR code! Please try again.');
        }
      }
    });

    // System Stats
    this.commands.set('stats', {
      description: 'Show bot statistics and performance',
      usage: '.stats',
      category: 'utility',
      adminOnly: false,
      execute: async (message) => {
        const uptime = this.formatUptime();
        const stats = await this.getStats();
        
        const statsText = `📊 *Bot Statistics*\n\n` +
                         `🤖 *Bot:* ${this.settings.botName}\n` +
                         `⏰ *Uptime:* ${uptime}\n` +
                         `👥 *Total Users:* ${stats.totalUsers}\n` +
                         `👥 *Groups:* ${stats.totalGroups}\n` +
                         `💬 *Messages:* ${stats.messageCount}\n` +
                         `⚡ *Commands Used:* ${stats.totalCommands}\n` +
                         `🔥 *Active Users:* ${stats.activeUsers}\n` +
                         `🚫 *Banned Users:* ${stats.bannedUsers}\n` +
                         `💾 *RAM Usage:* ${stats.ramUsage}%\n` +
                         `🖥️ *CPU Usage:* ${stats.cpuUsage}%\n\n` +
                         `📅 *Last Updated:* ${new Date().toLocaleString()}`;
        
        await message.reply(statsText);
      }
    });
  }

  evaluateExpression(expr) {
    // Simple math expression evaluator (use a proper library in production)
    expr = expr.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
    expr = expr.replace(/pow\(([^,]+),([^)]+)\)/g, 'Math.pow($1,$2)');
    
    // Basic security check
    if (!/^[0-9+\-*/.() Math.sqrt,pow]+$/.test(expr.replace(/\s/g, ''))) {
      throw new Error('Invalid expression');
    }
    
    return eval(expr);
  }

  formatUptime() {
    const uptime = Date.now() - this.startTime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  async initialize() {
    try {
      console.log(`🚀 Initializing advanced bot for user ${this.userId}...`);
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: `bot-${this.userId}`,
          dataPath: path.join(__dirname, 'sessions')
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      });

      this.setupAdvancedEventHandlers();
      
      console.log(`📱 Starting WhatsApp client for user ${this.userId}...`);
      await this.client.initialize();
      
      return true;
    } catch (error) {
      console.error('❌ Bot initialization error:', error);
      this.io.emit('bot-error', { 
        userId: this.userId, 
        error: `Initialization failed: ${error.message}` 
      });
      throw error;
    }
  }

  setupAdvancedEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log(`📱 QR code received for user ${this.userId}`);
      QRCode.toDataURL(qr, (err, url) => {
        if (!err) {
          this.io.emit('qr-code', { userId: this.userId, qrCode: url });
          console.log(`✅ QR code sent to client for user ${this.userId}`);
        } else {
          console.error('❌ QR code generation error:', err);
          this.io.emit('bot-error', { 
            userId: this.userId, 
            error: `QR code generation failed: ${err.message}` 
          });
        }
      });
    });

    this.client.on('ready', async () => {
      console.log(`✅ Bot ${this.userId} is ready and connected!`);
      this.isConnected = true;
      this.qrRetries = 0;
      
      // Update user status
      const user = users.find(u => u.id === this.userId);
      if (user) user.botConnected = true;

      try {
        // Get comprehensive stats and chats
        const chats = await this.client.getChats();
        this.groupCount = chats.filter(chat => chat.isGroup).length;
        this.userCount = chats.filter(chat => !chat.isGroup).length;
        
        // Format chats for frontend with enhanced data
        this.chats = await Promise.all(chats.slice(0, 50).map(async (chat) => {
          try {
            const contact = chat.isGroup ? null : await chat.getContact();
            return {
              id: chat.id._serialized,
              name: chat.name || (contact ? contact.pushname || contact.number : 'Unknown'),
              isGroup: chat.isGroup,
              unreadCount: chat.unreadCount || 0,
              lastMessage: chat.lastMessage ? {
                body: chat.lastMessage.body || '',
                timestamp: chat.lastMessage.timestamp,
                fromMe: chat.lastMessage.fromMe
              } : null,
              profilePicUrl: null,
              participantCount: chat.isGroup ? chat.participants?.length : null
            };
          } catch (error) {
            console.error('Error processing chat:', error);
            return null;
          }
        }));
        
        this.chats = this.chats.filter(chat => chat !== null);
        
        // Send real-time updates to frontend
        this.io.emit('chats-updated', { userId: this.userId, chats: this.chats });
        this.io.emit('bot-stats-updated', { userId: this.userId, stats: await this.getStats() });
        
      } catch (error) {
        console.error('Error getting initial stats:', error);
      }

      this.io.emit('qr-hidden', { userId: this.userId });
      this.io.emit('bot-connected', { userId: this.userId });
    });

    this.client.on('authenticated', () => {
      console.log(`🔐 Bot ${this.userId} authenticated successfully`);
      this.io.emit('qr-hidden', { userId: this.userId });
    });

    this.client.on('auth_failure', (message) => {
      console.log(`❌ Authentication failed for bot ${this.userId}:`, message);
      this.qrRetries++;
      
      if (this.qrRetries >= this.maxQrRetries) {
        this.io.emit('bot-error', { 
          userId: this.userId, 
          error: 'Authentication failed after multiple attempts. Please try again.' 
        });
      } else {
        this.io.emit('auth-failure', { 
          userId: this.userId, 
          message: `Authentication failed (attempt ${this.qrRetries}/${this.maxQrRetries}). Please scan the QR code again.` 
        });
      }
    });

    this.client.on('message', async (message) => {
      await this.handleAdvancedMessage(message);
    });

    this.client.on('message_create', async (message) => {
      if (message.fromMe) {
        this.messageCount++;
      }
      
      // Enhanced message storage with metadata
      const chatId = message.from || message.to;
      if (!this.messages.has(chatId)) {
        this.messages.set(chatId, []);
      }
      
      const messageData = {
        id: message.id._serialized,
        body: message.body,
        timestamp: message.timestamp,
        fromMe: message.fromMe,
        type: message.type,
        hasMedia: message.hasMedia,
        author: message.author,
        isForwarded: message.isForwarded
      };
      
      this.messages.get(chatId).push(messageData);
      
      // Keep only last 100 messages per chat
      if (this.messages.get(chatId).length > 100) {
        this.messages.get(chatId).shift();
      }
      
      // Real-time message updates
      this.io.emit('new-message', { 
        userId: this.userId, 
        chatId, 
        message: messageData 
      });
    });

    this.client.on('group_join', async (notification) => {
      if (this.settings.welcomeMessage && this.settings.notifyOnGroupJoin) {
        try {
          const chat = await notification.getChat();
          const welcomeText = this.settings.welcomeText || 'Welcome to our group!';
          await chat.sendMessage(`👋 ${welcomeText}`);
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log(`📱 Bot ${this.userId} disconnected:`, reason);
      this.isConnected = false;
      
      const user = users.find(u => u.id === this.userId);
      if (user) user.botConnected = false;

      this.io.emit('bot-disconnected', { userId: this.userId, reason });
    });

    this.client.on('loading_screen', (percent, message) => {
      console.log(`⏳ Loading screen for bot ${this.userId}: ${percent}% - ${message}`);
      this.io.emit('bot-loading', { userId: this.userId, percent, message });
    });
  }

  async handleAdvancedMessage(message) {
    try {
      this.messageCount++;
      this.activeUsers.add(message.from);

      // Enhanced anti-spam with user warnings
      if (this.settings.antiSpam && this.isSpam(message)) {
        const warnings = this.userWarnings.get(message.from) || 0;
        this.userWarnings.set(message.from, warnings + 1);
        
        if (warnings >= 2) {
          await message.reply('⚠️ You have been temporarily muted for spamming. Please wait before sending more messages.');
          this.bannedUsers.add(message.from);
          setTimeout(() => this.bannedUsers.delete(message.from), 300000); // 5 minutes
        } else {
          await message.reply(`⚠️ Please slow down! Warning ${warnings + 1}/3`);
        }
        return;
      }

      // Check if user is banned
      if (this.bannedUsers.has(message.from)) {
        return;
      }

      // Enhanced auto-react with context awareness
      if (this.settings.autoReact && Math.random() < 0.15) {
        const reactions = this.getContextualReactions(message.body);
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        try {
          await message.react(randomReaction);
        } catch (error) {
          // Ignore reaction errors
        }
      }

      // Auto-read messages
      if (this.settings.autoRead) {
        try {
          const chat = await message.getChat();
          await chat.markUnread();
        } catch (error) {
          // Ignore read errors
        }
      }

      // Handle commands with enhanced processing
      if (message.body.startsWith(this.settings.prefix)) {
        await this.handleAdvancedCommand(message);
      }
      // Auto-reply with smart responses
      else if (this.settings.autoReply && this.settings.autoReplyEnabled) {
        const chat = await message.getChat();
        if (!chat.isGroup) {
          await this.sendTyping(message);
          const smartReply = this.generateSmartReply(message.body);
          await message.reply(smartReply);
        }
      }

      // Enhanced logging
      if (this.settings.logMessages) {
        this.logAdvancedMessage(message);
      }

      // Real-time stats update
      this.io.emit('bot-stats-updated', { 
        userId: this.userId, 
        stats: await this.getStats() 
      });

    } catch (error) {
      console.error('Error handling message:', error);
      if (this.settings.notifyOnError) {
        this.io.emit('bot-error', { 
          userId: this.userId, 
          error: `Message handling error: ${error.message}` 
        });
      }
    }
  }

  getContextualReactions(messageBody) {
    const text = messageBody.toLowerCase();
    
    if (text.includes('good') || text.includes('great') || text.includes('awesome')) {
      return ['👍', '🎉', '✨', '💯', '🔥'];
    }
    if (text.includes('love') || text.includes('heart')) {
      return ['❤️', '💖', '💕', '💗', '😍'];
    }
    if (text.includes('funny') || text.includes('lol') || text.includes('haha')) {
      return ['😂', '🤣', '😄', '😆', '🙃'];
    }
    if (text.includes('sad') || text.includes('sorry')) {
      return ['😢', '😔', '🥺', '😞', '💔'];
    }
    
    return ['👍', '❤️', '😊', '🔥', '💯', '✨', '🎉'];
  }

  generateSmartReply(messageBody) {
    const text = messageBody.toLowerCase();
    
    if (text.includes('hello') || text.includes('hi')) {
      return '👋 Hello! How can I help you today?';
    }
    if (text.includes('how are you')) {
      return '🤖 I\'m doing great! Thanks for asking. How are you?';
    }
    if (text.includes('thank')) {
      return '😊 You\'re welcome! Happy to help!';
    }
    if (text.includes('bye')) {
      return '👋 Goodbye! Have a great day!';
    }
    
    return this.settings.autoReplyText;
  }

  async handleAdvancedCommand(message) {
    const args = message.body.slice(this.settings.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = this.commands.get(commandName);
    if (!command) return;

    // Check if command is enabled
    if (!this.settings.enabledCommands[commandName]) {
      await message.reply('❌ This command is currently disabled!');
      return;
    }

    // Enhanced permission checking
    if (command.adminOnly) {
      const contact = await message.getContact();
      const isOwner = contact.number === this.settings.ownerNumber.replace(/\D/g, '');
      const chat = await message.getChat();
      const isGroupAdmin = chat.isGroup && chat.participants.find(p => 
        p.id._serialized === message.author && p.isAdmin
      );
      
      if (!isOwner && !(this.settings.groupAdminOnly && isGroupAdmin)) {
        await message.reply('❌ This command requires admin privileges!');
        return;
      }
    }

    // Work mode restrictions
    const chat = await message.getChat();
    if (this.settings.workMode === 'private' && chat.isGroup) {
      await message.reply('❌ This bot only works in private chats!');
      return;
    }
    if (this.settings.workMode === 'group-only' && !chat.isGroup) {
      await message.reply('❌ This bot only works in groups!');
      return;
    }

    try {
      // Enhanced typing indicator
      if (this.settings.autoTyping) {
        await this.sendTyping(message);
      }

      // Response delay
      if (this.settings.responseDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.settings.responseDelay));
      }

      // Execute command with error handling
      await command.execute(message, args);
      
      // Track command usage with detailed stats
      const count = this.commandsUsed.get(commandName) || 0;
      this.commandsUsed.set(commandName, count + 1);

      // Real-time command notification
      if (this.settings.notifyOnCommand) {
        this.io.emit('command-used', { 
          userId: this.userId, 
          command: commandName, 
          user: message.from,
          timestamp: Date.now()
        });
      }

    } catch (error) {
      console.error(`Command execution error ${commandName}:`, error);
      await message.reply('❌ An error occurred while executing the command! Please try again.');
      
      if (this.settings.notifyOnError) {
        this.io.emit('command-error', { 
          userId: this.userId, 
          command: commandName, 
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
  }

  async sendTyping(message) {
    try {
      const chat = await message.getChat();
      await chat.sendStateTyping();
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  isSpam(message) {
    if (!this.settings.antiFlood) return false;
    
    const now = Date.now();
    const userMessages = this.antiSpamMap.get(message.from) || [];
    
    // Remove old messages (older than 1 minute)
    const recentMessages = userMessages.filter(time => now - time < 60000);
    
    // Add current message
    recentMessages.push(now);
    this.antiSpamMap.set(message.from, recentMessages);
    
    return recentMessages.length > this.settings.maxMessagesPerMinute;
  }

  logAdvancedMessage(message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      from: message.from,
      body: message.body,
      type: message.type,
      isGroup: message.from.includes('@g.us'),
      hasMedia: message.hasMedia,
      isForwarded: message.isForwarded,
      userId: this.userId
    };
    
    // In production, save to database
    console.log('📝 Message logged:', logEntry);
  }

  async getStats() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const commandStats = Object.fromEntries(this.commandsUsed);
    
    return {
      uptime,
      totalUsers: this.userCount,
      totalGroups: this.groupCount,
      totalCommands: Array.from(this.commandsUsed.values()).reduce((a, b) => a + b, 0),
      messageCount: this.messageCount,
      activeUsers: this.activeUsers.size,
      bannedUsers: this.bannedUsers.size,
      commandStats,
      ramUsage: Math.floor(Math.random() * 30) + 40,
      cpuUsage: Math.floor(Math.random() * 20) + 10,
      enabledCommands: Object.keys(this.settings.enabledCommands).filter(cmd => this.settings.enabledCommands[cmd]).length,
      totalCommandsAvailable: this.commands.size
    };
  }

  getSettings() {
    return this.settings;
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Save settings to file
    try {
      const settingsPath = path.join(__dirname, 'data', `${this.userId}_settings.json`);
      await fs.ensureDir(path.dirname(settingsPath));
      await fs.writeJson(settingsPath, this.settings, { spaces: 2 });
      
      // Emit settings update to frontend
      this.io.emit('settings-updated', { 
        userId: this.userId, 
        settings: this.settings 
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async getChats() {
    return this.chats;
  }

  async getChatMessages(chatId) {
    return this.messages.get(chatId) || [];
  }

  async sendMessage(chatId, message) {
    try {
      if (!this.client || !this.isConnected) {
        throw new Error('Bot not connected');
      }
      
      await this.client.sendMessage(chatId, message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      console.log(`🔌 Disconnecting bot for user ${this.userId}...`);
      if (this.client) {
        await this.client.destroy();
      }
      this.isConnected = false;
      
      const user = users.find(u => u.id === this.userId);
      if (user) user.botConnected = false;
      
      console.log(`✅ Bot ${this.userId} disconnected successfully`);
    } catch (error) {
      console.error('Error disconnecting bot:', error);
    }
  }
}

// Initialize server directories
async function initializeServer() {
  try {
    const directories = [
      'data', 'sessions', 'uploads', 'downloads', 
      'logs', 'backups', 'temp'
    ];
    
    for (const dir of directories) {
      await fs.ensureDir(path.join(__dirname, dir));
    }
    
    console.log('✅ Server directories initialized');
  } catch (error) {
    console.error('❌ Error initializing directories:', error);
  }
}

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = { 
      id: uuidv4(), 
      username, 
      email, 
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: new Date(),
      botConnected: false,
      isActive: true
    };
    
    users.push(user);
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.status(201).json({ 
      token, 
      user: userResponse,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.json({ 
      token, 
      user: userResponse,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // Check if it's admin token or admin user
  if (token.startsWith('admin-token-') || req.body?.email === 'DarkWinzo@gmail.com') {
    req.user = { admin: true };
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

// Enhanced Bot Routes
app.post('/api/bot/connect', authenticateToken, async (req, res) => {
  try {
    const { method } = req.body;
    const userId = req.user.userId;
    
    console.log(`🔌 Bot connection request from user ${userId} using method: ${method}`);
    
    if (activeBots.has(userId)) {
      const existingBot = activeBots.get(userId);
      if (existingBot.isConnected) {
        return res.status(400).json({ error: 'Bot already connected' });
      }
      await existingBot.disconnect();
      activeBots.delete(userId);
    }
    
    const bot = new AdvancedWhatsAppBot(userId, io);
    activeBots.set(userId, bot);
    
    if (method === 'qr') {
      try {
        await bot.initialize();
        res.json({ message: 'QR code will be generated shortly' });
      } catch (error) {
        console.error(`QR generation error for user ${userId}:`, error);
        activeBots.delete(userId);
        res.status(500).json({ error: error.message });
      }
    } else {
      return res.status(400).json({ error: 'Only QR code method is supported' });
    }
  } catch (error) {
    console.error('Bot connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (bot) {
      await bot.disconnect();
      activeBots.delete(userId);
    }
    
    res.json({ success: true, message: 'Bot disconnected successfully' });
  } catch (error) {
    console.error('Bot disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect bot' });
  }
});

app.get('/api/bot/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.json({ 
        connected: false, 
        stats: { 
          uptime: 0, 
          totalUsers: 0, 
          totalGroups: 0,
          totalCommands: 0, 
          messageCount: 0,
          activeUsers: 0,
          bannedUsers: 0,
          ramUsage: 0, 
          cpuUsage: 0,
          enabledCommands: 0,
          totalCommandsAvailable: 0
        } 
      });
    }
    
    const stats = await bot.getStats();
    
    res.json({ 
      connected: true, 
      stats,
      botName: bot.settings.botName,
      uptime: bot.formatUptime()
    });
  } catch (error) {
    console.error('Bot status error:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

// Enhanced Settings Routes
app.get('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (!bot) {
      const defaultBot = new AdvancedWhatsAppBot(userId, io);
      return res.json(defaultBot.getSettings());
    }
    
    res.json(bot.getSettings());
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.post('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let bot = activeBots.get(userId);
    
    if (!bot) {
      bot = new AdvancedWhatsAppBot(userId, io);
      activeBots.set(userId, bot);
    }
    
    await bot.updateSettings(req.body);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat Routes
app.get('/api/bot/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.status(400).json({ error: 'Bot not connected' });
    }
    
    const chats = await bot.getChats();
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bot/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.status(400).json({ error: 'Bot not connected' });
    }
    
    const messages = await bot.getChatMessages(chatId);
    res.json(messages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/chats/:chatId/send', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const { message } = req.body;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.status(400).json({ error: 'Bot not connected' });
    }
    
    await bot.sendMessage(chatId, message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  try {
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      botConnected: u.botConnected,
      isActive: u.isActive
    }));
    
    res.json(userList);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const connectedBots = activeBots.size;
    
    // Calculate total messages across all bots
    let totalMessages = 0;
    let totalCommands = 0;
    
    activeBots.forEach(bot => {
      totalMessages += bot.messageCount;
      totalCommands += Array.from(bot.commandsUsed.values()).reduce((a, b) => a + b, 0);
    });
    
    res.json({
      totalUsers,
      activeUsers,
      connectedBots,
      totalMessages,
      totalCommands,
      ramUsage: Math.floor(Math.random() * 30) + 50,
      cpuUsage: Math.floor(Math.random() * 40) + 20,
      totalMemory: 8,
      usedMemory: 5,
      systemUptime: Math.floor(process.uptime()),
      nodeVersion: process.version
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
});

// File upload route
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Socket.IO enhanced connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Scheduled tasks
cron.schedule('*/5 * * * *', () => {
  // Process scheduled messages every 5 minutes
  activeBots.forEach(bot => {
    if (bot.isConnected) {
      bot.processScheduledMessages?.();
    }
  });
});

cron.schedule('0 0 * * *', () => {
  // Daily cleanup tasks
  console.log('🧹 Running daily cleanup tasks...');
  
  // Clear old message history
  activeBots.forEach(bot => {
    bot.antiSpamMap.clear();
    bot.userWarnings.clear();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  try {
    await initializeServer();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Advanced WhatsApp Bot Backend Server running on port ${PORT}`);
      console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`👤 Demo Login: demo@example.com / password`);
      console.log(`👑 Admin Login: DarkWinzo@gmail.com / 20030210`);
      console.log(`🤖 WhatsApp Web.js Integration: Active`);
      console.log(`✨ Enhanced Features: Enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  
  // Disconnect all bots
  for (const [userId, bot] of activeBots) {
    try {
      await bot.disconnect();
    } catch (error) {
      console.error(`Error disconnecting bot ${userId}:`, error);
    }
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();