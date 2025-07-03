import { Queen } from "../lib/event.js";

Queen.addCommand({
  pattern: ["kick"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "👢",
  adminOnly: true,
  desc: "Kick user from group",
  usage: ".kick @user"
}, async (message, sock) => {
  try {
    if (!message.key.remoteJid.endsWith('@g.us')) {
      await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("This command only works in groups!") });
      return;
    }

    // Get mentioned users
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentionedJids.length === 0) {
      await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please mention a user to kick!") });
      return;
    }

    await sock.groupParticipantsUpdate(message.key.remoteJid, mentionedJids, 'remove');
    await sock.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("User(s) kicked successfully!") });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to kick user(s)!") });
  }
});

Queen.addCommand({
  pattern: ["promote"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "👑",
  adminOnly: true,
  desc: "Promote user to admin",
  usage: ".promote @user"
}, async (message, sock) => {
  try {
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentionedJids.length === 0) {
      await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please mention a user to promote!") });
      return;
    }

    await sock.groupParticipantsUpdate(message.key.remoteJid, mentionedJids, 'promote');
    await sock.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("User(s) promoted successfully!") });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to promote user(s)!") });
  }
});

Queen.addCommand({
  pattern: ["demote"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "📉",
  adminOnly: true,
  desc: "Demote user from admin",
  usage: ".demote @user"
}, async (message, sock) => {
  try {
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentionedJids.length === 0) {
      await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please mention a user to demote!") });
      return;
    }

    await sock.groupParticipantsUpdate(message.key.remoteJid, mentionedJids, 'demote');
    await sock.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("User(s) demoted successfully!") });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to demote user(s)!") });
  }
});

Queen.addCommand({
  pattern: ["everyone", "tagall"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "📢",
  adminOnly: true,
  desc: "Tag all group members",
  usage: ".everyone <message>"
}, async (message, sock, args) => {
  try {
    const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
    const participants = groupMetadata.participants;
    
    const text = args.join(' ') || 'Attention everyone!';
    let mentions = [];
    let mentionText = '';
    
    for (let participant of participants) {
      mentions.push(participant.id);
      mentionText += `@${participant.id.split('@')[0]} `;
    }

    await sock.sendMessage(message.key.remoteJid, { 
      text: `${text}\n\n${mentionText}`,
      mentions: mentions
    });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to tag everyone!") });
  }
});

Queen.addCommand({
  pattern: ["mute"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "🔇",
  adminOnly: true,
  desc: "Mute group (only admins can send messages)",
  usage: ".mute"
}, async (message, sock) => {
  try {
    await sock.groupSettingUpdate(message.key.remoteJid, 'announcement');
    await sock.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("Group muted! Only admins can send messages now.") });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to mute group!") });
  }
});

Queen.addCommand({
  pattern: ["unmute"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "🔊",
  adminOnly: true,
  desc: "Unmute group (everyone can send messages)",
  usage: ".unmute"
}, async (message, sock) => {
  try {
    await sock.groupSettingUpdate(message.key.remoteJid, 'not_announcement');
    await sock.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("Group unmuted! Everyone can send messages now.") });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to unmute group!") });
  }
});

export {};