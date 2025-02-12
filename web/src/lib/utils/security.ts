/**
 * Security utilities for the web application
 */

import { AES, enc } from 'crypto-js';

interface SecurityConfig {
  encryptionKey: string;
  ivLength: number;
  saltLength: number;
}

const DEFAULT_CONFIG: SecurityConfig = {
  encryptionKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key',
  ivLength: 16,
  saltLength: 16
};

/**
 * Encrypts sensitive data
 */
export const encryptData = (data: string, key: string = DEFAULT_CONFIG.encryptionKey): string => {
  return AES.encrypt(data, key).toString();
};

/**
 * Decrypts encrypted data
 */
export const decryptData = (encryptedData: string, key: string = DEFAULT_CONFIG.encryptionKey): string => {
  const bytes = AES.decrypt(encryptedData, key);
  return bytes.toString(enc.Utf8);
};

/**
 * Sanitizes user input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generates a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates session token
 */
export const validateSessionToken = (token: string): boolean => {
  // Add your session token validation logic here
  return token.length >= 32 && /^[a-f0-9]+$/i.test(token);
};

/**
 * Checks if the current context is secure (HTTPS)
 */
export const isSecureContext = (): boolean => {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
};

/**
 * Security monitoring utilities
 */
export const SecurityMonitor = {
  logSecurityEvent: (event: string, details: Record<string, any>) => {
    // Add your security event logging logic here
    console.log('[SECURITY EVENT]', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  checkSecurityStatus: () => {
    return {
      isSecure: isSecureContext(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasSecureLocalStorage: typeof localStorage !== 'undefined'
    };
  }
};

export default {
  encryptData,
  decryptData,
  sanitizeInput,
  validatePassword,
  generateSecureToken,
  validateSessionToken,
  isSecureContext,
  SecurityMonitor
}; 