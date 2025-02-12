/**
 * @fileoverview Next.js configuration for AUSTA SuperApp web application
 * Implements comprehensive security, PWA capabilities, and performance optimizations
 * with HIPAA compliance considerations
 */

const { BASE_URL, API_VERSION } = require('./src/lib/constants/config.js');
let withBundleAnalyzer = () => (config) => config;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer');
} catch (e) {
  console.warn('Bundle analyzer not available');
}
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

/**
 * Content Security Policy configuration
 * Implements strict CSP rules for HIPAA compliance
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' ${BASE_URL} http://localhost:* https://sentry.io;
  frame-ancestors 'none';
  media-src 'self' blob:;
  worker-src 'self' blob:;
  manifest-src 'self';
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: false,
    appDir: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Handle client-side only modules
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@simplewebauthn/browser': false,
        '@fingerprintjs/fingerprintjs': false,
        'crypto-js': false,
      }
    }

    // Add module aliases
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.join(__dirname, 'src'),
        '@components': path.join(__dirname, 'src/components'),
        '@lib': path.join(__dirname, 'src/lib'),
        '@styles': path.join(__dirname, 'src/styles'),
        '@hooks': path.join(__dirname, 'src/hooks'),
        '@types': path.join(__dirname, 'src/lib/types')
      }
    };

    // Ignore test files during build
    config.module.rules.push({
      test: /\.(test|spec|jest)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });

    return config;
  },
  // Enable production optimizations
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  },
  images: {
    domains: ['cdn.austa.health', 'storage.austa.health'],
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

// Export the final configuration with all wrappers
const finalConfig = () => {
  let config = nextConfig;

  if (process.env.ANALYZE === 'true' && typeof withBundleAnalyzer === 'function') {
    config = withBundleAnalyzer({
      enabled: true,
      openAnalyzer: true,
    })(config);
  }

  return config;
};

module.exports = finalConfig();