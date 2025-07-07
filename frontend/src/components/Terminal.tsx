import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  Download,
  Copy,
  Trash2,
  Settings,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Zap,
  Activity,
  Server,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'success';
  message: string;
  source?: string;
}

export default function Terminal() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [isLive, setIsLive] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);
      
      newSocket.emit('join-user-room', user.id);
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        addLog('success', 'Terminal connected to bot server', 'SYSTEM');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        addLog('error', 'Terminal disconnected from server', 'SYSTEM');
      });

      newSocket.on('bot-log', (data) => {
        if (data.userId === user.id && isLive) {
          const logEntry = parseLogEntry(data.log);
          setLogs(prev => [...prev, logEntry]);
        }
      });

      newSocket.on('bot-connected', (data) => {
        if (data.userId === user.id) {
          addLog('success', 'WhatsApp bot connected successfully', 'CONNECTION');
        }
      });

      newSocket.on('bot-disconnected', (data) => {
        if (data.userId === user.id) {
          addLog('warn', 'WhatsApp bot disconnected', 'CONNECTION');
        }
      });

      newSocket.on('bot-connecting', (data) => {
        if (data.userId === user.id) {
          addLog('info', 'WhatsApp bot connecting...', 'CONNECTION');
        }
      });

      newSocket.on('bot-reconnecting', (data) => {
        if (data.userId === user.id) {
          addLog('warn', `WhatsApp bot reconnecting... (${data.attempt}/3)`, 'CONNECTION');
        }
      });

      newSocket.on('command-used', (data) => {
        if (data.userId === user.id) {
          addLog('info', `Command executed: .${data.command}`, 'COMMAND');
        }
      });

      newSocket.on('bot-error', (data) => {
        if (data.userId === user.id) {
          addLog('error', data.error, 'ERROR');
        }
      });

      newSocket.on('qr-code', (data) => {
        if (data.userId === user.id) {
          addLog('info', 'QR code generated for WhatsApp connection', 'AUTH');
        }
      });

      newSocket.on('pairing-code', (data) => {
        if (data.userId === user.id) {
          addLog('info', `Pairing code generated: ${data.code}`, 'AUTH');
        }
      });

      // Load existing logs
      fetchLogs();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, isLive]);

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/terminal/logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const parsedLogs = data.logs.map((log: string) => parseLogEntry(log));
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const parseLogEntry = (logString: string): LogEntry => {
    const timestampMatch = logString.match(/\[(.*?)\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();
    
    let level: LogEntry['level'] = 'info';
    let message = logString.replace(/\[.*?\]\s*/, '');
    let source = undefined;

    // Determine log level
    if (message.includes('ERROR') || message.includes('error') || message.includes('failed') || message.includes('Failed')) {
      level = 'error';
    } else if (message.includes('WARN') || message.includes('warning') || message.includes('expired') || message.includes('disconnected')) {
      level = 'warn';
    } else if (message.includes('success') || message.includes('connected') || message.includes('completed') || message.includes('Successfully')) {
      level = 'success';
    }

    // Determine source
    if (message.includes('Command executed:')) {
      source = 'COMMAND';
    } else if (message.includes('QR code') || message.includes('Pairing code')) {
      source = 'AUTH';
    } else if (message.includes('Message') || message.includes('message')) {
      source = 'MESSAGE';
    } else if (message.includes('connect') || message.includes('disconnect')) {
      source = 'CONNECTION';
    } else if (message.includes('Terminal') || message.includes('server')) {
      source = 'SYSTEM';
    }

    return { timestamp, level, message, source };
  };

  const addLog = (level: LogEntry['level'], message: string, source?: string) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source
    };
    setLogs(prev => [...prev, logEntry]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Terminal cleared', 'SYSTEM');
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('info', 'Logs downloaded successfully', 'SYSTEM');
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText);
    addLog('info', 'Logs copied to clipboard', 'SYSTEM');
  };

  const filteredLogs = logs.filter(log => {
    // Filter by level/source
    if (filter !== 'all') {
      if (filter === 'errors' && log.level !== 'error') return false;
      if (filter === 'warnings' && log.level !== 'warn') return false;
      if (filter === 'success' && log.level !== 'success') return false;
      if (filter === 'commands' && log.source !== 'COMMAND') return false;
      if (filter === 'messages' && log.source !== 'MESSAGE') return false;
      if (filter === 'auth' && log.source !== 'AUTH') return false;
      if (filter === 'connection' && log.source !== 'CONNECTION') return false;
    }
    
    // Filter by search term
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return AlertCircle;
      case 'warn': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'COMMAND': return 'text-purple-400';
      case 'MESSAGE': return 'text-blue-400';
      case 'AUTH': return 'text-green-400';
      case 'CONNECTION': return 'text-cyan-400';
      case 'SYSTEM': return 'text-gray-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const logStats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warn').length,
    success: logs.filter(l => l.level === 'success').length,
    commands: logs.filter(l => l.source === 'COMMAND').length,
    messages: logs.filter(l => l.source === 'MESSAGE').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center relative">
            <TerminalIcon className="w-8 h-8 text-white" />
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Bot Terminal</h2>
            <p className="text-white/70">Real-time bot logs and monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm backdrop-blur-sm border ${
            isConnected 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm backdrop-blur-sm border ${
            isLive 
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          }`}>
            <Activity className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: logStats.total, color: 'blue', icon: TerminalIcon },
          { label: 'Errors', value: logStats.errors, color: 'red', icon: AlertCircle },
          { label: 'Warnings', value: logStats.warnings, color: 'yellow', icon: AlertTriangle },
          { label: 'Success', value: logStats.success, color: 'green', icon: CheckCircle },
          { label: 'Commands', value: logStats.commands, color: 'purple', icon: Zap },
          { label: 'Messages', value: logStats.messages, color: 'cyan', icon: Database }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-4 text-center"
          >
            <stat.icon className={`w-6 h-6 text-${stat.color}-400 mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-white/70 text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Terminal Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/70" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Logs</option>
                <option value="errors">Errors</option>
                <option value="warnings">Warnings</option>
                <option value="success">Success</option>
                <option value="commands">Commands</option>
                <option value="messages">Messages</option>
                <option value="auth">Authentication</option>
                <option value="connection">Connection</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-white/70" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoScroll"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoScroll" className="text-white/70 text-sm">Auto-scroll</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isLive"
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isLive" className="text-white/70 text-sm">Live updates</label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyLogs}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Copy logs"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadLogs}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Download logs"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearLogs}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Terminal Window */}
        <div 
          ref={terminalRef}
          className={`bg-black/90 rounded-xl border border-white/20 font-mono text-sm overflow-hidden backdrop-blur-sm ${
            isMaximized ? 'h-[600px]' : 'h-80'
          }`}
        >
          {/* Terminal Header */}
          <div className="bg-gray-900/80 px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/70 text-xs">Bot Terminal - {user?.username}</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white/60 text-xs">{filteredLogs.length} logs</span>
              </div>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-4 h-full overflow-y-auto custom-scrollbar">
            {filteredLogs.length === 0 ? (
              <div className="text-white/50 text-center py-12">
                <TerminalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No logs to display</p>
                <p className="text-sm">
                  {searchTerm ? 'No logs match your search criteria' : 'Logs will appear here when your bot is active'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {filteredLogs.map((log, index) => {
                    const LevelIcon = getLevelIcon(log.level);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start space-x-3 py-2 px-2 hover:bg-white/5 rounded-lg -mx-2 group"
                      >
                        <span className="text-white/40 text-xs mt-0.5 min-w-0 flex-shrink-0 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        
                        <LevelIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getLevelColor(log.level)}`} />
                        
                        {log.source && (
                          <span className={`text-xs mt-0.5 min-w-0 flex-shrink-0 px-2 py-0.5 rounded ${getSourceColor(log.source)} bg-white/10`}>
                            {log.source}
                          </span>
                        )}
                        
                        <span className={`${getLevelColor(log.level)} flex-1 min-w-0 break-words leading-relaxed`}>
                          {searchTerm ? (
                            log.message.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                              part.toLowerCase() === searchTerm.toLowerCase() ? 
                                <mark key={i} className="bg-yellow-400/30 text-yellow-200">{part}</mark> : 
                                part
                            )
                          ) : (
                            log.message
                          )}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center space-x-4">
            <span>Showing {filteredLogs.length} of {logs.length} logs</span>
            {searchTerm && <span>Search: "{searchTerm}"</span>}
            {filter !== 'all' && <span>Filter: {filter}</span>}
          </div>
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>Real-time monitoring active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}