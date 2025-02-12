/**
 * Security utilities for the web application
 */

import { IUser } from '../types/user';

export class SecurityUtils {
  /**
   * Masks PII (Personally Identifiable Information)
   */
  static maskPII(value: string): string {
    if (!value) return '';
    
    // Email masking
    if (value.includes('@')) {
      const [local, domain] = value.split('@');
      return `${local[0]}***@${domain}`;
    }
    
    // Phone number masking
    if (/^\+?[\d-]{10,}$/.test(value)) {
      return value.slice(-4).padStart(value.length, '*');
    }
    
    // Name masking (show first character of each word)
    return value.split(' ')
      .map(word => `${word[0]}${word.slice(1).replace(/./g, '*')}`)
      .join(' ');
  }

  /**
   * Sanitizes user input
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validates user updates against security policy
   */
  static validateUserUpdates(updates: Partial<IUser>): boolean {
    // Add your validation logic here
    return true;
  }

  /**
   * Validates session token
   */
  static validateSessionToken(token: string): boolean {
    return token.length >= 32 && /^[a-f0-9]+$/i.test(token);
  }

  /**
   * Checks if the current context is secure (HTTPS)
   */
  static isSecureContext(): boolean {
    return typeof window !== 'undefined' && window.location.protocol === 'https:';
  }

  /**
   * Validates password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
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
  }
}

export default SecurityUtils; 