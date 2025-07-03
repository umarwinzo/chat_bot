import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
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
  BarChart3
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
  enabledCommands: Record<string, boolean>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [botConnected, setBotConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
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
    welcomeText: 'Welcome to our group! Please read the rules and enjoy your stay.',
    enabledCommands: {
      ping: true,
      help: true,
      info: true,
      weather: true,
      translate: true,
      sticker: true,
      download: true,
      ai: true,
      news: true,
      reminder: true,
      ban: true,
      unban: true,
      kick: true,
      promote: true,
      demote: true,
      mute: true,
      unmute: true,
      everyone: true,
      tagall: true,
      joke: true,
      quote: true,
      fact: true,
      meme: true,
      calculator: true,
      qr: true,
      time: true,
      uptime: true,
      stats: true
    }
  });

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    
    newSocket.emit('join-user-room', user?.id);
    
    newSocket.on('qr-code', (data) => {
      if (data.userId === user?.id) {
        setQrCode(data.qrCode);
        setShowQR(true);
        setLoading(false);
        toast.success('QR Code generated! Please scan with WhatsApp');
      }
    });

    newSocket.on('bot-connected', (data) => {
      if (data.userId === user?.id) {
        setBotConnected(true);
        setShowQR(false);
        setLoading(false);
        toast.success('🎉 Bot connected successfully!');
        fetchBotStatus();
      }
    });

    newSocket.on('bot-disconnected', (data) => {
      if (data.userId === user?.id) {
        setBotConnected(false);
        setShowQR(false);
        toast.error('Bot disconnected');
      }
    });

    newSocket.on('qr-hidden', (data) => {
      if (data.userId === user?.id) {
        setShowQR(false);
      }
    });

    newSocket.on('bot-stats-updated', (data) => {
      if (data.userId === user?.id) {
        setStats(data.stats);
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
        toast.error(data.error);
      }
    });

    fetchBotStatus();
    fetchBotSettings();

    // Auto-refresh stats every 10 seconds
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
    setLoading(true);
    try {
      const response = await fetch('/api/bot/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ method: 'qr' })
      });

      if (response.ok) {
        toast.success('Connecting bot... QR code will appear shortly');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to connect bot');
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
      await fetch('/api/bot/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setBotConnected(false);
      setShowQR(false);
      toast.success('Bot disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting bot:', error);
      toast.error('Failed to disconnect bot');
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
          <h3 className="text-xl font-semibold text-white">Bot Connection</h3>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            botConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {botConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            <span className="font-medium">
              {botConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {!botConnected && (
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connectBot}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Connect Bot</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {botConnected && (
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
        )}

        {showQR && qrCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-white/70 text-sm mb-4">Scan this QR code with WhatsApp</p>
            <div className="bg-white p-4 rounded-xl inline-block">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-white/60 text-xs mt-2">QR code expires in 20 seconds</p>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Uptime', value: formatUptime(stats.uptime), icon: Clock, color: 'green' },
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
          { label: 'Messages', value: stats.messageCount, icon: MessageSquare, color: 'purple' },
          { label: 'Commands', value: stats.totalCommands, icon: Command, color: 'orange' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
            </div>
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
        <h3 className="text-lg font-semibold text-white mb-6">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">CPU Usage</span>
              <span className="text-white">{stats.cpuUsage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.cpuUsage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
              ></motion.div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">RAM Usage</span>
              <span className="text-white">{stats.ramUsage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.ramUsage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'green' },
          { label: 'Groups', value: stats.totalGroups, icon: Users, color: 'blue' },
          { label: 'Commands Available', value: stats.totalCommandsAvailable, icon: BarChart3, color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="glass-effect rounded-xl p-4 text-center"
          >
            <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-white/70 text-sm">{stat.label}</p>
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
        <h3 className="text-lg font-semibold text-white mb-6">Basic Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm mb-2">Bot Name</label>
            <input
              type="text"
              value={settings.botName}
              onChange={(e) => updateSettings({ botName: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Command Prefix</label>
            <input
              type="text"
              value={settings.prefix}
              onChange={(e) => updateSettings({ prefix: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Behavior Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Behavior Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'autoReact', label: 'Auto React', desc: 'Automatically react to messages' },
            { key: 'autoRead', label: 'Auto Read', desc: 'Mark messages as read automatically' },
            { key: 'autoTyping', label: 'Auto Typing', desc: 'Show typing indicator' },
            { key: 'welcomeMessage', label: 'Welcome Message', desc: 'Send welcome to new members' },
            { key: 'antiLink', label: 'Anti Link', desc: 'Block links in groups' },
            { key: 'antiSpam', label: 'Anti Spam', desc: 'Prevent spam messages' }
          ].map((setting) => (
            <motion.div
              key={setting.key}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <div>
                <p className="text-white font-medium text-sm">{setting.label}</p>
                <p className="text-white/60 text-xs">{setting.desc}</p>
              </div>
              <button
                onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof BotSettings] })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings[setting.key as keyof BotSettings] ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{
                    x: settings[setting.key as keyof BotSettings] ? 24 : 2
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
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
        <h3 className="text-lg font-semibold text-white mb-6">Advanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'aiChatbot', label: 'AI Chatbot', desc: 'Enable AI-powered responses' },
            { key: 'voiceToText', label: 'Voice to Text', desc: 'Convert voice messages to text' },
            { key: 'textToVoice', label: 'Text to Voice', desc: 'Convert text to voice messages' },
            { key: 'imageGeneration', label: 'Image Generation', desc: 'Generate images with AI' },
            { key: 'weatherUpdates', label: 'Weather Updates', desc: 'Provide weather information' },
            { key: 'newsUpdates', label: 'News Updates', desc: 'Send latest news updates' }
          ].map((setting) => (
            <motion.div
              key={setting.key}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <div>
                <p className="text-white font-medium text-sm">{setting.label}</p>
                <p className="text-white/60 text-xs">{setting.desc}</p>
              </div>
              <button
                onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof BotSettings] })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings[setting.key as keyof BotSettings] ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{
                    x: settings[setting.key as keyof BotSettings] ? 24 : 2
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Command Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Command Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(settings.enabledCommands).map(([command, enabled]) => (
            <motion.div
              key={command}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              <div>
                <p className="text-white font-medium text-sm">.{command}</p>
                <p className="text-white/60 text-xs">Enable/disable command</p>
              </div>
              <button
                onClick={() => updateSettings({ 
                  enabledCommands: { ...settings.enabledCommands, [command]: !enabled }
                })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{ x: enabled ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderDeveloper = () => (
    <div className="space-y-6">
      {/* Developer Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 floating-animation"
          >
            <User className="w-16 h-16 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">DarkWinzo</h2>
          <p className="text-white/70 mb-6">Full Stack Developer & Bot Creator</p>
          <div className="flex justify-center flex-wrap gap-2 mb-6">
            {['JavaScript', 'Node.js', 'React', 'WhatsApp API', 'TypeScript'].map((tech) => (
              <span key={tech} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Contact Information</h3>
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: 'isurulakshan9998@gmail.com', href: 'mailto:isurulakshan9998@gmail.com' },
            { icon: Github, label: 'GitHub', value: 'github.com/DarkWinzo', href: 'https://github.com/DarkWinzo' },
            { icon: MessageCircle, label: 'WhatsApp Support', value: 'Available for technical support', href: '#' }
          ].map((contact, index) => (
            <motion.a
              key={contact.label}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
            >
              <contact.icon className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-white font-medium">{contact.label}</p>
                <p className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                  <span>{contact.value}</span>
                  {contact.href !== '#' && <ExternalLink className="w-4 h-4" />}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Project Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Project Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Star, value: '4.9', label: 'Rating', color: 'yellow' },
            { icon: Users, value: '1000+', label: 'Active Users', color: 'blue' },
            { icon: Zap, value: '99.9%', label: 'Uptime', color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center p-6 bg-white/5 rounded-lg"
            >
              <stat.icon className={`w-12 h-12 text-${stat.color}-400 mx-auto mb-4`} />
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-white/70 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Support & Donations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Support the Project</h3>
        <div className="text-center">
          <Coffee className="w-16 h-16 text-orange-400 mx-auto mb-4 floating-animation" />
          <p className="text-white/70 mb-6">
            If you find this bot helpful, consider supporting the development!
          </p>
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 flex items-center space-x-2"
            >
              <Heart className="w-5 h-5" />
              <span>Buy me a coffee</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 flex items-center space-x-2"
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
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center floating-animation">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">WhatsApp Bot Dashboard</h1>
                <p className="text-white/70">Welcome back, {user?.username}!</p>
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
          {activeTab === 'developer' && renderDeveloper()}
        </motion.div>
      </div>
    </div>
  );
}