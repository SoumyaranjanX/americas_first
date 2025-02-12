'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import { ErrorBoundary } from 'react-error-boundary';
import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import theme from '../styles/theme';

// Create emotion cache with deterministic class names
const createEmotionCache = () => {
  return createCache({
    key: 'css',
    prepend: true,
  });
};

const clientSideEmotionCache = createEmotionCache();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ErrorFallbackComponent: React.FC<{ error: Error }> = ({ error }) => (
  <div role="alert">
    <h1>Critical System Error</h1>
    <p>Please contact emergency support immediately.</p>
    <p>Error Reference: {error.message}</p>
  </div>
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Auth0Provider
              domain={process.env.NEXT_PUBLIC_AUTH_DOMAIN || ''}
              clientId={process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || ''}
              authorizationParams={{
                redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
                audience: process.env.NEXT_PUBLIC_AUTH_AUDIENCE,
              }}
            >
              <AuthProvider>
                {children}
              </AuthProvider>
            </Auth0Provider>
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
} 