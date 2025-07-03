# 🤖 WhatsApp Bot Multi-User Platform

A powerful, modern WhatsApp bot platform built with **Baileys** and **React** that supports multiple users with isolated bot instances. Features enterprise-grade security, real-time monitoring, and an advanced plugin system.

![Platform Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-3.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🚀 **Core Capabilities**
- **Multi-User Support** - Isolated bot instances for each user
- **Baileys Integration** - Latest WhatsApp Web API (v6.7.5)
- **Real-Time Dashboard** - Live monitoring and control
- **Advanced Security** - JWT, rate limiting, encryption
- **Plugin System** - Modular command architecture
- **QR Authentication** - Seamless WhatsApp connection

### 🎨 **Modern Frontend**
- **Glass Morphism UI** - Beautiful, modern interface
- **Real-Time Terminal** - Live bot logs and monitoring
- **Responsive Design** - Works on all devices
- **Dark Theme** - Eye-friendly design
- **Smooth Animations** - Framer Motion powered

### 🛡️ **Security Features**
- JWT Authentication with token blacklisting
- Rate limiting (IP and user-based)
- Input validation and sanitization
- Security event logging
- Encrypted data storage
- Suspicious activity detection

### 🤖 **Bot Features**
- **Auto Reactions** - Smart message reactions
- **Media Processing** - Stickers, images, videos
- **Group Management** - Admin controls
- **AI Integration** - Intelligent responses
- **Weather & News** - Real-time updates
- **Fun Commands** - Jokes, quotes, facts

## 🏗️ **Architecture**

```
├── backend/                 # Node.js Backend
│   ├── Connect/            # Bot Core
│   │   ├── lib/           # Core Libraries
│   │   ├── plugin/        # Command Plugins
│   │   ├── config/        # Configuration
│   │   ├── language/      # Multi-language Support
│   │   └── database/      # Database Files
│   ├── data/              # User Data Storage
│   └── server.js          # Main Server
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── contexts/      # Context Providers
│   │   └── styles/        # CSS Styles
└── README.md
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/whatsapp-bot-platform.git
cd whatsapp-bot-platform
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Start the Backend**
```bash
cd ../backend
npm start
```

5. **Start the Frontend**
```bash
cd ../frontend
npm run dev
```

6. **Access the Platform**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## 📱 **Usage**

### User Registration
1. Visit the platform and create an account
2. Login with your credentials
3. Connect your WhatsApp by scanning the QR code
4. Configure your bot settings
5. Start using your personal WhatsApp bot!

### Admin Access
- Email: `DarkWinzo@gmail.com`
- Password: `20030210`

### Demo User
- Email: `demo@example.com`
- Password: `password`

## 🔧 **Configuration**

### Bot Settings
Configure your bot through the dashboard:
- **Basic Settings**: Bot name, prefix, language
- **Behavior**: Auto-react, auto-read, welcome messages
- **Features**: AI chatbot, voice-to-text, image generation
- **Commands**: Enable/disable specific commands

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

## 🔌 **Plugin Development**

Create custom commands by adding files to `backend/Connect/plugin/`:

```javascript
import { Queen } from "../lib/event.js";

Queen.addCommand({
  pattern: ["hello"],
  category: "greeting",
  React: "👋",
  desc: "Say hello",
  usage: ".hello"
}, async (message, sock) => {
  await sock.sendMessage(message.key.remoteJid, { 
    text: "Hello! 👋" 
  });
});

export {};
```

## 📊 **Available Commands**

### 🔧 **Utility Commands**
- `.ping` - Check bot response time
- `.menu` - Show command list
- `.weather <city>` - Get weather info
- `.time` - Current time
- `.calc <expression>` - Calculator

### 🎮 **Fun Commands**
- `.joke` - Random joke
- `.quote` - Inspirational quote
- `.fact` - Random fact
- `.meme` - Funny meme
- `.dice` - Roll dice

### 👑 **Admin Commands**
- `.kick @user` - Remove user from group
- `.promote @user` - Make user admin
- `.everyone <message>` - Tag all members
- `.mute` - Mute group

### 🎨 **Media Commands**
- `.sticker` - Create sticker from image
- `.toimg` - Convert sticker to image

### 🤖 **AI Commands**
- `.ai <question>` - AI-powered responses
- `.news` - Latest news updates

## 🛡️ **Security**

### Authentication
- JWT tokens with 7-day expiration
- Token blacklisting for logout
- Secure password hashing with bcrypt

### Rate Limiting
- 100 requests per 15 minutes (general)
- 5 auth attempts per 15 minutes
- Per-user command rate limiting

### Data Protection
- Input sanitization
- XSS protection
- CORS configuration
- Helmet security headers

## 📈 **Monitoring**

### Real-Time Dashboard
- Bot connection status
- System performance metrics
- Command usage statistics
- User activity monitoring

### Terminal Logs
- Live bot logs
- Error tracking
- Command execution history
- Filterable log levels

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Developer**

**DarkWinzo**
- Email: isurulakshan9998@gmail.com
- GitHub: [@DarkWinzo](https://github.com/DarkWinzo)
- Portfolio: [darkwinzo.dev](https://darkwinzo.dev)

## 🙏 **Acknowledgments**

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [Framer Motion](https://www.framer.com/motion/) - Animations

## 📞 **Support**

If you encounter any issues or need help:
1. Check the [Issues](https://github.com/yourusername/whatsapp-bot-platform/issues) page
2. Create a new issue with detailed information
3. Contact the developer directly

## 🌟 **Star History**

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/whatsapp-bot-platform&type=Date)](https://star-history.com/#yourusername/whatsapp-bot-platform&Date)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/DarkWinzo">DarkWinzo</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>