import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if we have a DSN
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Performance monitoring
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/[^/]*austa-health\.com/],
    
    // Session replay
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    
    // Environment and debugging
    environment: process.env.NODE_ENV,
    debug: process.env.NODE_ENV === 'development',
    enabled: process.env.NODE_ENV === 'production',
    
    // Privacy and security
    beforeSend(event) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
    
    // Integrations
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Source maps configuration
    release: process.env.NEXT_PUBLIC_RELEASE_VERSION || 'development',
    dist: '1',
    autoSessionTracking: true,
  });
} 