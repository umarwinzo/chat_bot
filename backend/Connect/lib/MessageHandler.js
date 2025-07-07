import { getContentType, downloadContentFromMessage } from '@whiskeysockets/baileys';

export class MessageHandler {
  constructor() {
    this.messageFilters = [];
    this.autoReplyEnabled = false;
  }

  async processMessage(userId, message, sock) {
    try {
      console.log(`📨 Processing message from ${message.key.remoteJid}`);
      
      // Skip if message is from bot itself
      if (message.key.fromMe) {
        console.log('⏭️ Skipping message from bot itself');
        return;
      }

      // Auto-read messages
      if (message.key.remoteJid && !message.key.fromMe) {
        try {
          await sock.readMessages([message.key]);
          console.log('✅ Message marked as read');
        } catch (error) {
          console.log('❌ Failed to mark message as read:', error.message);
        }
      }

      // Auto-typing
      try {
        await sock.sendPresenceUpdate('composing', message.key.remoteJid);
        setTimeout(async () => {
          try {
            await sock.sendPresenceUpdate('paused', message.key.remoteJid);
          } catch (error) {
            console.log('❌ Failed to update presence to paused:', error.message);
          }
        }, 1000);
      } catch (error) {
        console.log('❌ Failed to update presence:', error.message);
      }

      // Process different message types
      const messageType = getContentType(message.message);
      console.log(`📝 Message type: ${messageType}`);
      
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
          console.log(`❓ Unhandled message type: ${messageType}`);
      }

    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  async handleTextMessage(userId, message, sock) {
    const text = message.message.conversation || message.message.extendedTextMessage?.text;
    console.log(`💬 Text message: "${text}"`);
    
    // Anti-link filter
    if (this.containsLink(text)) {
      console.log('🔗 Link detected in message');
    }

    // Auto-reply for greetings (only if not a command)
    if (this.isGreeting(text) && !text.startsWith('.')) {
      const greetings = [
        "👋 Hello! How can I help you today?",
        "🤖 Hi there! I'm your bot assistant.",
        "✨ Greetings! Ready to help you out!",
        "🌟 Hey! What can I do for you?",
        "💫 Hello! Type .menu for commands!"
      ];
      
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      setTimeout(async () => {
        try {
          await sock.sendMessage(message.key.remoteJid, {
            text: randomGreeting
          });
          console.log('✅ Greeting response sent');
        } catch (error) {
          console.log('❌ Failed to send greeting:', error.message);
        }
      }, 1000);
    }
  }

  async handleImageMessage(userId, message, sock) {
    const imageMessage = message.message.imageMessage;
    console.log('📸 Image message received:', imageMessage.caption || 'No caption');
    
    // Auto-react to images
    try {
      await sock.sendMessage(message.key.remoteJid, {
        react: {
          text: '📸',
          key: message.key
        }
      });
      console.log('✅ Image reaction sent');
    } catch (error) {
      console.log('❌ Failed to react to image:', error.message);
    }
  }

  async handleVideoMessage(userId, message, sock) {
    const videoMessage = message.message.videoMessage;
    console.log('🎥 Video message received:', videoMessage.caption || 'No caption');
    
    // Auto-react to videos
    try {
      await sock.sendMessage(message.key.remoteJid, {
        react: {
          text: '🎥',
          key: message.key
        }
      });
      console.log('✅ Video reaction sent');
    } catch (error) {
      console.log('❌ Failed to react to video:', error.message);
    }
  }

  async handleAudioMessage(userId, message, sock) {
    const audioMessage = message.message.audioMessage;
    console.log('🎵 Audio message received');
    
    // Auto-react to audio
    try {
      await sock.sendMessage(message.key.remoteJid, {
        react: {
          text: '🎵',
          key: message.key
        }
      });
      console.log('✅ Audio reaction sent');
    } catch (error) {
      console.log('❌ Failed to react to audio:', error.message);
    }
  }

  async handleDocumentMessage(userId, message, sock) {
    const documentMessage = message.message.documentMessage;
    console.log('📄 Document received:', documentMessage.fileName);
    
    // Auto-react to documents
    try {
      await sock.sendMessage(message.key.remoteJid, {
        react: {
          text: '📄',
          key: message.key
        }
      });
      console.log('✅ Document reaction sent');
    } catch (error) {
      console.log('❌ Failed to react to document:', error.message);
    }
  }

  async handleStickerMessage(userId, message, sock) {
    console.log('😄 Sticker message received');
    
    // Auto-react to stickers
    try {
      await sock.sendMessage(message.key.remoteJid, {
        react: {
          text: '😄',
          key: message.key
        }
      });
      console.log('✅ Sticker reaction sent');
    } catch (error) {
      console.log('❌ Failed to react to sticker:', error.message);
    }
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
      console.error('❌ Error downloading media:', error);
      throw error;
    }
  }
}