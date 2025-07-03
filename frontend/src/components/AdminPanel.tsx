import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Users, 
  Activity, 
  Server, 
  LogOut, 
  TrendingUp,
  Cpu,
  HardDrive,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  MessageSquare,
  Command,
  Globe,
  Clock,
  BarChart3,
  Zap,
  Database,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  botConnected: boolean;
  isActive: boolean;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  connectedBots: number;
  totalMessages: number;
  totalCommands: number;
  ramUsage: number;
  cpuUsage: number;
  totalMemory: number;
  usedMemory: number;
  systemUptime: number;
  nodeVersion: string;
}

export default function AdminPanel() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    connectedBots: 0,
    totalMessages: 0,
    totalCommands: 0,
    ramUsage: 0,
    cpuUsage: 0,
    totalMemory: 8,
    usedMemory: 0,
    systemUptime: 0,
    nodeVersion: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? CheckCircle : XCircle;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

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
              <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center floating-animation">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                <p className="text-white/70">System Administration Dashboard</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', change: '+12%' },
            { label: 'Connected Bots', value: stats.connectedBots, icon: Activity, color: 'green', change: '+5%' },
            { label: 'Total Messages', value: stats.totalMessages.toLocaleString(), icon: MessageSquare, color: 'purple', change: '+23%' },
            { label: 'Commands Used', value: stats.totalCommands.toLocaleString(), icon: Command, color: 'orange', change: '+18%' }
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
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-white/70 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              System Health
            </h3>
            
            <div className="space-y-6">
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
                    className={`h-3 rounded-full ${
                      stats.cpuUsage > 80 ? 'bg-red-500' : 
                      stats.cpuUsage > 60 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
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
                    className={`h-3 rounded-full ${
                      stats.ramUsage > 80 ? 'bg-red-500' : 
                      stats.ramUsage > 60 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                  ></motion.div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/70">Memory</p>
                    <p className="text-white font-medium">{stats.usedMemory}GB / {stats.totalMemory}GB</p>
                  </div>
                  <div>
                    <p className="text-white/70">Uptime</p>
                    <p className="text-white font-medium">{formatUptime(stats.systemUptime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Platform Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass-effect rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Platform Overview
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Server, value: stats.connectedBots, label: 'Active Bots', color: 'blue' },
                { icon: TrendingUp, value: `${Math.round((stats.connectedBots / stats.totalUsers) * 100)}%`, label: 'Connection Rate', color: 'green' },
                { icon: Globe, value: stats.activeUsers, label: 'Active Users', color: 'purple' },
                { icon: Zap, value: '99.9%', label: 'Uptime', color: 'yellow' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center p-4 bg-white/5 rounded-lg"
                >
                  <item.icon className={`w-8 h-8 text-${item.color}-400 mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-white/70 text-sm">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              User Management
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-white/70 text-sm">
                Total: {users.length} users
              </span>
              <span className="text-green-400 text-sm">
                Active: {users.filter(u => u.isActive).length}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-4 text-white/70 font-medium">User</th>
                  <th className="text-left py-4 px-4 text-white/70 font-medium">Email</th>
                  <th className="text-left py-4 px-4 text-white/70 font-medium">Status</th>
                  <th className="text-left py-4 px-4 text-white/70 font-medium">Bot</th>
                  <th className="text-left py-4 px-4 text-white/70 font-medium">Last Login</th>
                  <th className="text-left py-4 px-4 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const StatusIcon = getStatusIcon(user.isActive);
                  const BotIcon = getStatusIcon(user.botConnected);
                  
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-white/60 text-xs">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/70">{user.email}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(user.isActive)}`} />
                          <span className={`text-sm font-medium ${getStatusColor(user.isActive)}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <BotIcon className={`w-4 h-4 ${getStatusColor(user.botConnected)}`} />
                          <span className={`text-sm font-medium ${getStatusColor(user.botConnected)}`}>
                            {user.botConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/70 text-sm">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="py-4 px-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          View Details
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-white/70 text-sm">Node.js Version</p>
              <p className="text-white font-medium">{stats.nodeVersion}</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/70 text-sm">Platform</p>
              <p className="text-white font-medium">Linux x64</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/70 text-sm">Environment</p>
              <p className="text-white font-medium">Production</p>
            </div>
          </div>
        </motion.div>

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowUserDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-effect rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">User Details</h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-white/70 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/70 text-sm">Username</p>
                  <p className="text-white font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Email</p>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">User ID</p>
                  <p className="text-white font-medium font-mono text-xs">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Created At</p>
                  <p className="text-white font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Last Login</p>
                  <p className="text-white font-medium">{formatDate(selectedUser.lastLogin)}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div>
                    <p className="text-white/70 text-sm">Account Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedUser.isActive)({ className: `w-4 h-4 ${getStatusColor(selectedUser.isActive)}` })}
                      <span className={`text-sm font-medium ${getStatusColor(selectedUser.isActive)}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Bot Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedUser.botConnected)({ className: `w-4 h-4 ${getStatusColor(selectedUser.botConnected)}` })}
                      <span className={`text-sm font-medium ${getStatusColor(selectedUser.botConnected)}`}>
                        {selectedUser.botConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}