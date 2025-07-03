import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Minimize2
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
  const [socket, setSocket] = useState<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);
      
      newSocket.emit('join-user-room', user.id);
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        addLog('info', 'Terminal connected to bot server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        addLog('error', 'Terminal disconnected from server');
      });

      newSocket.on('bot-log', (data) => {
        if (data.userId === user.id) {
          const logEntry = parseLogEntry(data.log);
          setLogs(prev => [...prev, logEntry]);
        }
      });

      newSocket.on('bot-connected', (data) => {
        if (data.userId === user.id) {
          addLog('success', 'WhatsApp bot connected successfully');
        }
      });

      newSocket.on('bot-disconnected', (data) => {
        if (data.userId === user.id) {
          addLog('warn', 'WhatsApp bot disconnected');
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

      // Load existing logs
      fetchLogs();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

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

    if (message.includes('ERROR') || message.includes('error') || message.includes('failed')) {
      level = 'error';
    } else if (message.includes('WARN') || message.includes('warning')) {
      level = 'warn';
    } else if (message.includes('success') || message.includes('connected') || message.includes('completed')) {
      level = 'success';
    }

    if (message.includes('Command executed:')) {
      source = 'COMMAND';
    } else if (message.includes('QR code')) {
      source = 'AUTH';
    } else if (message.includes('Message')) {
      source = 'MESSAGE';
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
    addLog('info', 'Terminal cleared');
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
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText);
    addLog('info', 'Logs copied to clipboard');
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'errors') return log.level === 'error';
    if (filter === 'commands') return log.source === 'COMMAND';
    if (filter === 'messages') return log.source === 'MESSAGE';
    return log.level === filter;
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
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
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
          <div className="bg-gradient-to-r from-green-500 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
            <TerminalIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bot Terminal</h2>
            <p className="text-white/70">Real-time bot logs and monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </motion.div>

      {/* Terminal Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Logs</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warn">Warnings</option>
              <option value="errors">Errors</option>
              <option value="commands">Commands</option>
              <option value="messages">Messages</option>
            </select>
            
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
          className={`bg-black/80 rounded-lg border border-white/20 font-mono text-sm overflow-hidden ${
            isMaximized ? 'h-96' : 'h-64'
          }`}
        >
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-white/70 text-xs">Bot Terminal - {user?.username}</span>
          </div>

          {/* Terminal Content */}
          <div className="p-4 h-full overflow-y-auto custom-scrollbar">
            {filteredLogs.length === 0 ? (
              <div className="text-white/50 text-center py-8">
                <TerminalIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No logs to display</p>
                <p className="text-xs mt-2">Logs will appear here when your bot is active</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start space-x-3 py-1 hover:bg-white/5 rounded px-2 -mx-2"
                  >
                    <span className="text-white/50 text-xs mt-0.5 min-w-0 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs mt-0.5">{getLevelIcon(log.level)}</span>
                    {log.source && (
                      <span className="text-purple-400 text-xs mt-0.5 min-w-0 flex-shrink-0">
                        [{log.source}]
                      </span>
                    )}
                    <span className={`${getLevelColor(log.level)} flex-1 min-w-0 break-words`}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        {/* Terminal Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Logs', value: logs.length, color: 'blue' },
            { label: 'Errors', value: logs.filter(l => l.level === 'error').length, color: 'red' },
            { label: 'Commands', value: logs.filter(l => l.source === 'COMMAND').length, color: 'green' },
            { label: 'Messages', value: logs.filter(l => l.source === 'MESSAGE').length, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-3 bg-white/5 rounded-lg">
              <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
              <div className="text-white/70 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}