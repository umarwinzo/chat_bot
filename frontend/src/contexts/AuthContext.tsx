import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  botConnected: boolean;
}

interface AuthContextType {
  user: User | null;
  admin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3001';

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedAdmin = localStorage.getItem('admin');

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          setAdmin(false);
        } else if (storedAdmin === 'true' && storedToken) {
          setAdmin(true);
          setUser(null);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check for admin login
      if (email === 'DarkWinzo@gmail.com' && password === '20030210') {
        setAdmin(true);
        setUser(null);
        const adminToken = 'admin-token-' + Date.now();
        setToken(adminToken);
        localStorage.setItem('token', adminToken);
        localStorage.setItem('admin', 'true');
        localStorage.removeItem('user');
        toast.success('Welcome back, Admin! 👑');
        return;
      }

      const response = await axios.post('/api/login', { email, password });
      
      setUser(response.data.user);
      setToken(response.data.token);
      setAdmin(false);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.removeItem('admin');
      
      toast.success(`Welcome back, ${response.data.user.username}! 🎉`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/register', { username, email, password });
      
      setUser(response.data.user);
      setToken(response.data.token);
      setAdmin(false);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.removeItem('admin');
      
      toast.success(`Welcome to WhatsApp Bot Platform, ${username}! 🚀`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(false);
    setToken(null);
    localStorage.clear();
    toast.success('Logged out successfully! 👋');
  };

  return (
    <AuthContext.Provider value={{ user, admin, login, register, logout, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}