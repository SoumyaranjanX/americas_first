import { useCallback } from 'react';

interface AuditLogOptions {
  component: string;
  level?: 'HIPAA' | 'STANDARD' | 'DEBUG';
}

interface AuditLogEvent {
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp?: number;
  userId?: string;
}

const sendAuditLog = async (event: AuditLogEvent, options: AuditLogOptions) => {
  // In a real application, this would send the audit log to a server
  // For now, we'll just console log it in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT LOG]', {
      ...event,
      component: options.component,
      level: options.level || 'STANDARD',
      timestamp: event.timestamp || Date.now(),
      userId: event.userId || JSON.parse(localStorage.getItem('currentUser') || '{}').id
    });
  }
};

export const useAuditLog = (options: AuditLogOptions) => {
  const logAudit = useCallback((
    action: string,
    details?: Omit<AuditLogEvent, 'action'>
  ) => {
    return sendAuditLog({
      action,
      ...details,
      timestamp: Date.now()
    }, options);
  }, [options]);

  return { logAudit };
};

export default useAuditLog; 