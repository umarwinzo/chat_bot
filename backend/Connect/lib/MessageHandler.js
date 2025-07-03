import { getContentType, downloadContentFromMessage } from '@whiskeysockets/baileys';

export class MessageHandler {
  constructor() {
    this.messageFilters = [];
    this.autoReplyEnabled = false;
  }

  async processMessage(userId, message, sock) {
    try {
      // Auto-read messages
      if (message.key.remoteJid && !message.key.fromMe) {
        await sock.readMessages([message.key]);
      }

      // Auto-typing
      await sock.sendPresenceUpdate('composing', message.key.remoteJid);
      setTimeout(async () => {
        await sock.sendPresenceUpdate('paused', message.key.remoteJid);
      }, 1000);

      // Process different message types
      const messageType = getContentType(message.message);
      
      switch (messageType) {
        case 'conversation':
        case 'extendedTextMessage':
          await this.handleTextMessage(userId, message, sock);
          break;
        case 'imageMessage':
          await this.handleImageMessage(userId, message, sock);
          break;
        case 'videoMessage':
          await this.handleVideoMessage(userId, message, sock);
          break;
        case 'audioMessage':
          await this.handleAudioMessage(userId, message, sock);
          break;
        case 'documentMessage':
          await this.handleDocumentMessage(userId, message, sock);
          break;
        case 'stickerMessage':
          await this.handleStickerMessage(userId, message, sock);
          break;
        default:
          console.log(`Unhandled message type: ${messageType}`);
      }

    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  async handleTextMessage(userId, message, sock) {
    const text = message.message.conversation || message.message.extendedTextMessage?.text;
    
    // Anti-link filter
    if (this.containsLink(text)) {
      // Handle link detection
      console.log('Link detected in message');
    }

    // Auto-reply for greetings
    if (this.isGreeting(text)) {
      const greetings = [
        "👋 Hello! How can I help you today?",
        "🤖 Hi there! I'm your bot assistant.",
        "✨ Greetings! Ready to help you out!",
        "🌟 Hey! What can I do for you?",
        "💫 Hello! Type .menu for commands!"
      ];
      
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      setTimeout(async () => {
        await sock.sendMessage(message.key.remoteJid, {
          text: randomGreeting
        });
      }, 1000);
    }
  }

  async handleImageMessage(userId, message, sock) {
    const imageMessage = message.message.imageMessage;
    console.log('Image message received:', imageMessage.caption || 'No caption');
    
    // Auto-react to images
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: '📸',
        key: message.key
      }
    });
  }

  async handleVideoMessage(userId, message, sock) {
    const videoMessage = message.message.videoMessage;
    console.log('Video message received:', videoMessage.caption || 'No caption');
    
    // Auto-react to videos
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: '🎥',
        key: message.key
      }
    });
  }

  async handleAudioMessage(userId, message, sock) {
    const audioMessage = message.message.audioMessage;
    console.log('Audio message received');
    
    // Auto-react to audio
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: '🎵',
        key: message.key
      }
    });
  }

  async handleDocumentMessage(userId, message, sock) {
    const documentMessage = message.message.documentMessage;
    console.log('Document received:', documentMessage.fileName);
    
    // Auto-react to documents
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: '📄',
        key: message.key
      }
    });
  }

  async handleStickerMessage(userId, message, sock) {
    console.log('Sticker message received');
    
    // Auto-react to stickers
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: '😄',
        key: message.key
      }
    });
  }

  containsLink(text) {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    return linkRegex.test(text);
  }

  isGreeting(text) {
    const greetingWords = ['hi', 'hello', 'hey', 'helo', 'hii', 'good morning', 'good evening', 'good night'];
    const lowerText = text.toLowerCase();
    return greetingWords.some(greeting => lowerText.includes(greeting));
  }

  async downloadMedia(message) {
    try {
      const messageType = getContentType(message.message);
      const stream = await downloadContentFromMessage(message.message[messageType], messageType.replace('Message', ''));
      
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      
      return buffer;
    } catch (error) {
      console.error('Error downloading media:', error);
      throw error;
    }
  }
}