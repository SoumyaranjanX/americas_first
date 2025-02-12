import * as Sentry from '@sentry/nextjs';

export interface ErrorContext {
  component?: string;
  userId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  operation?: string;
}

type NodeEnv = 'development' | 'production' | 'test';

function isDevOrTest(env: string | undefined): boolean {
  return env === 'development' || env === 'test';
}

/**
 * Initialize Sentry with configuration
 */
export const initializeSentry = () => {
  const env = process.env.NODE_ENV;
  if (isDevOrTest(env)) {
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env,
    tracesSampleRate: 1.0,
    debug: env === 'development',
  });
};

/**
 * Capture an error with optional context
 */
export const captureError = (error: Error, context?: ErrorContext) => {
  const env = process.env.NODE_ENV;
  if (isDevOrTest(env)) {
    console.error('[ERROR]', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.component) {
      scope.setTag('component', context.component);
    }
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      scope.setExtras(context.extra);
    }
    Sentry.captureException(error);
  });
};

/**
 * Capture a message with a specified severity level
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: ErrorContext
) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.component) {
      scope.setTag('component', context.component);
    }
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      scope.setExtras(context.extra);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
};

/**
 * Set user context in Sentry
 */
export const setUser = (id: string, email?: string, username?: string) => {
  Sentry.setUser({ id, email, username });
};

/**
 * Clear user context from Sentry
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

/**
 * Start a new transaction for performance monitoring
 */
export const startTransaction = (
  name: string,
  op: string,
  context?: Record<string, any>
) => {
  return Sentry.startTransaction({
    name,
    op,
    ...context,
  });
};

/**
 * Set a tag for the current scope
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Set multiple tags for the current scope
 */
export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

export default {
  initializeSentry,
  captureError,
  captureMessage,
  setUser,
  clearUser,
  startTransaction,
  setTag,
  setTags,
}; 