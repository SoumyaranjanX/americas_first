const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Disable Jest worker
    config.externals = [...(config.externals || []), 'jest-worker', 'jest-runtime'];

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
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
      '@components': path.join(__dirname, 'src/components'),
      '@lib': path.join(__dirname, 'src/lib'),
      '@styles': path.join(__dirname, 'src/styles'),
      '@hooks': path.join(__dirname, 'src/hooks'),
      '@types': path.join(__dirname, 'src/lib/types')
    };

    // Ignore test files during build
    config.module.rules.push({
      test: /\.(test|spec|jest)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });

    // Disable worker threads in webpack
    config.optimization = {
      ...config.optimization,
      minimize: !dev,
      minimizer: config.optimization.minimizer || [],
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all'
      }
    };

    return config;
  },
  // Disable optimization for now to prevent build issues
  swcMinify: false,
  optimizeCss: false,
};

module.exports = withPWA(nextConfig); 