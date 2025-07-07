import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import Terminal from './Terminal';
import DeveloperPage from './DeveloperPage';
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
  EyeOff,
  Loader,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  Waves,
  Signal,
  Download,
  Upload,
  Scan,
  Key,
  Lock,
  Unlock,
  Timer,
  RotateCcw
} from 'lucide-react';

interface BotStatus {
  connected: boolean;
  connectionState: string;
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
    connectionState: 'disconnected',
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
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [qrExpiring, setQrExpiring] = useState(false);
  const [pairingExpired, setPairingExpired] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);

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
        setQrExpiring(false);
        setConnectionProgress(50);
        toast.success('📱 High-quality QR Code generated! Scan with WhatsApp', {
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white'
          }
        });
      }
    });

    newSocket.on('pairing-code', (data) => {
      if (data.userId === user?.id) {
        setPairingCode(data.code);
        setLoading(false);
        setPairingExpired(false);
        setConnectionProgress(50);
        toast.success(`🔢 Pairing code generated: ${data.code}`, {
          duration: 10000,
          style: {
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white'
          }
        });
      }
    });

    newSocket.on('qr-expiring', (data) => {
      if (data.userId === user?.id) {
        setQrExpiring(true);
        toast('🔄 QR code expiring soon, generating new one...', { 
          icon: '⏰',
          duration: 3000 
        });
      }
    });

    newSocket.on('pairing-expired', (data) => {
      if (data.userId === user?.id) {
        setPairingExpired(true);
        setPairingCode(null);
        toast.error('⏰ Pairing code expired. Please generate a new one.', {
          duration: 5000
        });
      }
    });

    newSocket.on('bot-connecting', (data) => {
      if (data.userId === user?.id) {
        setBotStatus(prev => ({ ...prev, connectionState: 'connecting' }));
        setConnectionProgress(25);
        toast.loading('🔗 Connecting to WhatsApp...', { id: 'connecting' });
      }
    });

    newSocket.on('bot-reconnecting', (data) => {
      if (data.userId === user?.id) {
        setReconnectAttempt(data.attempt || 1);
        setBotStatus(prev => ({ ...prev, connectionState: 'reconnecting' }));
        setConnectionProgress(30);
        toast.loading(`🔄 Reconnecting... (${data.attempt}/3)`, { id: 'reconnecting' });
      }
    });

    newSocket.on('bot-connected', (data) => {
      if (data.userId === user?.id) {
        setBotStatus(prev => ({
          ...prev,
          connected: true,
          connectionState: 'connected',
          botInfo: data.botInfo
        }));
        setQrCode(null);
        setPairingCode(null);
        setLoading(false);
        setReconnectAttempt(0);
        setConnectionProgress(100);
        toast.dismiss();
        toast.success('🎉 Bot connected successfully!', {
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white'
          }
        });
        
        // Reset progress after animation
        setTimeout(() => setConnectionProgress(0), 2000);
      }
    });

    newSocket.on('bot-disconnected', (data) => {
      if (data.userId === user?.id) {
        setBotStatus(prev => ({ 
          ...prev, 
          connected: false, 
          connectionState: 'disconnected',
          botInfo: undefined 
        }));
        setQrCode(null);
        setPairingCode(null);
        setLoading(false);
        setConnectionProgress(0);
        toast.dismiss();
        toast.error('🔌 Bot disconnected', { 
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            color: 'white'
          }
        });
      }
    });

    newSocket.on('bot-error', (data) => {
      if (data.userId === user?.id) {
        setLoading(false);
        setConnectionProgress(0);
        toast.dismiss();
        
        let errorMessage = data.error;
        let toastStyle = {
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          color: 'white'
        };
        
        if (data.type === 'pairing') {
          errorMessage = `📱 ${errorMessage}\n\nTips:\n• Include country code (e.g., 1234567890)\n• Remove spaces and special characters\n• Try QR code method instead`;
        } else if (data.type === 'qr') {
          errorMessage = `📱 ${errorMessage}\n\nTips:\n• Ensure good internet connection\n• Try refreshing the page\n• Use pairing code method instead`;
        }
        
        toast.error(errorMessage, {
          duration: 10000,
          style: toastStyle
        });
      }
    });

    newSocket.on('qr-expired', (data) => {
      if (data.userId === user?.id) {
        setQrCode(null);
        setQrExpiring(false);
        toast('🔄 QR code expired. Generating new one...', { 
          icon: '⏰',
          duration: 3000 
        });
      }
    });

    newSocket.on('settings-updated', (data) => {
      if (data.userId === user?.id) {
        toast.success('⚙️ Settings updated successfully!', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white'
          }
        });
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
      toast.error('🤖 Bot is already connected!');
      return;
    }

    if (connectionMethod === 'pairing' && !phoneNumber) {
      toast.error('📱 Please enter your phone number with country code\n\nExample: 1234567890 (without + or spaces)');
      return;
    }

    if (connectionMethod === 'pairing') {
      const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
      if (cleanNumber.length < 10 || cleanNumber.length > 15) {
        toast.error('📱 Please enter a valid phone number with country code\n\nExample: 1234567890 (10-15 digits)');
        return;
      }
    }

    setLoading(true);
    setQrCode(null);
    setPairingCode(null);
    setQrExpiring(false);
    setPairingExpired(false);
    setConnectionProgress(10);

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
        setConnectionProgress(20);
        toast.success(`🚀 Connecting via ${connectionMethod}...`, { 
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: 'white'
          }
        });
      } else {
        const error = await response.json();
        toast.error(`❌ ${error.error}`);
        setLoading(false);
        setConnectionProgress(0);
      }
    } catch (error) {
      console.error('Error connecting bot:', error);
      toast.error('❌ Failed to connect bot. Please check your internet connection.');
      setLoading(false);
      setConnectionProgress(0);
    }
  };

  const disconnectBot = async () => {
    try {
      const response = await fetch('/api/bot/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        toast.success('✅ Bot disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting bot:', error);
      toast.error('❌ Failed to disconnect bot');
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
      toast.success('📋 Pairing code copied to clipboard!');
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
        toast.success('🔄 Refreshing connection...');
        setQrCode(null);
        setPairingCode(null);
      }
    } catch (error) {
      console.error('Error refreshing connection:', error);
      toast.error('❌ Failed to refresh connection');
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

  const getConnectionStatusColor = () => {
    switch (botStatus.connectionState) {
      case 'connected': return 'text-green-400';
      case 'connecting': 
      case 'reconnecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (botStatus.connectionState) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'connecting': 
      case 'reconnecting': return <Loader className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (botStatus.connectionState) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return `Reconnecting... (${reconnectAttempt}/3)`;
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
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
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center floating-animation relative">
                <Bot className="w-8 h-8 text-white" />
                {botStatus.connected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">WhatsApp Bot Dashboard</h1>
                <p className="text-white/70">Welcome back, {user?.username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 relative overflow-hidden`}>
                {connectionProgress > 0 && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-green-500/30 transition-all duration-1000"
                    style={{ width: `${connectionProgress}%` }}
                  />
                )}
                <div className={`relative z-10 ${getConnectionStatusColor()}`}>
                  {getConnectionStatusIcon()}
                </div>
                <span className={`relative z-10 text-sm font-medium ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
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
              <div className="glass-effect rounded-2xl p-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                  >
                    <Bot className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-50"></div>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Connect Your WhatsApp Bot
                  </h2>
                  <p className="text-white/70 text-lg">Choose your preferred connection method</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      connectionMethod === 'qr'
                        ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-2xl'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                    onClick={() => setConnectionMethod('qr')}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">QR Code</h3>
                          <p className="text-blue-300 font-medium">Scan with WhatsApp</p>
                        </div>
                      </div>
                      <p className="text-white/80 leading-relaxed mb-4">
                        Open WhatsApp on your phone, go to Settings → Linked Devices → Link a Device, and scan the QR code that appears.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">High-quality QR generation</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Auto-refresh on expiry</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Recommended for most users</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      connectionMethod === 'pairing'
                        ? 'border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-2xl'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                    onClick={() => setConnectionMethod('pairing')}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                          <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">Phone Pairing</h3>
                          <p className="text-green-300 font-medium">Use pairing code</p>
                        </div>
                      </div>
                      <p className="text-white/80 leading-relaxed mb-4">
                        Enter your phone number to receive a pairing code that you can enter in WhatsApp for secure connection.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">Enhanced security</span>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Key className="w-4 h-4" />
                          <span className="text-sm">6-digit pairing code</span>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Timer className="w-4 h-4" />
                          <span className="text-sm">60-second validity</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Phone Number Input for Pairing */}
                <AnimatePresence>
                  {connectionMethod === 'pairing' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8"
                    >
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                        <label className="block text-white font-semibold text-lg mb-4">
                          Phone Number (with country code)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-400" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="1234567890"
                            className="w-full bg-black/30 border border-white/30 rounded-xl pl-14 pr-14 py-4 text-white text-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                          >
                            {showPhoneNumber ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                          </button>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-green-300/80 text-sm">
                            <strong>Format:</strong> Country code + phone number (no + or spaces)
                          </p>
                          <p className="text-green-300/80 text-sm">
                            <strong>Examples:</strong> 1234567890 (US), 447123456789 (UK), 919876543210 (India)
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connection Button */}
                <div className="flex items-center justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={connectBot}
                    disabled={loading || botStatus.connected}
                    className="flex items-center space-x-3 px-12 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl relative overflow-hidden"
                  >
                    {connectionProgress > 0 && (
                      <div 
                        className="absolute inset-0 bg-white/20 transition-all duration-1000"
                        style={{ width: `${connectionProgress}%` }}
                      />
                    )}
                    <div className="relative z-10 flex items-center space-x-3">
                      {loading ? (
                        <Loader className="w-6 h-6 animate-spin" />
                      ) : botStatus.connected ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Zap className="w-6 h-6" />
                      )}
                      <span>
                        {loading ? 'Connecting...' : botStatus.connected ? 'Connected' : 'Connect Bot'}
                      </span>
                      {!loading && !botStatus.connected && <Sparkles className="w-6 h-6" />}
                    </div>
                  </motion.button>

                  {botStatus.connected && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={disconnectBot}
                      className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-xl"
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
                      className="p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-colors border border-white/20"
                      title="Refresh Connection"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* QR Code Display */}
              <AnimatePresence>
                {qrCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="glass-effect rounded-2xl p-8 text-center"
                  >
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center space-x-2">
                        <Scan className="w-6 h-6" />
                        <span>Scan QR Code</span>
                      </h3>
                      <p className="text-white/70">Use your WhatsApp mobile app to scan this code</p>
                      {qrExpiring && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-yellow-400 text-sm mt-2 flex items-center justify-center space-x-1"
                        >
                          <Timer className="w-4 h-4" />
                          <span>QR code expiring soon, generating new one...</span>
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="relative inline-block mb-6">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl">
                        <img src={qrCode} alt="QR Code" className="w-80 h-80" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 animate-pulse"></div>
                      {qrExpiring && (
                        <div className="absolute inset-0 bg-yellow-500/20 rounded-3xl animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Smartphone className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-semibold">Step-by-Step Instructions</span>
                      </div>
                      <ol className="text-white/80 text-left space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                          <span>Open WhatsApp on your phone</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                          <span>Go to Settings → Linked Devices</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                          <span>Tap "Link a Device"</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                          <span>Scan this QR code</span>
                        </li>
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pairing Code Display */}
              <AnimatePresence>
                {pairingCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="glass-effect rounded-2xl p-8 text-center"
                  >
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center space-x-2">
                        <Key className="w-6 h-6" />
                        <span>Pairing Code</span>
                      </h3>
                      <p className="text-white/70">Enter this code in WhatsApp</p>
                      {pairingExpired && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400 text-sm mt-2 flex items-center justify-center space-x-1"
                        >
                          <Timer className="w-4 h-4" />
                          <span>Pairing code expired. Please generate a new one.</span>
                        </motion.p>
                      )}
                    </div>
                    
                    <div className={`bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8 mb-6 ${pairingExpired ? 'opacity-50' : ''}`}>
                      <div className="text-6xl font-mono font-bold text-white mb-4 tracking-wider">
                        {pairingCode}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyPairingCode}
                        disabled={pairingExpired}
                        className="flex items-center space-x-2 mx-auto px-6 py-3 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        <span className="font-semibold">{copied ? 'Copied!' : 'Copy Code'}</span>
                      </motion.button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Phone className="w-5 h-5 text-green-400" />
                        <span className="text-white font-semibold">Step-by-Step Instructions</span>
                      </div>
                      <ol className="text-white/80 text-left space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                          <span>Open WhatsApp on your phone</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                          <span>Go to Settings → Linked Devices</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                          <span>Tap "Link a Device"</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                          <span>Select "Link with phone number instead"</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                          <span>Enter the pairing code: <strong>{pairingCode}</strong></span>
                        </li>
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bot Info */}
              <AnimatePresence>
                {botStatus.connected && botStatus.botInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-effect rounded-2xl p-8"
                  >
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Bot Connected Successfully!</h3>
                      <p className="text-green-300">Your WhatsApp bot is now active and ready to serve</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-white/70 text-sm mb-1">Bot Name</p>
                        <p className="text-white font-semibold">{botStatus.botInfo.name}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-white/70 text-sm mb-1">Push Name</p>
                        <p className="text-white font-semibold">{botStatus.botInfo.pushName}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-white/70 text-sm mb-1">Status</p>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <p className="text-green-400 font-semibold">Online</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
            >
              <DeveloperPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}