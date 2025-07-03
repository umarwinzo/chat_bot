import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import Terminal from './Terminal';
import { 
  Bot, 
  LogOut, 
  Settings, 
  Activity, 
  Users, 
  MessageSquare, 
  Command,
  QrCode,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
  Check,
  X,
  User,
  Globe,
  Shield,
  Zap,
  Heart,
  Star,
  Github,
  Mail,
  ExternalLink,
  Code,
  Database,
  Server,
  Cpu,
  Monitor,
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';

interface BotStatus {
  connected: boolean;
  botInfo?: {
    jid: string;
    name: string;
    pushName: string;
  };
  stats: {
    uptime: number;
    totalUsers: number;
    totalGroups: number;
    totalCommands: number;
    messageCount: number;
    ramUsage: number;
    cpuUsage: number;
  };
}

interface Settings {
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
  const [activeTab, setActiveTab] = useState('connect');
  const [botStatus, setBotStatus] = useState<BotStatus>({
    connected: false,
    stats: {
      uptime: 0,
      totalUsers: 0,
      totalGroups: 0,
      totalCommands: 0,
      messageCount: 0,
      ramUsage: 0,
      cpuUsage: 0
    }
  });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'qr' | 'pairing'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBotStatus();
      fetchSettings();
      initializeSocket();
    }
  }, [user]);

  const initializeSocket = () => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    
    newSocket.emit('join-user-room', user?.id);
    
    newSocket.on('qr-code', (data) => {
      if (data.userId === user?.id) {
        setQrCode(data.qrCode);
        setLoading(false);
        toast.success('QR Code generated! Scan with WhatsApp');
      }
    });

    newSocket.on('pairing-code', (data) => {
      if (data.userId === user?.id) {
        setPairingCode(data.code);
        setLoading(false);
        toast.success('Pairing code generated!');
      }
    });

    newSocket.on('bot-connected', (data) => {
      if (data.userId === user?.id) {
        setBotStatus(prev => ({
          ...prev,
          connected: true,
          botInfo: data.botInfo
        }));
        setQrCode(null);
        setPairingCode(null);
        setLoading(false);
        toast.success('🎉 Bot connected successfully!');
      }
    });

    newSocket.on('bot-disconnected', (data) => {
      if (data.userId === user?.id) {
        setBotStatus(prev => ({ ...prev, connected: false, botInfo: undefined }));
        setQrCode(null);
        setPairingCode(null);
        setLoading(false);
        toast.error('Bot disconnected');
      }
    });

    newSocket.on('bot-error', (data) => {
      if (data.userId === user?.id) {
        setLoading(false);
        toast.error(data.error);
      }
    });

    newSocket.on('settings-updated', (data) => {
      if (data.userId === user?.id) {
        toast.success('Settings updated successfully!');
      }
    });

    return () => newSocket.disconnect();
  };

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBotStatus(data);
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/bot/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const connectBot = async () => {
    if (botStatus.connected) {
      toast.error('Bot is already connected!');
      return;
    }

    if (connectionMethod === 'pairing' && !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    setQrCode(null);
    setPairingCode(null);

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
        toast.error(error.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error connecting bot:', error);
      toast.error('Failed to connect bot');
      setLoading(false);
    }
  };

  const disconnectBot = async () => {
    try {
      const response = await fetch('/api/bot/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        toast.success('Bot disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting bot:', error);
      toast.error('Failed to disconnect bot');
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const response = await fetch('/api/bot/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedSettings)
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error);
        setSettings(settings); // Revert on error
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      setSettings(settings); // Revert on error
    }
  };

  const copyPairingCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      toast.success('Pairing code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const refreshConnection = async () => {
    try {
      const response = await fetch('/api/bot/refresh-qr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        toast.success('Refreshing connection...');
      }
    } catch (error) {
      console.error('Error refreshing connection:', error);
      toast.error('Failed to refresh connection');
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const tabs = [
    { id: 'connect', label: 'Connect Bot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'terminal', label: 'Terminal', icon: Activity },
    { id: 'developer', label: 'Developer', icon: User }
  ];

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
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center floating-animation">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">WhatsApp Bot Dashboard</h1>
                <p className="text-white/70">Welcome back, {user?.username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                botStatus.connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {botStatus.connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {botStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
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
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Messages', value: botStatus.stats.messageCount, icon: MessageSquare, color: 'blue' },
            { label: 'Commands', value: botStatus.stats.totalCommands, icon: Command, color: 'green' },
            { label: 'Groups', value: botStatus.stats.totalGroups, icon: Users, color: 'purple' },
            { label: 'Uptime', value: formatUptime(botStatus.stats.uptime), icon: Clock, color: 'orange' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                <div className={`w-3 h-3 rounded-full bg-${stat.color}-400 animate-pulse`}></div>
              </div>
              <p className="text-white/70 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-xl p-2 mb-6"
        >
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
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
        <AnimatePresence mode="wait">
          {activeTab === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Connection Method Selection */}
              <div className="glass-effect rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Bot className="w-6 h-6 mr-2" />
                  Connect Your WhatsApp Bot
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      connectionMethod === 'qr'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                    onClick={() => setConnectionMethod('qr')}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <QrCode className="w-8 h-8 text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">QR Code</h3>
                        <p className="text-white/70 text-sm">Scan with WhatsApp</p>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm">
                      Open WhatsApp on your phone, go to Settings → Linked Devices → Link a Device, and scan the QR code.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      connectionMethod === 'pairing'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                    onClick={() => setConnectionMethod('pairing')}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <Smartphone className="w-8 h-8 text-green-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">Phone Pairing</h3>
                        <p className="text-white/70 text-sm">Use pairing code</p>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm">
                      Enter your phone number to receive a pairing code that you can enter in WhatsApp.
                    </p>
                  </motion.div>
                </div>

                {/* Phone Number Input for Pairing */}
                {connectionMethod === 'pairing' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Phone Number (with country code)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70"
                      >
                        {showPhoneNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Connection Button */}
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={connectBot}
                    disabled={loading || botStatus.connected}
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    <span>
                      {loading ? 'Connecting...' : botStatus.connected ? 'Connected' : 'Connect Bot'}
                    </span>
                  </motion.button>

                  {botStatus.connected && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={disconnectBot}
                      className="flex items-center space-x-2 px-6 py-4 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                      <span>Disconnect</span>
                    </motion.button>
                  )}

                  {(qrCode || pairingCode) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={refreshConnection}
                      className="p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* QR Code Display */}
              {qrCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-effect rounded-2xl p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Scan QR Code</h3>
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                  <p className="text-white/70">
                    Open WhatsApp → Settings → Linked Devices → Link a Device
                  </p>
                </motion.div>
              )}

              {/* Pairing Code Display */}
              {pairingCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-effect rounded-2xl p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Pairing Code</h3>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-4">
                    <div className="text-4xl font-mono font-bold text-white mb-2 tracking-wider">
                      {pairingCode}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyPairingCode}
                      className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </motion.button>
                  </div>
                  <p className="text-white/70">
                    Open WhatsApp → Settings → Linked Devices → Link a Device → Link with phone number instead
                  </p>
                </motion.div>
              )}

              {/* Bot Info */}
              {botStatus.connected && botStatus.botInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Check className="w-6 h-6 text-green-400 mr-2" />
                    Bot Connected Successfully
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-white/70 text-sm">Bot Name</p>
                      <p className="text-white font-medium">{botStatus.botInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Push Name</p>
                      <p className="text-white font-medium">{botStatus.botInfo.pushName}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">JID</p>
                      <p className="text-white font-medium font-mono text-xs">{botStatus.botInfo.jid}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && settings && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Basic Settings */}
              <div className="glass-effect rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Settings className="w-6 h-6 mr-2" />
                  Bot Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Bot Name</label>
                    <input
                      type="text"
                      value={settings.botName}
                      onChange={(e) => updateSettings({ botName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Command Prefix</label>
                    <input
                      type="text"
                      value={settings.prefix}
                      onChange={(e) => updateSettings({ prefix: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSettings({ language: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EN">English</option>
                      <option value="SI">Sinhala</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Work Mode</label>
                    <select
                      value={settings.workMode}
                      onChange={(e) => updateSettings({ workMode: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="groups">Groups Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Behavior Settings */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Bot Behavior</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: 'autoReact', label: 'Auto React', description: 'Automatically react to messages' },
                    { key: 'autoRead', label: 'Auto Read', description: 'Mark messages as read automatically' },
                    { key: 'autoTyping', label: 'Auto Typing', description: 'Show typing indicator' },
                    { key: 'welcomeMessage', label: 'Welcome Message', description: 'Send welcome to new members' },
                    { key: 'antiLink', label: 'Anti Link', description: 'Block links in groups' },
                    { key: 'antiSpam', label: 'Anti Spam', description: 'Prevent spam messages' }
                  ].map((setting) => (
                    <div key={setting.key} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{setting.label}</h4>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof Settings] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[setting.key as keyof Settings] ? 'bg-blue-500' : 'bg-gray-600'
                          }`}
                        >
                          <motion.span
                            animate={{
                              x: settings[setting.key as keyof Settings] ? 20 : 2
                            }}
                            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          />
                        </motion.button>
                      </div>
                      <p className="text-white/60 text-sm">{setting.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Features */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Advanced Features</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: 'aiChatbot', label: 'AI Chatbot', description: 'Enable AI-powered responses' },
                    { key: 'voiceToText', label: 'Voice to Text', description: 'Convert voice messages to text' },
                    { key: 'textToVoice', label: 'Text to Voice', description: 'Convert text to voice messages' },
                    { key: 'imageGeneration', label: 'Image Generation', description: 'Generate images with AI' },
                    { key: 'weatherUpdates', label: 'Weather Updates', description: 'Provide weather information' },
                    { key: 'newsUpdates', label: 'News Updates', description: 'Share latest news' }
                  ].map((setting) => (
                    <div key={setting.key} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{setting.label}</h4>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof Settings] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[setting.key as keyof Settings] ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <motion.span
                            animate={{
                              x: settings[setting.key as keyof Settings] ? 20 : 2
                            }}
                            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          />
                        </motion.button>
                      </div>
                      <p className="text-white/60 text-sm">{setting.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Settings */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Performance & Limits</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Max Messages Per Minute: {settings.maxMessagesPerMinute}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={settings.maxMessagesPerMinute}
                      onChange={(e) => updateSettings({ maxMessagesPerMinute: parseInt(e.target.value) })}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Response Delay: {settings.responseDelay}ms
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={settings.responseDelay}
                      onChange={(e) => updateSettings({ responseDelay: parseInt(e.target.value) })}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'terminal' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Terminal />
            </motion.div>
          )}

          {activeTab === 'developer' && (
            <motion.div
              key="developer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Developer Profile */}
              <div className="glass-effect rounded-2xl p-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <User className="w-16 h-16 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">DarkWinzo</h2>
                  <p className="text-white/70 text-lg">Full Stack Developer & Bot Creator</p>
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-white/70 text-sm">5.0 Rating</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">50+</div>
                    <div className="text-white/70 text-sm">Projects</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">10K+</div>
                    <div className="text-white/70 text-sm">Users</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">99%</div>
                    <div className="text-white/70 text-sm">Satisfaction</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-white/80 text-lg leading-relaxed mb-6">
                    Passionate developer specializing in WhatsApp automation, web development, and AI integration. 
                    Creating innovative solutions that bridge the gap between technology and user experience.
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="mailto:isurulakshan9998@gmail.com"
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Contact</span>
                    </motion.a>
                    
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://github.com/DarkWinzo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-500/20 text-gray-300 rounded-xl hover:bg-gray-500/30 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                      <span>GitHub</span>
                    </motion.a>
                    
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://darkwinzo.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Portfolio</span>
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Code className="w-6 h-6 mr-2" />
                  Technology Stack
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Node.js', level: 95, color: 'green' },
                    { name: 'React', level: 90, color: 'blue' },
                    { name: 'TypeScript', level: 85, color: 'blue' },
                    { name: 'Express.js', level: 92, color: 'gray' },
                    { name: 'Socket.IO', level: 88, color: 'purple' },
                    { name: 'Baileys', level: 96, color: 'green' }
                  ].map((tech, index) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between">
                        <span className="text-white font-medium">{tech.name}</span>
                        <span className="text-white/70">{tech.level}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${tech.level}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-2 rounded-full bg-${tech.color}-500`}
                        ></motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Project Features */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Zap className="w-6 h-6 mr-2" />
                  Platform Features
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Shield, title: 'Enterprise Security', description: 'JWT, rate limiting, encryption' },
                    { icon: Globe, title: 'Multi-User Support', description: 'Isolated bot instances' },
                    { icon: Database, title: 'Real-Time Sync', description: 'Live updates and monitoring' },
                    { icon: Server, title: 'Scalable Architecture', description: 'Built for performance' },
                    { icon: Monitor, title: 'Advanced Dashboard', description: 'Beautiful, responsive UI' },
                    { icon: Cpu, title: 'AI Integration', description: 'Smart automation features' }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white/5 rounded-xl"
                    >
                      <feature.icon className="w-8 h-8 text-blue-400 mb-3" />
                      <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                      <p className="text-white/70 text-sm">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Support & Documentation */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Support & Resources</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Get Help</h4>
                    <div className="space-y-2">
                      <a href="mailto:isurulakshan9998@gmail.com" className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                        <Mail className="w-4 h-4" />
                        <span>Email Support</span>
                      </a>
                      <a href="https://github.com/DarkWinzo" className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                        <Github className="w-4 h-4" />
                        <span>GitHub Issues</span>
                      </a>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Quick Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Version</span>
                        <span className="text-white">3.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Last Updated</span>
                        <span className="text-white">Dec 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">License</span>
                        <span className="text-white">MIT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}