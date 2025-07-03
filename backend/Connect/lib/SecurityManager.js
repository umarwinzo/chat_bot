import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SecurityManager {
  constructor() {
    this.blacklistedTokens = new Set();
    this.securityLogs = [];
    this.maxLogEntries = 1000;
    this.rateLimitMap = new Map();
    
    // Load blacklisted tokens
    this.loadBlacklistedTokens();
  }

  loadBlacklistedTokens() {
    try {
      const blacklistPath = path.join(__dirname, '../../data/blacklisted_tokens.json');
      if (fs.existsSync(blacklistPath)) {
        const tokens = fs.readJsonSync(blacklistPath);
        tokens.forEach(token => this.blacklistedTokens.add(token));
      }
    } catch (error) {
      console.error('Error loading blacklisted tokens:', error);
    }
  }

  saveBlacklistedTokens() {
    try {
      const blacklistPath = path.join(__dirname, '../../data/blacklisted_tokens.json');
      const tokens = Array.from(this.blacklistedTokens);
      fs.writeJsonSync(blacklistPath, tokens, { spaces: 2 });
    } catch (error) {
      console.error('Error saving blacklisted tokens:', error);
    }
  }

  blacklistToken(token) {
    this.blacklistedTokens.add(token);
    this.saveBlacklistedTokens();
  }

  isTokenBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  validateSettings(settings) {
    try {
      // Basic validation
      if (typeof settings !== 'object' || settings === null) {
        return false;
      }

      // Validate required fields
      const requiredFields = ['botName', 'prefix', 'language'];
      for (const field of requiredFields) {
        if (!settings[field] || typeof settings[field] !== 'string') {
          return false;
        }
      }

      // Validate prefix length
      if (settings.prefix.length > 5) {
        return false;
      }

      // Validate language
      if (!['EN', 'SI'].includes(settings.language)) {
        return false;
      }

      // Validate numeric fields
      if (settings.maxMessagesPerMinute && (typeof settings.maxMessagesPerMinute !== 'number' || settings.maxMessagesPerMinute < 1 || settings.maxMessagesPerMinute > 100)) {
        return false;
      }

      if (settings.responseDelay && (typeof settings.responseDelay !== 'number' || settings.responseDelay < 0 || settings.responseDelay > 10000)) {
        return false;
      }

      // Validate arrays
      if (settings.allowedFileTypes && !Array.isArray(settings.allowedFileTypes)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Settings validation error:', error);
      return false;
    }
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  generateSalt() {
    return crypto.randomBytes(16).toString('hex');
  }

  logSecurityEvent(eventType, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: eventType,
      details: details,
      id: crypto.randomUUID()
    };

    this.securityLogs.push(logEntry);

    // Keep only the last N entries
    if (this.securityLogs.length > this.maxLogEntries) {
      this.securityLogs.shift();
    }

    // Save to file
    this.saveSecurityLogs();

    console.log(`Security Event: ${eventType}`, details);
  }

  saveSecurityLogs() {
    try {
      const logsPath = path.join(__dirname, '../../data/security_logs.json');
      fs.writeJsonSync(logsPath, this.securityLogs, { spaces: 2 });
    } catch (error) {
      console.error('Error saving security logs:', error);
    }
  }

  checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.rateLimitMap.has(identifier)) {
      this.rateLimitMap.set(identifier, []);
    }

    const requests = this.rateLimitMap.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current request
    validRequests.push(now);
    this.rateLimitMap.set(identifier, validRequests);

    return true; // Request allowed
  }

  detectSuspiciousActivity(userId, activity) {
    const suspiciousPatterns = [
      'MULTIPLE_FAILED_LOGINS',
      'RAPID_API_CALLS',
      'UNUSUAL_COMMAND_USAGE',
      'SUSPICIOUS_FILE_UPLOAD'
    ];

    if (suspiciousPatterns.includes(activity.type)) {
      this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        userId,
        activity,
        severity: 'HIGH'
      });

      // Implement automatic response (e.g., temporary ban, alert admin)
      return true;
    }

    return false;
  }

  encryptSensitiveData(data, key) {
    try {
      const algorithm = 'aes-256-gcm';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, key);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  decryptSensitiveData(encryptedData, key) {
    try {
      const algorithm = 'aes-256-gcm';
      const decipher = crypto.createDecipher(algorithm, key);
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  getSecurityLogs(limit = 100) {
    return this.securityLogs.slice(-limit);
  }

  clearOldLogs(olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    this.securityLogs = this.securityLogs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    
    this.saveSecurityLogs();
  }
}