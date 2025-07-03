import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.categories = new Map();
  }

  async loadCommands() {
    const pluginDir = path.join(__dirname, '../plugin');

    try {
      const files = fs.readdirSync(pluginDir);

      for (const file of files) {
        if (file.endsWith('.js')) {
          try {
            const pluginPath = path.join(pluginDir, file);
            const pluginUrl = pathToFileURL(pluginPath).href;

            const pluginModule = await import(pluginUrl);

            // Call default export if it's a function
            if (typeof pluginModule.default === 'function') {
              pluginModule.default(this); // pass CommandHandler instance
            }

            console.log(`✅ Plugin loaded: ${file}`);
          } catch (error) {
            console.error(`❌ Error loading plugin ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading plugins directory:', error);
    }
  }

  addCommand(info, func) {
    const commandInfo = {
      pattern: info.pattern || [],
      category: info.category || "all",
      fromMe: info.fromMe !== undefined ? info.fromMe : true,
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

    if (Array.isArray(info.pattern)) {
      info.pattern.forEach(pattern => {
        this.commands.set(pattern, commandInfo);
      });
    } else if (info.pattern) {
      this.commands.set(info.pattern, commandInfo);
    }

    if (!this.categories.has(commandInfo.category)) {
      this.categories.set(commandInfo.category, []);
    }
    this.categories.get(commandInfo.category).push(commandInfo);

    return commandInfo;
  }

  async handleCommand(userId, message, sock, settings) {
    try {
      const messageText = this.extractMessageText(message);
      if (!messageText || !messageText.startsWith(settings.prefix)) {
        return;
      }

      const args = messageText.slice(settings.prefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();
      const command = this.commands.get(commandName);
      if (!command) return;

      if (settings.enabledCommands && !settings.enabledCommands[commandName]) {
        await sock.sendMessage(message.key.remoteJid, {
          text: `❌ Command .${commandName} is disabled`
        });
        return;
      }

      if (command.ownerOnly && message.key.remoteJid !== settings.ownerNumber) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "👨‍💻 This command is only available to the bot owner!"
        });
        return;
      }

      if (command.adminOnly && !await this.isAdmin(message, sock)) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "👑 This command requires admin privileges!"
        });
        return;
      }

      if (command.onlyGroup && !message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "👥 This command only works in groups!"
        });
        return;
      }

      if (command.onlyPm && message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "💬 This command only works in private chat!"
        });
        return;
      }

      if (command.React) {
        await sock.sendMessage(message.key.remoteJid, {
          react: {
            text: command.React,
            key: message.key
          }
        });
      }

      await command.function(message, sock, args, settings);

      console.log(`Command executed: ${commandName} by ${message.key.participant || message.key.remoteJid}`);
    } catch (error) {
      console.error('Command execution error:', error);
      await sock.sendMessage(message.key.remoteJid, {
        text: `❌ Error executing command: ${error.message}`
      });
    }
  }

  extractMessageText(message) {
    if (message.message?.conversation) {
      return message.message.conversation;
    }
    if (message.message?.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message?.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }
    if (message.message?.videoMessage?.caption) {
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
      console.error('Error checking admin status:', error);
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
}


/*
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.categories = new Map();
  }

  loadCommands() {
    const pluginDir = path.join(__dirname, '../plugin');
    
    try {
      const files = fs.readdirSync(pluginDir);
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          try {
            const pluginPath = path.join(pluginDir, file);
            // Dynamic import for ES modules
            import(pluginPath).then(() => {
              console.log(`✅ Plugin loaded: ${file}`);
            }).catch(error => {
              console.error(`❌ Error loading plugin ${file}:`, error);
            });
          } catch (error) {
            console.error(`❌ Error loading plugin ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading plugins directory:', error);
    }
  }

  addCommand(info, func) {
    const commandInfo = {
      pattern: info.pattern || [],
      category: info.category || "all",
      fromMe: info.fromMe !== undefined ? info.fromMe : true,
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

    // Store command
    if (Array.isArray(info.pattern)) {
      info.pattern.forEach(pattern => {
        this.commands.set(pattern, commandInfo);
      });
    } else if (info.pattern) {
      this.commands.set(info.pattern, commandInfo);
    }

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
      if (!messageText || !messageText.startsWith(settings.prefix)) {
        return;
      }

      const args = messageText.slice(settings.prefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();

      // Find command
      const command = this.commands.get(commandName);
      if (!command) {
        return; // Command not found
      }

      // Check if command is enabled
      if (settings.enabledCommands && !settings.enabledCommands[commandName]) {
        await sock.sendMessage(message.key.remoteJid, {
          text: `❌ Command .${commandName} is disabled`
        });
        return;
      }

      // Permission checks
      if (command.ownerOnly && message.key.remoteJid !== settings.ownerNumber) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "👨‍💻 This command is only available to the bot owner!"
        });
        return;
      }

      if (command.adminOnly && !await this.isAdmin(message, sock)) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "👑 This command requires admin privileges!"
        });
        return;
      }

      if (command.onlyGroup && !message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "👥 This command only works in groups!"
        });
        return;
      }

      if (command.onlyPm && message.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(message.key.remoteJid, {
          text: "💬 This command only works in private chat!"
        });
        return;
      }

      // React to command if specified
      if (command.React) {
        await sock.sendMessage(message.key.remoteJid, {
          react: {
            text: command.React,
            key: message.key
          }
        });
      }

      // Execute command
      await command.function(message, sock, args, settings);

      // Log command usage
      console.log(`Command executed: ${commandName} by ${message.key.participant || message.key.remoteJid}`);

    } catch (error) {
      console.error('Command execution error:', error);
      await sock.sendMessage(message.key.remoteJid, {
        text: `❌ Error executing command: ${error.message}`
      });
    }
  }

  extractMessageText(message) {
    if (message.message?.conversation) {
      return message.message.conversation;
    }
    if (message.message?.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message?.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }
    if (message.message?.videoMessage?.caption) {
      return message.message.videoMessage.caption;
    }
    return '';
  }

  async isAdmin(message, sock) {
    try {
      if (!message.key.remoteJid.endsWith('@g.us')) {
        return false; // Not a group
      }

      const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
      const participant = message.key.participant || message.key.remoteJid;
      
      return groupMetadata.participants.some(p => 
        p.id === participant && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } catch (error) {
      console.error('Error checking admin status:', error);
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
}
*/