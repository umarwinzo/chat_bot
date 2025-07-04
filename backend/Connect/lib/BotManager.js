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
  prepareWAMessageMedia,
  isJidBroadcast,
  isJidGroup
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
    this.qrRetryCount = new Map();
    this.pairingCodes = new Map();
    this.botLogs = new Map();
    this.connectionStates = new Map();
    this.reconnectAttempts = new Map();
    
    // Ensure auth directory exists
    this.authDir = path.join(__dirname, '../auth');
    fs.ensureDirSync(this.authDir);
    
    // Initialize command handler
    this.commandHandler.loadCommands();
  }

  async connectBot(userId, method = 'qr', phoneNumber = null) {
    try {
      // Clean up existing connection if any
      if (this.bots.has(userId)) {
        this.logBotEvent(userId, 'Cleaning up existing connection...');
        await this.cleanupBot(userId);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.logBotEvent(userId, `Starting bot connection via ${method}`);
      this.connectionStates.set(userId, 'connecting');
      this.reconnectAttempts.set(userId, 0);

      const authPath = path.join(this.authDir, userId);
      fs.ensureDirSync(authPath);

      // Get latest Baileys version
      const { version, isLatest } = await fetchLatestBaileysVersion();
      this.logBotEvent(userId, `Using WA v${version.join('.')}, isLatest: ${isLatest}`);

      // Initialize auth state
      const { state, saveCreds } = await useMultiFileAuthState(authPath);

      // Create in-memory store
      const store = makeInMemoryStore({
        logger: pino().child({ level: 'silent', stream: 'store' })
      });
      this.stores.set(userId, store);

      // Socket configuration with improved settings
      const socketConfig = {
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
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        getMessage: async (key) => {
          if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || undefined;
          }
          return proto.Message.fromObject({});
        }
      };

      // Add mobile configuration for pairing
      if (method === 'pairing' && phoneNumber) {
        socketConfig.mobile = true;
      }

      // Create socket
      const sock = makeWASocket(socketConfig);

      // Bind store to socket
      store?.bind(sock.ev);

      this.bots.set(userId, sock);

      // Event handlers
      sock.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(userId, update, method, phoneNumber);
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

      // Add error handling
      sock.ev.on('connection.update', (update) => {
        if (update.lastDisconnect?.error) {
          const statusCode = update.lastDisconnect.error?.output?.statusCode;

          this.logBotEvent(userId, `Connection error: ${statusCode} - ${update.lastDisconnect.error.message}`);
        }
      });

      this.logBotEvent(userId, `Bot connection initiated via ${method}`);

    } catch (error) {
      console.error(`Error connecting bot for user ${userId}:`, error);
      this.logBotEvent(userId, `Connection error: ${error.message}`);
      this.connectionStates.set(userId, 'error');
      this.io.to(`user-${userId}`).emit('bot-error', { 
        userId, 
        error: error.message,
        type: 'connection'
      });
      throw error;
    }
  }

  async handleConnectionUpdate(userId, update, method = 'qr', phoneNumber = null) {
    const { connection, lastDisconnect, qr, isNewLogin } = update;

    this.logBotEvent(userId, `Connection update: ${connection || 'unknown'}`);

    // Handle QR code generation
    if (qr && method === 'qr') {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(qr, {
          width: 512,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });
        
        this.io.to(`user-${userId}`).emit('qr-code', {
          userId,
          qrCode: qrCodeDataURL,
          method: 'qr'
        });
        
        this.logBotEvent(userId, 'QR code generated and sent to client');
        
        // Set QR retry count
        const retryCount = this.qrRetryCount.get(userId) || 0;
        this.qrRetryCount.set(userId, retryCount + 1);
        
        // Auto-refresh QR after 45 seconds
        setTimeout(() => {
          if (!this.isBotConnected(userId) && this.qrRetryCount.get(userId) < 3) {
            this.logBotEvent(userId, 'QR code expired, generating new one...');
            this.io.to(`user-${userId}`).emit('qr-expired', { userId });
          }
        }, 45000);
        
      } catch (error) {
        console.error('QR code generation error:', error);
        this.logBotEvent(userId, `QR generation error: ${error.message}`);
        this.io.to(`user-${userId}`).emit('bot-error', { 
          userId, 
          error: 'Failed to generate QR code',
          type: 'qr'
        });
      }
    }

    // Handle pairing code for mobile
    if (method === 'pairing' && phoneNumber && !this.isBotConnected(userId)) {
      try {
        const sock = this.bots.get(userId);
        if (sock && !sock.authState?.creds?.registered) {
          // Clean phone number format - remove all non-digits
          const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
          
          // Validate phone number
          if (cleanPhoneNumber.length < 10 || cleanPhoneNumber.length > 15) {
            throw new Error('Invalid phone number format. Please include country code.');
          }
          
          this.logBotEvent(userId, `Requesting pairing code for: +${cleanPhoneNumber}`);
          
          const code = await sock.requestPairingCode(cleanPhoneNumber);
          this.pairingCodes.set(userId, code);
          
          this.io.to(`user-${userId}`).emit('pairing-code', {
            userId,
            code,
            phoneNumber: cleanPhoneNumber,
            method: 'pairing'
          });
          
          this.logBotEvent(userId, `Pairing code generated: ${code}`);
        }
      } catch (error) {
        console.error('Pairing code generation error:', error);
        this.logBotEvent(userId, `Pairing code error: ${error.message}`);
        this.io.to(`user-${userId}`).emit('bot-error', { 
          userId, 
          error: error.message || 'Failed to generate pairing code. Please check your phone number format.',
          type: 'pairing'
        });
      }
    }

    if (connection === 'close') {
      this.connectionStates.set(userId, 'disconnected');
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        const attempts = this.reconnectAttempts.get(userId) || 0;
        
        if (attempts < 3) {
          this.reconnectAttempts.set(userId, attempts + 1);
          this.logBotEvent(userId, `Connection lost, attempting to reconnect (${attempts + 1}/3)...`);
          
          this.io.to(`user-${userId}`).emit('bot-reconnecting', { userId, attempt: attempts + 1 });
          
          // Exponential backoff
          const delay = Math.min(5000 * Math.pow(2, attempts), 30000);
          setTimeout(() => {
            this.connectBot(userId, method, phoneNumber);
          }, delay);
        } else {
          this.logBotEvent(userId, 'Max reconnection attempts reached');
          this.io.to(`user-${userId}`).emit('bot-error', { 
            userId, 
            error: 'Connection failed after multiple attempts. Please try again.',
            type: 'reconnect'
          });
        }
      } else {
        this.logBotEvent(userId, 'Bot logged out');
        this.cleanupBot(userId);
        
        this.io.to(`user-${userId}`).emit('bot-logged-out', { userId });
      }

      this.io.to(`user-${userId}`).emit('bot-disconnected', { userId });
    } else if (connection === 'open') {
      this.connectionStates.set(userId, 'connected');
      this.reconnectAttempts.set(userId, 0);
      this.logBotEvent(userId, 'Bot connected successfully');
      
      // Clear retry counts
      this.qrRetryCount.delete(userId);
      this.pairingCodes.delete(userId);
      
      // Update user bot status
      await this.dbManager.updateUserBotStatus(userId, true);
      
      // Get bot info
      const sock = this.bots.get(userId);
      const botInfo = {
        jid: sock.user.id,
        name: sock.user.name || 'WhatsApp Bot',
        pushName: sock.user.pushName || 'Bot',
        profilePicture: null
      };
      
      this.io.to(`user-${userId}`).emit('bot-connected', { 
        userId, 
        botInfo,
        timestamp: new Date().toISOString()
      });
      
      this.io.to(`user-${userId}`).emit('qr-hidden', { userId });
      
      // Send welcome message to bot owner
      try {
        const ownerJid = sock.user.id.replace(':0', '');
        await sock.sendMessage(ownerJid, {
          text: `🎉 *Bot Connected Successfully!*\n\n✅ Your WhatsApp bot is now active and ready to serve.\n\n🤖 Bot Name: Queen Bot Pro\n⏰ Connected: ${new Date().toLocaleString()}\n\n💡 Type *.menu* to see available commands.`
        });
      } catch (error) {
        this.logBotEvent(userId, `Could not send welcome message: ${error.message}`);
      }
    } else if (connection === 'connecting') {
      this.connectionStates.set(userId, 'connecting');
      this.logBotEvent(userId, 'Connecting to WhatsApp...');
      this.io.to(`user-${userId}`).emit('bot-connecting', { userId });
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
          
          // Emit command usage event
          const command = messageText.slice(settings.prefix.length).trim().split(/\s+/)[0];
          this.io.to(`user-${userId}`).emit('command-used', { 
            userId, 
            command,
            timestamp: new Date().toISOString()
          });
        }

        // Update message count
        await this.dbManager.incrementMessageCount(userId);
        
        // Log message
        const from = message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const messagePreview = messageText?.substring(0, 50) || 'Media message';
        
        this.logBotEvent(userId, `Message ${isGroup ? 'in group' : 'from user'}: ${messagePreview}`);

      } catch (error) {
        console.error('Error handling message:', error);
        this.logBotEvent(userId, `Message handling error: ${error.message}`);
        
        this.io.to(`user-${userId}`).emit('bot-error', { 
          userId, 
          error: error.message,
          type: 'message'
        });
      }
    }
  }

  async handleMessageUpdates(userId, updates) {
    for (const update of updates) {
      this.logBotEvent(userId, `Message updated: ${update.key.id}`);
    }
  }

  async handlePresenceUpdate(userId, update) {
    this.logBotEvent(userId, `Presence update: ${update.id}`);
  }

  async handleChatsUpsert(userId, chats) {
    this.logBotEvent(userId, `${chats.length} chat(s) added`);
    
    // Update stats
    const stats = await this.dbManager.getUserStats(userId);
    stats.totalGroups = chats.filter(chat => chat.id.endsWith('@g.us')).length;
    stats.totalUsers = chats.filter(chat => !chat.id.endsWith('@g.us')).length;
    
    this.io.to(`user-${userId}`).emit('stats-updated', { userId, stats });
  }

  async handleContactsUpsert(userId, contacts) {
    this.logBotEvent(userId, `${contacts.length} contact(s) added`);
  }

  async handleGroupsUpsert(userId, groups) {
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
        
        this.io.to(`user-${userId}`).emit('bot-disconnected', { userId });
      }
    } catch (error) {
      console.error(`Error disconnecting bot for user ${userId}:`, error);
      this.logBotEvent(userId, `Disconnect error: ${error.message}`);
      
      this.io.to(`user-${userId}`).emit('bot-error', { 
        userId, 
        error: error.message,
        type: 'disconnect'
      });
    }
  }

  cleanupBot(userId) {
    this.bots.delete(userId);
    this.stores.delete(userId);
    this.qrRetryCount.delete(userId);
    this.pairingCodes.delete(userId);
    this.connectionStates.delete(userId);
    this.reconnectAttempts.delete(userId);
  }

  async disconnectAllBots() {
    const promises = Array.from(this.bots.keys()).map(userId => this.disconnectBot(userId));
    await Promise.all(promises);
  }

  isBotConnected(userId) {
    const bot = this.bots.get(userId);
    return bot && bot.user && this.connectionStates.get(userId) === 'connected';
  }

  getConnectedBotsCount() {
    return Array.from(this.bots.values()).filter(bot => bot.user).length;
  }

  async getBotStatus(userId) {
    const connected = this.isBotConnected(userId);
    const stats = await this.dbManager.getUserStats(userId);
    const bot = this.bots.get(userId);
    
    let botInfo = null;
    if (connected && bot) {
      botInfo = {
        jid: bot.user.id,
        name: bot.user.name || 'WhatsApp Bot',
        pushName: bot.user.pushName || 'Bot',
        profilePicture: null
      };
    }
    
    return {
      connected,
      botInfo,
      connectionState: this.connectionStates.get(userId) || 'disconnected',
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

  async updateBotSettings(userId, settings) {
    try {
      // Update settings in database
      await this.dbManager.updateUserSettings(userId, settings);
      
      // Notify bot of settings change
      this.io.to(`user-${userId}`).emit('settings-updated', { userId, settings });
      
      this.logBotEvent(userId, 'Settings updated successfully');
      
      // Apply real-time settings to bot
      const bot = this.bots.get(userId);
      if (bot && this.isBotConnected(userId)) {
        // Send confirmation to bot owner
        try {
          const ownerJid = bot.user.id.replace(':0', '');
          await bot.sendMessage(ownerJid, {
            text: `⚙️ *Settings Updated*\n\n✅ Your bot settings have been updated successfully.\n\n🔄 Changes are now active.`
          });
        } catch (error) {
          this.logBotEvent(userId, `Could not send settings update notification: ${error.message}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating bot settings:', error);
      this.logBotEvent(userId, `Settings update error: ${error.message}`);
      this.io.to(`user-${userId}`).emit('bot-error', { 
        userId, 
        error: 'Failed to update settings',
        type: 'settings'
      });
      return false;
    }
  }

  logBotEvent(userId, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Store log in memory
    if (!this.botLogs.has(userId)) this.botLogs.set(userId, []);
    
    const logs = this.botLogs.get(userId);
    logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
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

  getPairingCode(userId) {
    return this.pairingCodes.get(userId);
  }

  async refreshQR(userId) {
    try {
      const bot = this.bots.get(userId);
      if (bot && !this.isBotConnected(userId)) {
        await this.disconnectBot(userId);
        setTimeout(() => {
          this.connectBot(userId, 'qr');
        }, 3000);
        
        this.logBotEvent(userId, 'QR code refresh requested');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing QR:', error);
      this.logBotEvent(userId, `QR refresh error: ${error.message}`);
      return false;
    }
  }
}