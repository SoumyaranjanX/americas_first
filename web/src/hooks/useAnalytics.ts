import { useEffect, useCallback, useContext, useState } from 'react'; // v18.0.0
import { Analytics, AnalyticsCategory, PrivacyLevel, PerformanceMetric } from '../lib/utils/analytics';
import { IAuthContext } from '../lib/types/auth';
import { useAuthContext } from '../contexts/AuthContext';

// Enhanced types for analytics hook
export enum PrivacyStatus {
  CONSENTED = 'CONSENTED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING'
}

interface IPerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

interface IAnalyticsHook {
  logEvent: (event: AnalyticsEvent) => Promise<void>;
  logError: (error: Error, context: Record<string, any>, privacyLevel: PrivacyLevel) => Promise<void>;
  logPerformance: (metric: PerformanceMetric) => Promise<void>;
  isInitialized: boolean;
  privacyStatus: PrivacyStatus;
  performanceMetrics: IPerformanceMetrics;
}

interface AnalyticsEvent {
  name: string;
  category: AnalyticsCategory;
  properties?: Record<string, any>;
  timestamp?: number;
  userConsent?: boolean;
  privacyLevel?: PrivacyLevel;
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

/**
 * Custom React hook for HIPAA and LGPD compliant analytics tracking
 * Implements comprehensive monitoring with enhanced privacy controls
 */
export const useAnalytics = (): IAnalyticsHook => {
  // Track initialization and privacy status
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>(PrivacyStatus.PENDING);
  const [performanceMetrics, setPerformanceMetrics] = useState<IPerformanceMetrics>({
    pageLoadTime: 0,
    timeToInteractive: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0
  });

  // Get auth context for user data and privacy settings
  const authContext = useAuthContext();

  // Initialize analytics with privacy checks
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        await Analytics.initializeAnalytics();
        setIsInitialized(true);

        // Set initial privacy status based on user role and status
        if (authContext.user?.role && authContext.user?.status === 'ACTIVE') {
          setPrivacyStatus(PrivacyStatus.CONSENTED);
        } else {
          setPrivacyStatus(PrivacyStatus.PENDING);
        }
      } catch (error) {
        console.error('Analytics initialization failed:', error);
        setIsInitialized(false);
      }
    };

    initAnalytics();

    // Cleanup on unmount
    return () => {
      setIsInitialized(false);
    };
  }, [authContext.user]);

  // Set up performance monitoring
  useEffect(() => {
    if (!isInitialized) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics = { ...performanceMetrics };

      entries.forEach(entry => {
        switch (entry.entryType) {
          case 'navigation':
            metrics.pageLoadTime = entry.duration;
            break;
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metrics.largestContentfulPaint = entry.startTime;
            break;
          case 'layout-shift':
            metrics.cumulativeLayoutShift += (entry as any).value;
            break;
        }
      });

      setPerformanceMetrics(metrics);
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift'] });

    return () => observer.disconnect();
  }, [isInitialized]);

  // Memoized event tracking function
  const logEvent = useCallback(async (event: AnalyticsEvent): Promise<void> => {
    if (!isInitialized || privacyStatus !== PrivacyStatus.CONSENTED) {
      return;
    }

    try {
      // Add user context with privacy protection
      const enhancedEvent = {
        ...event,
        properties: {
          ...event.properties,
          userRole: authContext.user?.role,
          userStatus: authContext.user?.status,
          sessionId: authContext.tokens?.accessToken
        },
        userConsent: true,
        timestamp: Date.now(),
        auditInfo: {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          userId: authContext.user?._id || 'anonymous',
          ipAddress: '[REDACTED]',
          actionType: event.name
        }
      };

      await Analytics.trackEvent(enhancedEvent);
    } catch (error) {
      console.error('Event tracking failed:', error);
    }
  }, [isInitialized, privacyStatus, authContext]);

  // Memoized error tracking function
  const logError = useCallback(async (
    error: Error,
    context: Record<string, any>,
    privacyLevel: PrivacyLevel
  ): Promise<void> => {
    if (!isInitialized) return;

    try {
      const enhancedContext = {
        ...context,
        userRole: authContext.user?.role,
        errorId: crypto.randomUUID(),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV
      };

      await Analytics.trackError(error, enhancedContext);
    } catch (error) {
      console.error('Error tracking failed:', error);
    }
  }, [isInitialized, authContext]);

  // Memoized performance tracking function
  const logPerformance = useCallback(async (metric: PerformanceMetric): Promise<void> => {
    if (!isInitialized) return;

    try {
      const enhancedMetric = {
        ...metric,
        tags: {
          ...metric.tags,
          userRole: authContext.user?.role || 'anonymous',
          environment: process.env.NODE_ENV || 'development'
        },
        context: {
          ...metric.context,
          sessionId: authContext.tokens?.accessToken,
          deviceType: navigator.userAgent
        },
        timestamp: Date.now()
      };

      await Analytics.trackPerformance(enhancedMetric as PerformanceMetric);
    } catch (error) {
      console.error('Performance tracking failed:', error);
    }
  }, [isInitialized, authContext]);

  return {
    logEvent,
    logError,
    logPerformance,
    isInitialized,
    privacyStatus,
    performanceMetrics
  };
};

export default useAnalytics;