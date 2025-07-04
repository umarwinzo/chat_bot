import { Queen } from "../lib/event.js";
import { downloadContentFromMessage, getContentType } from '@whiskeysockets/baileys';

Queen.addCommand({
  pattern: ["sticker", "s"],
  category: "media",
  onlyPm: false,
  onlyGroup: false,
  React: "🎨",
  desc: "Convert image/video to sticker",
  usage: ".sticker (reply to image/video)"
}, async (message, sock) => {
  try {
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quotedMessage) {
      await sock.sendMessage(message.key.remoteJid, { 
        text: "❌ Please reply to an image or video!\n\n📝 Usage: Reply to an image/video with .sticker\n💡 Supported: JPG, PNG, MP4, GIF" 
      });
      return;
    }

    const messageType = getContentType(quotedMessage);
    
    if (!['imageMessage', 'videoMessage'].includes(messageType)) {
      await sock.sendMessage(message.key.remoteJid, { 
        text: "❌ Please reply to an image or video!\n\n📝 Supported formats:\n• Images: JPG, PNG, GIF\n• Videos: MP4 (max 10 seconds)" 
      });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, { 
      text: "🎨 Creating sticker... Please wait!" 
    });

    // Download the media
    const stream = await downloadContentFromMessage(quotedMessage[messageType], messageType.replace('Message', ''));
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Send as sticker
    await sock.sendMessage(message.key.remoteJid, {
      sticker: buffer
    });

    await sock.sendMessage(message.key.remoteJid, { 
      text: "✅ *Sticker created successfully!*\n\n🎨 *Converted by Queen Bot Pro*" 
    });

  } catch (error) {
    console.error('Sticker creation error:', error);
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to create sticker!\n\n🔧 *Possible reasons:*\n• File too large\n• Unsupported format\n• Network error\n\n💡 Try with a smaller image/video." 
    });
  }
});

Queen.addCommand({
  pattern: ["toimg", "toimage"],
  category: "media",
  onlyPm: false,
  onlyGroup: false,
  React: "🖼️",
  desc: "Convert sticker to image",
  usage: ".toimg (reply to sticker)"
}, async (message, sock) => {
  try {
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quotedMessage || !quotedMessage.stickerMessage) {
      await sock.sendMessage(message.key.remoteJid, { 
        text: "❌ Please reply to a sticker!\n\n📝 Usage: Reply to a sticker with .toimg\n💡 This converts stickers to images" 
      });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, { 
      text: "🖼️ Converting sticker to image... Please wait!" 
    });

    // Download the sticker
    const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Send as image
    await sock.sendMessage(message.key.remoteJid, {
      image: buffer,
      caption: "🖼️ *Sticker converted to image!*\n\n✅ *Converted by Queen Bot Pro*"
    });

  } catch (error) {
    console.error('Image conversion error:', error);
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to convert sticker!\n\n🔧 *Possible reasons:*\n• Invalid sticker format\n• Network error\n• Processing failed\n\n💡 Try with a different sticker." 
    });
  }
});

Queen.addCommand({
  pattern: ["download", "dl"],
  category: "media",
  onlyPm: false,
  onlyGroup: false,
  React: "⬇️",
  desc: "Download media from URL",
  usage: ".download <url>"
}, async (message, sock, args) => {
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Please provide a URL to download!\n\n📝 Usage: .download <url>\n💡 Example: .download https://example.com/video.mp4\n\n🔗 *Supported:*\n• YouTube videos\n• Instagram posts\n• TikTok videos\n• Direct media links" 
    });
    return;
  }

  const url = args[0];
  
  // Basic URL validation
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Invalid URL format!\n\n📝 Please provide a valid URL starting with http:// or https://\n💡 Example: https://example.com/video.mp4" 
    });
    return;
  }

  await sock.sendMessage(message.key.remoteJid, { 
    text: "⬇️ Download feature coming soon!\n\n🚧 *Currently in development*\n\n🔜 *Upcoming features:*\n• YouTube video download\n• Instagram media download\n• TikTok video download\n• Direct file download\n\n💡 *Alternative:* Use online downloaders for now.\n\n🤖 *Queen Bot Pro Team*" 
  });
});

export {};