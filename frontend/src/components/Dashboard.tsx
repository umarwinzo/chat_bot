import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import Terminal from './Terminal';
import { 
  Bot, 
  QrCode, 
  Users, 
  MessageSquare, 
  Activity, 
  Settings, 
  LogOut, 
  Wifi, 
  WifiOff,
  Play,
  Pause,
  RotateCcw,
  Monitor,
  Cpu,
  HardDrive,
  TrendingUp,
  MessageCircle,
  Phone,
  Mail,
  Github,
  ExternalLink,
  User,
  Shield,
  Zap,
  Globe,
  Command,
  Heart,
  Star,
  Coffee,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Terminal as TerminalIcon,
  Smartphone,
  Database,
  Server,
  Layers,
  Copy,
  RefreshCw,
  AlertCircle,
  Loader,
  Check,
  X,
  Palette,
  Volume2,
  Image,
  FileText,
  Download,
  Upload,
  Lock,
  Unlock,
  Bell,
  BellOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface BotStats {
  uptime: number;
  totalUsers: number;
  totalGroups: number;
  totalCommands: number;
  messageCount: number;
  activeUsers: number;
  bannedUsers: number;
  ramUsage: number;
  cpuUsage: number;
  enabledCommands: number;
  totalCommandsAvailable: number;
}

interface BotInfo {
  jid: string;
  name: string;
  pushName: string;
  profilePicture?: string;
}

interface BotSettings {
  botName: string;
  prefix: string;
  language: string;
  ownerNumber: string;
  autoReact: boolean;
  autoRead: boolean;
  autoTyping: boolean;
  welcomeMessage: boolean;
  antiLink: boolean;
  antiSpam: boolean;
  autoReply: boolean;
  aiChatbot: boolean;
  voiceToText: boolean;
  textToVoice: boolean;
  imageGeneration: boolean;
  weatherUpdates: boolean;
  newsUpdates: boolean;
  reminderSystem: boolean;
  groupManagement: boolean;
  adminOnly: boolean;
  groupAdminOnly: boolean;
  blockUnknown: boolean;
  antiFlood: boolean;
  maxMessagesPerMinute: number;
  maxDownloadSize: string;
  allowedFileTypes: string[];
  autoDownloadMedia: boolean;
  compressImages: boolean;
  responseDelay: number;
  workMode: string;
  logMessages: boolean;
  saveMedia: boolean;
  notifyOnCommand: boolean;
  notifyOnError: boolean;
  notifyOnNewUser: boolean;
  notifyOnGroupJoin: boolean;
  autoReplyText: string;
  autoReplyEnabled: boolean;
  welcomeText: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [botConnected, setBotConnected] = useState(false);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showPairing, setShowPairing] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<'qr' | 'pairing'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [stats, setStats] = useState<BotStats>({
    uptime: 0,
    totalUsers: 0,
    totalGroups: 0,
    totalCommands: 0,
    messageCount: 0,
    activeUsers: 0,
    bannedUsers: 0,
    ramUsage: 0,
    cpuUsage: 0,
    enabledCommands: 0,
    totalCommandsAvailable: 0
  });
  const [settings, setSettings] = useState<BotSettings>({
    botName: 'Queen Bot Pro',
    prefix: '.',
    language: 'EN',
    ownerNumber: '',
    autoReact: true,
    autoRead: false,
    autoTyping: true,
    welcomeMessage: true,
    antiLink: false,
    antiSpam: true,
    autoReply: false,
    aiChatbot: false,
    voiceToText: false,
    textToVoice: false,
    imageGeneration: false,
    weatherUpdates: true,
    newsUpdates: true,
    reminderSystem: true,
    groupManagement: true,
    adminOnly: false,
    groupAdminOnly: false,
    blockUnknown: false,
    antiFlood: true,
    maxMessagesPerMinute: 10,
    maxDownloadSize: '100MB',
    allowedFileTypes: ['image', 'video', 'audio', 'document'],
    autoDownloadMedia: false,
    compressImages: true,
    responseDelay: 1000,
    workMode: 'public',
    logMessages: true,
    saveMedia: true,
    notifyOnCommand: true,
    notifyOnError: true,
    notifyOnNewUser: false,
    notifyOnGroupJoin: true,
    autoReplyText: 'Hello! I am currently unavailable. I will get back to you soon.',
    autoReplyEnabled: false,
    welcomeText: 'Welcome to our group! Please read the rules and enjoy your stay.'
  });

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    
    newSocket.emit('join-user-room', user?.id);
    
    // Connection events
    newSocket.on('qr-code', (data) => {
      if (data.userId === user?.id) {
        setQrCode(data.qrCode);
        setShowQR(true);
        setShowPairing(false);
        setLoading(false);
        setConnecting(false);
        toast.success('QR Code generated! Scan with WhatsApp');
      }
    });

    newSocket.on('pairing-code', (data) => {
      if (data.userId === user?.id) {
        setPairingCode(data.code);
        setShowPairing(true);
        setShowQR(false);
        setLoading(false);
        setConnecting(false);
        toast.success(`Pairing code: ${data.code}`);
      }
    });

    newSocket.on('bot-connected', (data) => {
      if (data.userId === user?.id) {
        setBotConnected(true);
        setBotInfo(data.botInfo);
        setShowQR(false);
        setShowPairing(false);
        setLoading(false);
        setConnecting(false);
        toast.success('🎉 Bot connected successfully!');
        fetchBotStatus();
      }
    });

    newSocket.on('bot-disconnected', (data) => {
      if (data.userId === user?.id) {
        setBotConnected(false);
        setBotInfo(null);
        setShowQR(false);
        setShowPairing(false);
        setConnecting(false);
        toast.error('Bot disconnected');
      }
    });

    newSocket.on('bot-connecting', (data) => {
      if (data.userId === user?.id) {
        setConnecting(true);
        toast.loading('Connecting to WhatsApp...', { id: 'connecting' });
      }
    });

    newSocket.on('bot-reconnecting', (data) => {
      if (data.userId === user?.id) {
        setConnecting(true);
        toast.loading('Reconnecting...', { id: 'reconnecting' });
      }
    });

    newSocket.on('bot-logged-out', (data) => {
      if (data.userId === user?.id) {
        setBotConnected(false);
        setBotInfo(null);
        setShowQR(false);
        setShowPairing(false);
        setConnecting(false);
        toast.error('Bot was logged out from WhatsApp');
      }
    });

    newSocket.on('qr-expired', (data) => {
      if (data.userId === user?.id) {
        toast.error('QR code expired. Generating new one...');
      }
    });

    newSocket.on('qr-hidden', (data) => {
      if (data.userId === user?.id) {
        setShowQR(false);
        setShowPairing(false);
      }
    });

    newSocket.on('settings-updated', (data) => {
      if (data.userId === user?.id) {
        setSettings(data.settings);
        toast.success('Settings updated successfully!');
      }
    });

    newSocket.on('command-used', (data) => {
      if (data.userId === user?.id) {
        toast.success(`Command .${data.command} executed`);
      }
    });

    newSocket.on('bot-error', (data) => {
      if (data.userId === user?.id) {
        setLoading(false);
        setConnecting(false);
        toast.error(data.error);
      }
    });

    newSocket.on('stats-updated', (data) => {
      if (data.userId === user?.id) {
        setStats(prev => ({ ...prev, ...data.stats }));
      }
    });

    fetchBotStatus();
    fetchBotSettings();

    const statsInterval = setInterval(fetchBotStatus, 10000);

    return () => {
      newSocket.disconnect();
      clearInterval(statsInterval);
    };
  }, [user?.id]);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBotConnected(data.connected);
        setBotInfo(data.botInfo);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
  };

  const fetchBotSettings = async () => {
    try {
      const response = await fetch('/api/bot/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching bot settings:', error);
    }
  };

  const connectBot = async () => {
    if (connectionMethod === 'pairing' && !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    setConnecting(true);
    
    try {
      const response = await fetch('/api/bot/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          method: connectionMethod,
          phoneNumber: connectionMethod === 'pairing' ? phoneNumber : undefined
        })
      });

      if (response.ok) {
        toast.success(`Connecting via ${connectionMethod}...`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to connect bot');
        setLoading(false);
        setConnecting(false);
      }
    } catch (error) {
      console.error('Error connecting bot:', error);
      toast.error('Failed to connect bot');
      setLoading(false);
      setConnecting(false);
    }
  };

  const disconnectBot = async () => {
    try {
      await fetch('/api/bot/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setBotConnected(false);
      setBotInfo(null);
      setShowQR(false);
      setShowPairing(false);
      toast.success('Bot disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting bot:', error);
      toast.error('Failed to disconnect bot');
    }
  };

  const refreshQR = async () => {
    try {
      const response = await fetch('/api/bot/refresh-qr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        toast.success('Refreshing QR code...');
      } else {
        toast.error('Failed to refresh QR code');
      }
    } catch (error) {
      console.error('Error refreshing QR:', error);
      toast.error('Failed to refresh QR code');
    }
  };

  const updateSettings = async (newSettings: Partial<BotSettings>) => {
    try {
      const response = await fetch('/api/bot/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...settings, ...newSettings })
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Smartphone className="w-6 h-6 mr-2" />
            WhatsApp Connection
          </h3>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            botConnected ? 'bg-green-500/20 text-green-300' : 
            connecting ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {connecting ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : botConnected ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
            <span className="font-medium">
              {connecting ? 'Connecting...' : botConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {!botConnected && !connecting && (
          <div className="space-y-6">
            {/* Connection Method Selection */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-blue-300 font-medium mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Choose Connection Method
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConnectionMethod('qr')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    connectionMethod === 'qr'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-blue-500/50'
                  }`}
                >
                  <QrCode className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h5 className="text-white font-medium">QR Code</h5>
                  <p className="text-white/60 text-sm">Scan with WhatsApp</p>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConnectionMethod('pairing')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    connectionMethod === 'pairing'
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-white/20 bg-white/5 hover:border-green-500/50'
                  }`}
                >
                  <Phone className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h5 className="text-white font-medium">Phone Pairing</h5>
                  <p className="text-white/60 text-sm">Use pairing code</p>
                </motion.button>
              </div>
            </div>

            {/* Phone Number Input for Pairing */}
            <AnimatePresence>
              {connectionMethod === 'pairing' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                >
                  <label className="block text-green-300 font-medium mb-2">
                    Phone Number (with country code)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-green-200 text-xs mt-2">
                    Enter your WhatsApp number with country code (e.g., +1234567890)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connectBot}
              disabled={loading || (connectionMethod === 'pairing' && !phoneNumber)}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Connect Bot via {connectionMethod === 'qr' ? 'QR Code' : 'Phone Pairing'}</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {botConnected && botInfo && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-green-300 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {botInfo.name || 'WhatsApp Bot'}
                  </h4>
                  <p className="text-green-200 text-sm">Connected as: {botInfo.pushName}</p>
                  <p className="text-green-200 text-xs font-mono">{botInfo.jid}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={disconnectBot}
                className="flex-1 bg-red-500/20 text-red-300 border border-red-500/50 py-3 px-4 rounded-xl hover:bg-red-500/30 flex items-center justify-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>Disconnect</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  disconnectBot();
                  setTimeout(connectBot, 1000);
                }}
                className="flex-1 bg-blue-500/20 text-blue-300 border border-blue-500/50 py-3 px-4 rounded-xl hover:bg-blue-500/30 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </motion.button>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        <AnimatePresence>
          {showQR && qrCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-6 text-center"
            >
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                <h4 className="text-white font-medium mb-4 flex items-center justify-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan QR Code with WhatsApp
                </h4>
                <div className="bg-white p-4 rounded-xl inline-block shadow-lg mb-4">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
                <div className="flex justify-center space-x-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={refreshQR}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </motion.button>
                </div>
                <p className="text-white/60 text-xs">
                  Open WhatsApp → Settings → Linked Devices → Link a Device
                </p>
                <div className="mt-3 flex items-center justify-center space-x-2 text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">QR code expires in 20 seconds</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pairing Code Display */}
        <AnimatePresence>
          {showPairing && pairingCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-6 text-center"
            >
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
                <h4 className="text-white font-medium mb-4 flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Enter Pairing Code in WhatsApp
                </h4>
                <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-4">
                  <div className="text-4xl font-mono font-bold text-white tracking-wider mb-2">
                    {pairingCode}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(pairingCode)}
                    className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 flex items-center space-x-2 mx-auto"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Code</span>
                  </motion.button>
                </div>
                <p className="text-white/60 text-xs">
                  Open WhatsApp → Settings → Linked Devices → Link a Device → Link with phone number instead
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Uptime', value: formatUptime(stats.uptime), icon: Clock, color: 'green', trend: '+5%' },
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', trend: '+12%' },
          { label: 'Messages', value: stats.messageCount.toLocaleString(), icon: MessageSquare, color: 'purple', trend: '+23%' },
          { label: 'Commands', value: stats.totalCommands.toLocaleString(), icon: Command, color: 'orange', trend: '+18%' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
              <span className="text-green-400 text-sm font-medium">{stat.trend}</span>
            </div>
            <p className="text-white/70 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* System Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          System Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70 flex items-center">
                <Cpu className="w-4 h-4 mr-1" />
                CPU Usage
              </span>
              <span className="text-white">{stats.cpuUsage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.cpuUsage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-3 rounded-full ${
                  stats.cpuUsage > 80 ? 'bg-red-500' : 
                  stats.cpuUsage > 60 ? 'bg-yellow-500' : 
                  'bg-gradient-to-r from-green-400 to-blue-500'
                }`}
              ></motion.div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70 flex items-center">
                <HardDrive className="w-4 h-4 mr-1" />
                RAM Usage
              </span>
              <span className="text-white">{stats.ramUsage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.ramUsage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-3 rounded-full ${
                  stats.ramUsage > 80 ? 'bg-red-500' : 
                  stats.ramUsage > 60 ? 'bg-yellow-500' : 
                  'bg-gradient-to-r from-yellow-400 to-orange-500'
                }`}
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'green', description: 'Users online now' },
          { label: 'Groups', value: stats.totalGroups, icon: Users, color: 'blue', description: 'Connected groups' },
          { label: 'Commands Available', value: stats.totalCommandsAvailable, icon: BarChart3, color: 'purple', description: 'Total bot commands' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="glass-effect rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300"
          >
            <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-3`} />
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-white/70 text-sm font-medium">{stat.label}</p>
            <p className="text-white/50 text-xs mt-1">{stat.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Basic Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Basic Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm mb-2">Bot Name</label>
            <input
              type="text"
              value={settings.botName}
              onChange={(e) => updateSettings({ botName: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Command Prefix</label>
            <input
              type="text"
              value={settings.prefix}
              onChange={(e) => updateSettings({ prefix: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              <option value="EN">English</option>
              <option value="SI">Sinhala</option>
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Owner Number</label>
            <input
              type="tel"
              value={settings.ownerNumber}
              onChange={(e) => updateSettings({ ownerNumber: e.target.value })}
              placeholder="+1234567890"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Advanced Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Behavior Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Bot Behavior
          </h3>
          <div className="space-y-4">
            {[
              { key: 'autoReact', label: 'Auto React', desc: 'Automatically react to messages', icon: '😊' },
              { key: 'autoRead', label: 'Auto Read', desc: 'Mark messages as read automatically', icon: '👁️' },
              { key: 'autoTyping', label: 'Auto Typing', desc: 'Show typing indicator', icon: '⌨️' },
              { key: 'welcomeMessage', label: 'Welcome Message', desc: 'Send welcome to new members', icon: '👋' },
              { key: 'antiLink', label: 'Anti Link', desc: 'Block links in groups', icon: '🔗' },
              { key: 'antiSpam', label: 'Anti Spam', desc: 'Prevent spam messages', icon: '🛡️' }
            ].map((setting) => (
              <motion.div
                key={setting.key}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{setting.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{setting.label}</p>
                    <p className="text-white/60 text-xs">{setting.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof BotSettings] })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings[setting.key as keyof BotSettings] ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{
                      x: settings[setting.key as keyof BotSettings] ? 20 : 2
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Advanced Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Advanced Features
          </h3>
          <div className="space-y-4">
            {[
              { key: 'aiChatbot', label: 'AI Chatbot', desc: 'Enable AI-powered responses', icon: '🤖' },
              { key: 'voiceToText', label: 'Voice to Text', desc: 'Convert voice messages to text', icon: '🎤' },
              { key: 'textToVoice', label: 'Text to Voice', desc: 'Convert text to voice messages', icon: '🔊' },
              { key: 'imageGeneration', label: 'Image Generation', desc: 'Generate images with AI', icon: '🎨' },
              { key: 'weatherUpdates', label: 'Weather Updates', desc: 'Provide weather information', icon: '🌤️' },
              { key: 'newsUpdates', label: 'News Updates', desc: 'Send latest news updates', icon: '📰' }
            ].map((setting) => (
              <motion.div
                key={setting.key}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{setting.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{setting.label}</p>
                    <p className="text-white/60 text-xs">{setting.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof BotSettings] })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings[setting.key as keyof BotSettings] ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{
                      x: settings[setting.key as keyof BotSettings] ? 20 : 2
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Performance & Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-white/70 text-sm mb-2">Max Messages/Minute</label>
            <input
              type="number"
              value={settings.maxMessagesPerMinute}
              onChange={(e) => updateSettings({ maxMessagesPerMinute: parseInt(e.target.value) })}
              min="1"
              max="100"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Response Delay (ms)</label>
            <input
              type="number"
              value={settings.responseDelay}
              onChange={(e) => updateSettings({ responseDelay: parseInt(e.target.value) })}
              min="0"
              max="10000"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Max Download Size</label>
            <select
              value={settings.maxDownloadSize}
              onChange={(e) => updateSettings({ maxDownloadSize: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="50MB">50MB</option>
              <option value="100MB">100MB</option>
              <option value="200MB">200MB</option>
              <option value="500MB">500MB</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Auto Reply Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Auto Reply & Welcome Messages
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Auto Reply Message</label>
            <textarea
              value={settings.autoReplyText}
              onChange={(e) => updateSettings({ autoReplyText: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Welcome Message</label>
            <textarea
              value={settings.welcomeText}
              onChange={(e) => updateSettings({ welcomeText: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderTerminal = () => <Terminal />;

  const renderDeveloper = () => (
    <div className="space-y-6">
      {/* Developer Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8 text-center relative overflow-hidden"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              animate={{
                x: [0, Math.random() * 100, 0],
                y: [0, Math.random() * 100, 0],
                opacity: [0.1, 0.5, 0.1]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative z-10"
        >
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <User className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">DarkWinzo</h2>
          <p className="text-white/70 mb-4 text-lg">Full Stack Developer & Bot Creator</p>
          <p className="text-white/60 mb-6 max-w-2xl mx-auto">
            Passionate about creating innovative solutions that bridge technology and user experience. 
            Specialized in WhatsApp automation, web development, and AI integration.
          </p>
          <div className="flex justify-center flex-wrap gap-2 mb-6">
            {['JavaScript', 'Node.js', 'React', 'Baileys', 'TypeScript', 'Socket.IO', 'AI/ML', 'Cloud'].map((tech) => (
              <motion.span 
                key={tech} 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30 hover:bg-purple-500/30 transition-all"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Contact & Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Get in Touch
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              icon: Mail, 
              label: 'Email', 
              value: 'isurulakshan9998@gmail.com', 
              href: 'mailto:isurulakshan9998@gmail.com',
              color: 'blue'
            },
            { 
              icon: Github, 
              label: 'GitHub', 
              value: 'github.com/DarkWinzo', 
              href: 'https://github.com/DarkWinzo',
              color: 'gray'
            },
            { 
              icon: Globe, 
              label: 'Portfolio', 
              value: 'darkwinzo.dev', 
              href: 'https://darkwinzo.dev',
              color: 'green'
            },
            { 
              icon: MessageSquare, 
              label: 'WhatsApp', 
              value: 'Technical Support', 
              href: '#',
              color: 'green'
            }
          ].map((contact, index) => (
            <motion.a
              key={contact.label}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 group"
            >
              <div className={`bg-${contact.color}-500/20 p-3 rounded-lg group-hover:bg-${contact.color}-500/30 transition-all`}>
                <contact.icon className={`w-6 h-6 text-${contact.color}-400`} />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{contact.label}</p>
                <p className={`text-${contact.color}-400 hover:text-${contact.color}-300 flex items-center space-x-1 text-sm`}>
                  <span>{contact.value}</span>
                  {contact.href !== '#' && <ExternalLink className="w-3 h-3" />}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Project Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Project Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Star, value: '4.9', label: 'User Rating', color: 'yellow', description: 'Average satisfaction score' },
            { icon: Users, value: '10K+', label: 'Active Users', color: 'blue', description: 'Worldwide community' },
            { icon: Zap, value: '99.9%', label: 'Uptime', color: 'purple', description: 'Service reliability' },
            { icon: Command, value: '50+', label: 'Commands', color: 'green', description: 'Bot capabilities' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center p-6 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              <stat.icon className={`w-12 h-12 text-${stat.color}-400 mx-auto mb-4`} />
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-white/70 text-sm font-medium">{stat.label}</p>
              <p className="text-white/50 text-xs mt-1">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Layers className="w-5 h-5 mr-2" />
          Technology Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center">
              <Server className="w-4 h-4 mr-2" />
              Backend Technologies
            </h4>
            <div className="space-y-3">
              {[
                { name: 'Node.js', desc: 'Runtime environment', level: 95 },
                { name: 'Baileys', desc: 'WhatsApp Web API', level: 90 },
                { name: 'Express.js', desc: 'Web framework', level: 88 },
                { name: 'Socket.IO', desc: 'Real-time communication', level: 85 }
              ].map((tech) => (
                <div key={tech.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">{tech.name}</span>
                    <span className="text-white/50">{tech.level}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${tech.level}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <p className="text-white/40 text-xs">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Frontend Technologies
            </h4>
            <div className="space-y-3">
              {[
                { name: 'React 18', desc: 'UI library', level: 92 },
                { name: 'TypeScript', desc: 'Type safety', level: 88 },
                { name: 'Tailwind CSS', desc: 'Styling framework', level: 90 },
                { name: 'Framer Motion', desc: 'Animation library', level: 85 }
              ].map((tech) => (
                <div key={tech.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">{tech.name}</span>
                    <span className="text-white/50">{tech.level}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${tech.level}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    />
                  </div>
                  <p className="text-white/40 text-xs">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Tools & Services
            </h4>
            <div className="space-y-3">
              {[
                { name: 'JWT Auth', desc: 'Authentication', level: 90 },
                { name: 'WebSockets', desc: 'Real-time data', level: 87 },
                { name: 'REST APIs', desc: 'API design', level: 93 },
                { name: 'Git/GitHub', desc: 'Version control', level: 95 }
              ].map((tech) => (
                <div key={tech.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">{tech.name}</span>
                    <span className="text-white/50">{tech.level}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${tech.level}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                  <p className="text-white/40 text-xs">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Support & Donations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Support the Project
        </h3>
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Coffee className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-white/70 mb-6 text-lg">
            If you find this bot helpful, consider supporting the development!
          </p>
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center space-x-2 shadow-lg"
            >
              <Heart className="w-5 h-5" />
              <span>Buy me a coffee</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 flex items-center space-x-2 shadow-lg"
            >
              <Star className="w-5 h-5" />
              <span>Star on GitHub</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              >
                <Bot className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">WhatsApp Bot Dashboard</h1>
                <p className="text-white/70">Welcome back, <span className="text-blue-300 font-medium">{user?.username}</span>!</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-2 mb-6"
        >
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
              { id: 'developer', label: 'Developer', icon: User }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'terminal' && renderTerminal()}
          {activeTab === 'developer' && renderDeveloper()}
        </motion.div>
      </div>
    </div>
  );
}