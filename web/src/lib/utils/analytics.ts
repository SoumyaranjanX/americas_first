/**
 * @fileoverview Analytics utility for development
 */

export enum AnalyticsCategory {
  USER_INTERACTION = 'USER_INTERACTION',
  SYSTEM = 'SYSTEM',
  ERROR = 'ERROR',
  PERFORMANCE = 'PERFORMANCE',
  BUSINESS_METRICS = 'BUSINESS_METRICS',
  SECURITY = 'SECURITY',
  CLINICAL = 'CLINICAL'
}

export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  SENSITIVE = 'SENSITIVE'
}

interface AnalyticsEvent {
  name: string;
  category: AnalyticsCategory | string;
  properties?: Record<string, any>;
  timestamp?: number;
  userConsent?: boolean;
  privacyLevel?: PrivacyLevel | string;
  auditInfo?: {
    eventId: string;
    timestamp: number;
    userId?: string;
    ipAddress?: string;
    actionType: string;
  };
}

interface ErrorEvent {
  error: Error;
  context?: Record<string, any>;
  component?: string;
  errorInfo?: React.ErrorInfo;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  context?: Record<string, any>;
  timestamp?: number;
}

export class Analytics {
  private static instance: Analytics;
  public static readonly AnalyticsCategory = AnalyticsCategory;
  public static readonly PrivacyLevel = PrivacyLevel;

  private constructor() {}

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  public static trackEvent(event: AnalyticsEvent): void {
    // In a real application, this would send the event to an analytics service
    // For now, we'll just console log it in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[ANALYTICS]', {
        ...event,
        timestamp: event.timestamp || Date.now()
      });
    }
  }

  public static trackError(error: Error, context?: Record<string, any>): void {
    // In a real application, this would send the error to an error tracking service
    // For now, we'll just console log it in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', {
        error: {
          name: error.name,
          message: error.message,
        },
        context,
      });
    }
  }

  public static trackPerformance(metric: PerformanceMetric): void {
    // In a real application, this would send performance metrics to a monitoring service
    // For now, we'll just console log it in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[PERFORMANCE]', metric);
    }
  }

  public static initializeAnalytics(): Promise<void> {
    return Promise.resolve();
  }
}

// Export the singleton instance
export const analytics = Analytics.getInstance();
export default Analytics;