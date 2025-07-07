import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.categories = new Map();
    this.loadedPlugins = new Set();
  }

  async loadCommands() {
    const pluginDir = path.join(__dirname, '../plugin');
    console.log('🔄 Loading commands from:', pluginDir);

    try {
      if (!fs.existsSync(pluginDir)) {
        console.error('❌ Plugin directory does not exist:', pluginDir);
        return;
      }

      const files = fs.readdirSync(pluginDir);
      console.log('📁 Found plugin files:', files);

      for (const file of files) {
        if (file.endsWith('.js')) {
          try {
            const pluginPath = path.join(pluginDir, file);
            const pluginUrl = pathToFileURL(pluginPath).href + '?t=' + Date.now(); // Cache busting

            console.log(`🔄 Loading plugin: ${file}`);
            
            // Clear module cache for hot reload
            if (this.loadedPlugins.has(file)) {
              delete require.cache[pluginPath];
            }

            const pluginModule = await import(pluginUrl);

            // Call default export if it's a function
            if (typeof pluginModule.default === 'function') {
              pluginModule.default(this);
            }

            this.loadedPlugins.add(file);
            console.log(`✅ Plugin loaded successfully: ${file}`);
          } catch (error) {
            console.error(`❌ Error loading plugin ${file}:`, error);
          }
        }
      }

      console.log(`🎉 Total commands loaded: ${this.commands.size}`);
      console.log('📋 Available commands:', Array.from(this.commands.keys()));
    } catch (error) {
      console.error('❌ Error loading plugins directory:', error);
    }
  }

  addCommand(info, func) {
    const commandInfo = {
      pattern: info.pattern || [],
      category: info.category || "all",
      fromMe: info.fromMe !== undefined ? info.fromMe : false, // Changed to false for user commands
      onlyGroup: info.onlyGroup || false,
      onlyPm: info.onlyPm || false,
      onlyPinned: info.onlyPinned || false,
      React: info.React || "",
      adminOnly: info.adminOnly || false,
      ownerOnly: info.ownerOnly || false,
      groupAdminOnly: info.groupAdminOnly || false,
      desc: info.desc || "",
      usage: info.usage || "",
      filename: info.filename || "",
      function: func
    };

    // Handle both array and single pattern
    const patterns = Array.isArray(info.pattern) ? info.pattern : [info.pattern];
    
    patterns.forEach(pattern => {
      if (pattern) {
        this.commands.set(pattern.toLowerCase(), commandInfo);
        console.log(`📝 Registered command: ${pattern}`);
      }
    });

    // Store in category
    if (!this.categories.has(commandInfo.category)) {
      this.categories.set(commandInfo.category, []);
    }
    this.categories.get(commandInfo.category).push(commandInfo);

    return commandInfo;
  }

  async handleCommand(userId, message, sock, settings) {
    try {
      const messageText = this.extractMessageText(message);
      if (!messageText) return;

      console.log(`📨 Processing message: "${messageText}" from ${message.key.remoteJid}`);

      // Check if message starts with prefix
      if (!messageText.startsWith(settings.prefix)) {
        console.log(`❌ Message doesn't start with prefix: ${settings.prefix}`);
        return;
      }

      const args = messageText.slice(settings.prefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();

      console.log(`🔍 Looking for command: "${commandName}"`);
      console.log(`📋 Available commands: ${Array.from(this.commands.keys()).join(', ')}`);

      // Find command
      const command = this.commands.get(commandName);
      if (!command) {
        console.log(`❌ Command not found: ${commandName}`);
        await sock.sendMessage(message.key.remoteJid, {
          text: `❌ Command ".${commandName}" not found. Type .menu to see available commands.`
        });
        return;
      }

      console.log(`✅ Found command: ${commandName}`);

      // Check if command is enabled
      if (settings.enabledCommands && settings.enabledCommands[commandName] === false) {
        console.log(`❌ Command disabled: ${commandName}`);
        await sock.sendMessage(message.key.remoteJid, {
          text: `❌ Command ".${commandName}" is disabled`
        });
        return;
      }

      // Permission checks
      const senderJid = message.key.participant || message.key.remoteJid;
      const isOwner = senderJid === settings.ownerNumber || senderJid.replace('@s.whatsapp.net', '') === settings.ownerNumber;
      
      if (command.ownerOnly && !isOwner) {
        console.log(`❌ Owner only command: ${commandName}`);
        await sock.sendMessage(message.key.remoteJid, {
          text: "👨‍💻 This command is only available to the bot owner!"
        });
        return;
      }

      if (command.adminOnly && !await this.isAdmin(message, sock)) {
        console.log(`❌ Admin only command: ${commandName}`);
        await sock.sendMessage(message.key.remoteJid, {
          text: "👑 This command requires admin privileges!"
        });
        return;
      }

      if (command.onlyGroup && !message.key.remoteJid.endsWith('@g.us')) {
        console.log(`❌ Group only command: ${commandName}`);
        await sock.sendMessage(message.key.remoteJid, {
          text: "👥 This command only works in groups!"
        });
        return;
      }

      if (command.onlyPm && message.key.remoteJid.endsWith('@g.us')) {
        console.log(`❌ PM only command: ${commandName}`);
        await sock.sendMessage(message.key.remoteJid, {
          text: "💬 This command only works in private chat!"
        });
        return;
      }

      // React to command if specified
      if (command.React) {
        try {
          await sock.sendMessage(message.key.remoteJid, {
            react: {
              text: command.React,
              key: message.key
            }
          });
        } catch (error) {
          console.log('❌ Failed to react:', error.message);
        }
      }

      console.log(`🚀 Executing command: ${commandName}`);

      // Execute command
      await command.function(message, sock, args, settings);

      console.log(`✅ Command executed successfully: ${commandName}`);

    } catch (error) {
      console.error('❌ Command execution error:', error);
      try {
        await sock.sendMessage(message.key.remoteJid, {
          text: `❌ Error executing command: ${error.message}`
        });
      } catch (sendError) {
        console.error('❌ Failed to send error message:', sendError);
      }
    }
  }

  extractMessageText(message) {
    if (!message.message) return '';

    if (message.message.conversation) {
      return message.message.conversation;
    }
    if (message.message.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }
    if (message.message.videoMessage?.caption) {
      return message.message.videoMessage.caption;
    }
    return '';
  }

  async isAdmin(message, sock) {
    try {
      if (!message.key.remoteJid.endsWith('@g.us')) {
        return false;
      }

      const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
      const participant = message.key.participant || message.key.remoteJid;

      return groupMetadata.participants.some(p =>
        p.id === participant && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  }

  getCommands() {
    return Array.from(this.commands.values());
  }

  getCommandsByCategory(category) {
    return this.categories.get(category) || [];
  }

  getAllCategories() {
    return Array.from(this.categories.keys());
  }

  // Reload commands (for hot reload)
  async reloadCommands() {
    console.log('🔄 Reloading all commands...');
    this.commands.clear();
    this.categories.clear();
    this.loadedPlugins.clear();
    await this.loadCommands();
  }
}