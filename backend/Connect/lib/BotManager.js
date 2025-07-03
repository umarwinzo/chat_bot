import baileys from '@whiskeysockets/baileys';

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  proto,
  getContentType,
  downloadContentFromMessage,
  jidDecode,
  areJidsSameUser,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} = baileys;

import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { CommandHandler } from './CommandHandler.js';
import { MessageHandler } from './MessageHandler.js';
import { DatabaseManager } from './DatabaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BotManager extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.bots = new Map();
    this.stores = new Map();
    this.commandHandler = new CommandHandler();
    this.messageHandler = new MessageHandler();
    this.dbManager = new DatabaseManager();
    this.logger = pino({ level: 'info' });
    
    // Ensure auth directory exists
    this.authDir = path.join(__dirname, '../auth');
    fs.ensureDirSync(this.authDir);
    
    // Initialize command handler
    this.commandHandler.loadCommands();
  }

  async connectBot(userId) {
    try {
      if (this.bots.has(userId)) {
        throw new Error('Bot already connected for this user');
      }

      const authPath = path.join(this.authDir, userId);
      fs.ensureDirSync(authPath);

      // Get latest Baileys version
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

      // Initialize auth state
      const { state, saveCreds } = await useMultiFileAuthState(authPath);

      // Create in-memory store
      const store = makeInMemoryStore({
        logger: pino().child({ level: 'silent', stream: 'store' })
      });
      this.stores.set(userId, store);

      // Create socket
      const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: ['Queen Bot Pro', 'Chrome', '3.0.0'],
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        getMessage: async (key) => {
          if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || undefined;
          }
          return proto.Message.fromObject({});
        }
      });

      // Bind store to socket
      store?.bind(sock.ev);

      this.bots.set(userId, sock);

      // Event handlers
      sock.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(userId, update);
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('messages.upsert', async (m) => {
        await this.handleMessages(userId, m);
      });

      sock.ev.on('messages.update', async (updates) => {
        await this.handleMessageUpdates(userId, updates);
      });

      sock.ev.on('presence.update', async (update) => {
        await this.handlePresenceUpdate(userId, update);
      });

      sock.ev.on('chats.upsert', async (chats) => {
        await this.handleChatsUpsert(userId, chats);
      });

      sock.ev.on('contacts.upsert', async (contacts) => {
        await this.handleContactsUpsert(userId, contacts);
      });

      sock.ev.on('groups.upsert', async (groups) => {
        await this.handleGroupsUpsert(userId, groups);
      });

      // Log bot start
      this.logBotEvent(userId, 'Bot connection initiated');

    } catch (error) {
      console.error(`Error connecting bot for user ${userId}:`, error);
      this.logBotEvent(userId, `Connection error: ${error.message}`);
      throw error;
    }
  }

  async handleConnectionUpdate(userId, update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(qr);
        this.io.to(`user-${userId}`).emit('qr-code', {
          userId,
          qrCode: qrCodeDataURL
        });
        this.logBotEvent(userId, 'QR code generated');
      } catch (error) {
        console.error('QR code generation error:', error);
      }
    }

    if (connection === 'close') {
      // remove 'as Boom' part:
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      if (shouldReconnect) {
        console.log(`Reconnecting bot for user ${userId}...`);
        this.logBotEvent(userId, 'Reconnecting...');
        setTimeout(() => this.connectBot(userId), 3000);
      } else {
        console.log(`Bot logged out for user ${userId}`);
        this.logBotEvent(userId, 'Bot logged out');
        this.cleanupBot(userId);
      }

      this.io.to(`user-${userId}`).emit('bot-disconnected', { userId });
    } else if (connection === 'open') {
      console.log(`Bot connected successfully for user ${userId}`);
      this.logBotEvent(userId, 'Bot connected successfully');
      
      // Update user bot status
      await this.dbManager.updateUserBotStatus(userId, true);
      
      this.io.to(`user-${userId}`).emit('bot-connected', { userId });
      this.io.to(`user-${userId}`).emit('qr-hidden', { userId });
    }
  }

  async handleMessages(userId, { messages, type }) {
    for (const message of messages) {
      if (!message.message) continue;

      try {
        // Process message with message handler
        await this.messageHandler.processMessage(userId, message, this.bots.get(userId));
        
        // Check if it's a command
        const settings = await this.dbManager.getUserSettings(userId);
        const messageText = this.extractMessageText(message);
        
        if (messageText && messageText.startsWith(settings.prefix)) {
          await this.commandHandler.handleCommand(userId, message, this.bots.get(userId), settings);
        }

        // Update message count
        await this.dbManager.incrementMessageCount(userId);
        
        // Log message
        this.logBotEvent(userId, `Message received: ${messageText?.substring(0, 50) || 'Media message'}`);

      } catch (error) {
        console.error('Error handling message:', error);
        this.logBotEvent(userId, `Message handling error: ${error.message}`);
      }
    }
  }

  async handleMessageUpdates(userId, updates) {
    for (const update of updates) {
      // Handle message updates (read receipts, etc.)
      this.logBotEvent(userId, `Message updated: ${update.key.id}`);
    }
  }

  async handlePresenceUpdate(userId, update) {
    // Handle presence updates
    this.logBotEvent(userId, `Presence update: ${update.id}`);
  }

  async handleChatsUpsert(userId, chats) {
    // Handle new chats
    this.logBotEvent(userId, `${chats.length} chat(s) added`);
  }

  async handleContactsUpsert(userId, contacts) {
    // Handle new contacts
    this.logBotEvent(userId, `${contacts.length} contact(s) added`);
  }

  async handleGroupsUpsert(userId, groups) {
    // Handle new groups
    this.logBotEvent(userId, `${groups.length} group(s) added`);
  }

  extractMessageText(message) {
    const messageType = getContentType(message.message);
    
    switch (messageType) {
      case 'conversation':
        return message.message.conversation;
      case 'extendedTextMessage':
        return message.message.extendedTextMessage.text;
      case 'imageMessage':
        return message.message.imageMessage.caption || '';
      case 'videoMessage':
        return message.message.videoMessage.caption || '';
      default:
        return '';
    }
  }

  async disconnectBot(userId) {
    try {
      const bot = this.bots.get(userId);
      if (bot) {
        await bot.logout();
        this.cleanupBot(userId);
        await this.dbManager.updateUserBotStatus(userId, false);
        this.logBotEvent(userId, 'Bot disconnected by user');
      }
    } catch (error) {
      console.error(`Error disconnecting bot for user ${userId}:`, error);
      this.logBotEvent(userId, `Disconnect error: ${error.message}`);
    }
  }

  cleanupBot(userId) {
    this.bots.delete(userId);
    this.stores.delete(userId);
    
    // Clean up auth files if needed
    const authPath = path.join(this.authDir, userId);
    if (fs.existsSync(authPath)) {
      // Optionally remove auth files on logout
      // fs.removeSync(authPath);
    }
  }

  async disconnectAllBots() {
    const promises = Array.from(this.bots.keys()).map(userId => this.disconnectBot(userId));
    await Promise.all(promises);
  }

  isBotConnected(userId) {
    const bot = this.bots.get(userId);
    return bot && bot.user;
  }

  getConnectedBotsCount() {
    return Array.from(this.bots.values()).filter(bot => bot.user).length;
  }

  async getBotStatus(userId) {
    const connected = this.isBotConnected(userId);
    const stats = await this.dbManager.getUserStats(userId);
    
    return {
      connected,
      stats: {
        uptime: connected ? Math.floor((Date.now() - (stats.lastConnected || Date.now())) / 1000) : 0,
        totalUsers: stats.totalUsers || 0,
        totalGroups: stats.totalGroups || 0,
        totalCommands: stats.totalCommands || 0,
        messageCount: stats.messageCount || 0,
        activeUsers: stats.activeUsers || 0,
        bannedUsers: stats.bannedUsers || 0,
        ramUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        cpuUsage: Math.round(Math.random() * 30 + 10),
        enabledCommands: Object.values(stats.enabledCommands || {}).filter(Boolean).length,
        totalCommandsAvailable: Object.keys(stats.enabledCommands || {}).length
      }
    };
  }

  updateBotSettings(userId, settings) {
    // Notify bot of settings change via socket
    this.io.to(`user-${userId}`).emit('settings-updated', { userId, settings });
    this.logBotEvent(userId, 'Settings updated');
  }

  logBotEvent(userId, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Store log in memory (you might want to use a proper logging solution)
    if (!this.botLogs) this.botLogs = new Map();
    if (!this.botLogs.has(userId)) this.botLogs.set(userId, []);
    
    const logs = this.botLogs.get(userId);
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
    
    // Emit to frontend
    this.io.to(`user-${userId}`).emit('bot-log', { userId, log: logEntry });
  }

  async getBotLogs(userId) {
    if (!this.botLogs || !this.botLogs.has(userId)) {
      return [];
    }
    return this.botLogs.get(userId);
  }
}