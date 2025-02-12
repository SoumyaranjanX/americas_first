/**
 * @fileoverview Main entry point for AUSTA shared module
 * Exports all shared utilities, interfaces, types, and configurations
 * @version 1.0.0
 */

// Export constants
export * from './constants/error-codes';
export * from './constants/http-status';

// Export interfaces
export * from './interfaces/user.interface';
export * from './interfaces/health-record.interface';

// Export utilities
export * from './utils/validation.utils';
export * from './utils/encryption.utils';

// Export middleware
export * from './middleware/logger';
export * from './middleware/error-handler';

// Export types
export * from './types';

// Export config
export * from './config';

// Re-export types
export type { IUser, IUserProfile, IUserSecuritySettings, IUserAudit, IUserAddress } from './interfaces/user.interface';
export { UserRole, UserStatus } from './interfaces/user.interface';
export type { ValidationResult, ValidationError, SanitizationOptions } from './utils/validation.utils';

// Export error codes and messages
export { ErrorCode, ErrorMessage } from './constants/error-codes';
export { HttpStatus } from './constants/http-status'; 