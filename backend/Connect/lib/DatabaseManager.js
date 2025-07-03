import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.statsFile = path.join(this.dataDir, 'stats.json');
    
    // Ensure data directory exists
    fs.ensureDirSync(this.dataDir);
    
    // Initialize files if they don't exist
    this.initializeFiles();
  }

  initializeFiles() {
    if (!fs.existsSync(this.usersFile)) {
      fs.writeJsonSync(this.usersFile, []);
    }
    
    if (!fs.existsSync(this.statsFile)) {
      fs.writeJsonSync(this.statsFile, {
        totalMessages: 0,
        totalCommands: 0,
        totalUsers: 0
      });
    }
  }

  async createUser(userData) {
    try {
      const users = await this.getAllUsers();
      users.push(userData);
      await fs.writeJson(this.usersFile, users, { spaces: 2 });
      
      // Create user settings file
      const settingsPath = path.join(this.dataDir, `${userData.id}_settings.json`);
      const defaultSettings = {
        botName: 'Queen Bot Pro',
        prefix: '.',
        language: 'EN',
        ownerNumber: '',
        autoReact: true,
        autoRead: false,
        autoTyping: true,
        welcomeMessage: true,
        antiLink: false,
        antiSpam: true,
        autoReply: false,
        aiChatbot: false,
        voiceToText: false,
        textToVoice: false,
        imageGeneration: false,
        weatherUpdates: true,
        newsUpdates: true,
        reminderSystem: true,
        groupManagement: true,
        adminOnly: false,
        groupAdminOnly: false,
        blockUnknown: false,
        antiFlood: true,
        maxMessagesPerMinute: 10,
        maxDownloadSize: '100MB',
        allowedFileTypes: ['image', 'video', 'audio', 'document'],
        autoDownloadMedia: false,
        compressImages: true,
        responseDelay: 1000,
        workMode: 'public',
        logMessages: true,
        saveMedia: true,
        notifyOnCommand: true,
        notifyOnError: true,
        notifyOnNewUser: false,
        notifyOnGroupJoin: true,
        autoReplyText: 'Hello! I am currently unavailable. I will get back to you soon.',
        autoReplyEnabled: false,
        welcomeText: 'Welcome to our group! Please read the rules and enjoy your stay.',
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
      
      await fs.writeJson(settingsPath, defaultSettings, { spaces: 2 });
      
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await fs.readJson(this.usersFile);
    } catch (error) {
      console.error('Error reading users:', error);
      return [];
    }
  }

  async getUserById(userId) {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.id === userId);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email) {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.email === email);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUserByUsername(username) {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.username === username);
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async updateUserLastLogin(userId) {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].lastLogin = new Date().toISOString();
        await fs.writeJson(this.usersFile, users, { spaces: 2 });
      }
    } catch (error) {
      console.error('Error updating user last login:', error);
    }
  }

  async updateUserBotStatus(userId, connected) {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].botConnected = connected;
        if (connected) {
          users[userIndex].lastConnected = new Date().toISOString();
        }
        await fs.writeJson(this.usersFile, users, { spaces: 2 });
      }
    } catch (error) {
      console.error('Error updating user bot status:', error);
    }
  }

  async getUserSettings(userId) {
    try {
      const settingsPath = path.join(this.dataDir, `${userId}_settings.json`);
      
      if (fs.existsSync(settingsPath)) {
        return await fs.readJson(settingsPath);
      }
      
      // Return default settings if file doesn't exist
      return {
        botName: 'Queen Bot Pro',
        prefix: '.',
        language: 'EN',
        ownerNumber: '',
        autoReact: true,
        autoRead: false,
        autoTyping: true,
        welcomeMessage: true,
        antiLink: false,
        antiSpam: true,
        autoReply: false,
        aiChatbot: false,
        voiceToText: false,
        textToVoice: false,
        imageGeneration: false,
        weatherUpdates: true,
        newsUpdates: true,
        reminderSystem: true,
        groupManagement: true,
        adminOnly: false,
        groupAdminOnly: false,
        blockUnknown: false,
        antiFlood: true,
        maxMessagesPerMinute: 10,
        maxDownloadSize: '100MB',
        allowedFileTypes: ['image', 'video', 'audio', 'document'],
        autoDownloadMedia: false,
        compressImages: true,
        responseDelay: 1000,
        workMode: 'public',
        logMessages: true,
        saveMedia: true,
        notifyOnCommand: true,
        notifyOnError: true,
        notifyOnNewUser: false,
        notifyOnGroupJoin: true,
        autoReplyText: 'Hello! I am currently unavailable. I will get back to you soon.',
        autoReplyEnabled: false,
        welcomeText: 'Welcome to our group! Please read the rules and enjoy your stay.',
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
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      const settingsPath = path.join(this.dataDir, `${userId}_settings.json`);
      await fs.writeJson(settingsPath, settings, { spaces: 2 });
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const statsPath = path.join(this.dataDir, `${userId}_stats.json`);
      
      if (fs.existsSync(statsPath)) {
        return await fs.readJson(statsPath);
      }
      
      // Return default stats
      return {
        totalUsers: 0,
        totalGroups: 0,
        totalCommands: 0,
        messageCount: 0,
        activeUsers: 0,
        bannedUsers: 0,
        lastConnected: null,
        enabledCommands: {}
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {};
    }
  }

  async incrementMessageCount(userId) {
    try {
      const stats = await this.getUserStats(userId);
      stats.messageCount = (stats.messageCount || 0) + 1;
      
      const statsPath = path.join(this.dataDir, `${userId}_stats.json`);
      await fs.writeJson(statsPath, stats, { spaces: 2 });
      
      // Update global stats
      const globalStats = await fs.readJson(this.statsFile);
      globalStats.totalMessages = (globalStats.totalMessages || 0) + 1;
      await fs.writeJson(this.statsFile, globalStats, { spaces: 2 });
    } catch (error) {
      console.error('Error incrementing message count:', error);
    }
  }

  async incrementCommandCount(userId) {
    try {
      const stats = await this.getUserStats(userId);
      stats.totalCommands = (stats.totalCommands || 0) + 1;
      
      const statsPath = path.join(this.dataDir, `${userId}_stats.json`);
      await fs.writeJson(statsPath, stats, { spaces: 2 });
      
      // Update global stats
      const globalStats = await fs.readJson(this.statsFile);
      globalStats.totalCommands = (globalStats.totalCommands || 0) + 1;
      await fs.writeJson(this.statsFile, globalStats, { spaces: 2 });
    } catch (error) {
      console.error('Error incrementing command count:', error);
    }
  }

  async getTotalMessages() {
    try {
      const stats = await fs.readJson(this.statsFile);
      return stats.totalMessages || 0;
    } catch (error) {
      return 0;
    }
  }

  async getTotalCommands() {
    try {
      const stats = await fs.readJson(this.statsFile);
      return stats.totalCommands || 0;
    } catch (error) {
      return 0;
    }
  }
}