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
      await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please reply to an image or video!") });
      return;
    }

    const messageType = getContentType(quotedMessage);
    
    if (!['imageMessage', 'videoMessage'].includes(messageType)) {
      await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please reply to an image or video!") });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, { text: Queen.infoMessage("Creating sticker...") });

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

  } catch (error) {
    console.error('Sticker creation error:', error);
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to create sticker!") });
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
      await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please reply to a sticker!") });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, { text: Queen.infoMessage("Converting sticker to image...") });

    // Download the sticker
    const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Send as image
    await sock.sendMessage(message.key.remoteJid, {
      image: buffer,
      caption: "🖼️ Sticker converted to image!"
    });

  } catch (error) {
    console.error('Image conversion error:', error);
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to convert sticker!") });
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
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a URL to download!") });
    return;
  }

  const url = args[0];
  await sock.sendMessage(message.key.remoteJid, { text: Queen.infoMessage("Downloading... Please wait!") });
  
  try {
    // Implement download logic here
    await sock.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("Download feature coming soon!") });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to download media!") });
  }
});

export {};