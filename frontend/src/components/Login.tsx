import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Sparkles, 
  Shield,
  Zap,
  Users,
  MessageSquare,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Smartphone
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Bot,
      title: "Advanced AI Bot",
      description: "Powered by latest Baileys technology with intelligent responses"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and multi-layer security protocols"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time messaging with sub-second response times"
    },
    {
      icon: Users,
      title: "Multi-User Platform",
      description: "Isolated environments for each user with dedicated resources"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      // Error is handled by toast in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
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

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              WhatsApp Bot
              <br />
              <span className="text-4xl">Revolution</span>
            </h1>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Experience the next generation of WhatsApp automation with our advanced multi-user platform.
            </p>
          </motion.div>

          {/* Feature Showcase */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="flex items-start space-x-4"
              >
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  {React.createElement(features[currentFeature].icon, { className: "w-8 h-8 text-blue-300" })}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{features[currentFeature].title}</h3>
                  <p className="text-blue-100">{features[currentFeature].description}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Feature Indicators */}
            <div className="flex space-x-2">
              {features.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentFeature ? 'w-8 bg-blue-400' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            {[
              { icon: Users, value: "10K+", label: "Active Users" },
              { icon: MessageSquare, value: "1M+", label: "Messages Sent" },
              { icon: Star, value: "4.9", label: "User Rating" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                {React.createElement(stat.icon, { className: "w-6 h-6 text-blue-300 mx-auto mb-2" })}
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Bot className="w-10 h-10 text-white" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-300"
              >
                Sign in to your WhatsApp Bot Dashboard
              </motion.p>
            </div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl pl-12 pr-4 py-4 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl pl-12 pr-12 py-4 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <h3 className="text-gray-800 dark:text-white font-medium text-sm">Demo Credentials</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span><strong>User:</strong> demo@example.com / password</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span><strong>Admin:</strong> DarkWinzo@gmail.com / 20030210</span>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                  Sign up here
                </Link>
              </p>
            </motion.div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400"
            >
              <Shield className="w-3 h-3" />
              <span>Secured with 256-bit encryption</span>
              <Globe className="w-3 h-3" />
              <span>Global CDN</span>
              <Smartphone className="w-3 h-3" />
              <span>Mobile Optimized</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}