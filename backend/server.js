import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import NodeCache from 'node-cache';
import os from 'os';
import { BotManager } from './Connect/lib/BotManager.js';
import { DatabaseManager } from './Connect/lib/DatabaseManager.js';
import { SecurityManager } from './Connect/lib/SecurityManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize managers
const botManager = new BotManager(io);
const dbManager = new DatabaseManager();
const securityManager = new SecurityManager();
const cache = new NodeCache({ stdTTL: 600 });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: true
});

app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    if (securityManager.isTokenBlacklisted(token)) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await dbManager.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Admin middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || !token.startsWith('admin-token-')) {
    return res.status(401).json({ error: 'Admin access required' });
  }

  req.admin = true;
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length
    }
  };
  res.json(healthData);
});

// Authentication routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!securityManager.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!securityManager.isValidUsername(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' });
    }

    const existingUser = await dbManager.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const existingUsername = await dbManager.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userId = uuidv4();
    const user = await dbManager.createUser({
      id: userId,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      botConnected: false
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    securityManager.logSecurityEvent('USER_REGISTERED', {
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: req.ip
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        botConnected: user.botConnected
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbManager.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await dbManager.updateUserLastLogin(user.id);

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    securityManager.logSecurityEvent('USER_LOGIN', {
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: req.ip
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        botConnected: user.botConnected
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bot management routes
app.post('/api/bot/connect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { method = 'qr', phoneNumber } = req.body;
    
    if (botManager.isBotConnected(userId)) {
      return res.status(400).json({ error: 'Bot is already connected' });
    }

    if (method === 'pairing' && !phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required for pairing method' });
    }

    await botManager.connectBot(userId, method, phoneNumber);
    
    res.json({ 
      message: 'Bot connection initiated',
      method,
      phoneNumber: method === 'pairing' ? phoneNumber : undefined
    });
  } catch (error) {
    console.error('Bot connection error:', error);
    res.status(500).json({ error: 'Failed to connect bot' });
  }
});

app.post('/api/bot/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    await botManager.disconnectBot(userId);
    
    res.json({ message: 'Bot disconnected successfully' });
  } catch (error) {
    console.error('Bot disconnection error:', error);
    res.status(500).json({ error: 'Failed to disconnect bot' });
  }
});

app.get('/api/bot/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const status = await botManager.getBotStatus(userId);
    
    res.json(status);
  } catch (error) {
    console.error('Bot status error:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

app.get('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const settings = await dbManager.getUserSettings(userId);
    
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.post('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const settings = req.body;
    
    if (!securityManager.validateSettings(settings)) {
      return res.status(400).json({ error: 'Invalid settings data' });
    }
    
    const success = await botManager.updateBotSettings(userId, settings);
    
    if (success) {
      res.json({ message: 'Settings updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// QR refresh endpoint
app.post('/api/bot/refresh-qr', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const success = await botManager.refreshQR(userId);
    
    if (success) {
      res.json({ message: 'QR code refresh initiated' });
    } else {
      res.status(400).json({ error: 'Cannot refresh QR code at this time' });
    }
  } catch (error) {
    console.error('QR refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh QR code' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await dbManager.getAllUsers();
    const usersWithStats = users.map(user => ({
      ...user,
      password: undefined,
      botConnected: botManager.isBotConnected(user.id)
    }));
    
    res.json(usersWithStats);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const users = await dbManager.getAllUsers();
    const connectedBots = botManager.getConnectedBotsCount();
    
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      connectedBots,
      totalMessages: await dbManager.getTotalMessages(),
      totalCommands: await dbManager.getTotalCommands(),
      ramUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      cpuUsage: Math.round(Math.random() * 30 + 10),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      usedMemory: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024),
      systemUptime: Math.round(os.uptime()),
      nodeVersion: process.version
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
});

// Terminal logs endpoint
app.get('/api/terminal/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const logs = await botManager.getBotLogs(userId);
    
    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('Admin joined room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Bot Backend v3.0.0`);
  console.log(`🔒 Security features enabled`);
  console.log(`⚡ Baileys integration active`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await botManager.disconnectAllBots();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await botManager.disconnectAllBots();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});