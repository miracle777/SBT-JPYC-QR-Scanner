/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\..*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 3600,
        },
      },
    },
  ],
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Turbopackの問題を回避するため、webpackビルドを使用
  experimental: {
    forceSwcTransforms: true,
  },
  // webpackでビルド時にサーバー専用パッケージを外部化
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream', 'lokijs', 'encoding'],
  
  webpack: (config, { isServer }) => {
    // クライアント側でNode.js専用モジュールを外部化
    if (!isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // スマホからのアクセスを許可
  allowedDevOrigins: ['172.20.10.11'],
};

module.exports = withPWA(nextConfig);
