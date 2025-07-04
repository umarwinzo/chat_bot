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
      await sock.sendMessage(message.key.remoteJid, { 
        text: "❌ This command only works in groups!\n\n💡 Use this command in a WhatsApp group." 
      });
      return;
    }

    // Get mentioned users
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentionedJids.length === 0) {
      await sock.sendMessage(message.key.remoteJid, { 
        text: "❌ Please mention a user to kick!\n\n📝 Usage: .kick @username\n💡 Example: .kick @john" 
      });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, { 
      text: "⏳ Kicking user(s)..." 
    });

    await sock.groupParticipantsUpdate(message.key.remoteJid, mentionedJids, 'remove');
    
    await sock.sendMessage(message.key.remoteJid, { 
      text: `✅ *User(s) kicked successfully!*\n\n👢 Removed ${mentionedJids.length} user(s) from the group.\n\n🛡️ *Action by Queen Bot Pro*` 
    });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to kick user(s)!\n\n🔧 *Possible reasons:*\n• Bot is not admin\n• User is admin\n• Network error\n\n💡 Make sure bot has admin privileges." 
    });
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
      await sock.sendMessage(message.key.remoteJid, { 
        text: "❌ Please mention a user to promote!\n\n📝 Usage: .promote @username\n💡 Example: .promote @john" 
      });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, { 
      text: "⏳ Promoting user(s)..." 
    });

    await sock.groupParticipantsUpdate(message.key.remoteJid, mentionedJids, 'promote');
    
    await sock.sendMessage(message.key.remoteJid, { 
      text: `✅ *User(s) promoted successfully!*\n\n👑 Promoted ${mentionedJids.length} user(s) to admin.\n\n🎉 *Congratulations to the new admin(s)!*\n\n🛡️ *Action by Queen Bot Pro*` 
    });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to promote user(s)!\n\n🔧 *Possible reasons:*\n• Bot is not admin\n• User is already admin\n• Network error\n\n💡 Make sure bot has admin privileges." 
    });
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
      await sock.sendMessage(message.key.remoteJid, { 
        text: "❌ Please mention a user to demote!\n\n📝 Usage: .demote @username\n💡 Example: .demote @john" 
      });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, { 
      text: "⏳ Demoting user(s)..." 
    });

    await sock.groupParticipantsUpdate(message.key.remoteJid, mentionedJids, 'demote');
    
    await sock.sendMessage(message.key.remoteJid, { 
      text: `✅ *User(s) demoted successfully!*\n\n📉 Demoted ${mentionedJids.length} user(s) from admin.\n\n🛡️ *Action by Queen Bot Pro*` 
    });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to demote user(s)!\n\n🔧 *Possible reasons:*\n• Bot is not admin\n• User is not admin\n• Network error\n\n💡 Make sure bot has admin privileges." 
    });
  }
});

Queen.addCommand({
  pattern: ["everyone", "tagall", "all"],
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
    
    const text = args.join(' ') || 'Attention everyone! 📢';
    let mentions = [];
    let mentionText = '';
    
    for (let participant of participants) {
      mentions.push(participant.id);
      mentionText += `@${participant.id.split('@')[0]} `;
    }

    const finalMessage = `📢 *${text}*\n\n👥 *Tagged Members:*\n${mentionText}\n\n🔔 *Total:* ${participants.length} members\n🤖 *By Queen Bot Pro*`;

    await sock.sendMessage(message.key.remoteJid, { 
      text: finalMessage,
      mentions: mentions
    });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to tag everyone!\n\n🔧 *Error:* Could not fetch group members\n💡 Make sure bot has proper permissions." 
    });
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
    await sock.sendMessage(message.key.remoteJid, { 
      text: "⏳ Muting group..." 
    });

    await sock.groupSettingUpdate(message.key.remoteJid, 'announcement');
    
    await sock.sendMessage(message.key.remoteJid, { 
      text: `🔇 *Group Muted Successfully!*\n\n🔒 Only admins can send messages now.\n⏰ Muted at: ${new Date().toLocaleString()}\n\n🛡️ *Action by Queen Bot Pro*` 
    });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to mute group!\n\n🔧 *Possible reasons:*\n• Bot is not admin\n• Network error\n\n💡 Make sure bot has admin privileges." 
    });
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
    await sock.sendMessage(message.key.remoteJid, { 
      text: "⏳ Unmuting group..." 
    });

    await sock.groupSettingUpdate(message.key.remoteJid, 'not_announcement');
    
    await sock.sendMessage(message.key.remoteJid, { 
      text: `🔊 *Group Unmuted Successfully!*\n\n🔓 Everyone can send messages now.\n⏰ Unmuted at: ${new Date().toLocaleString()}\n\n🛡️ *Action by Queen Bot Pro*` 
    });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, { 
      text: "❌ Failed to unmute group!\n\n🔧 *Possible reasons:*\n• Bot is not admin\n• Network error\n\n💡 Make sure bot has admin privileges." 
    });
  }
});

export {};