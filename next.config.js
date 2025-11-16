/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // 強制的にサービスワーカーを更新
  buildExcludes: [/middleware-manifest\.json$/],
  // キャッシュバスティングを強化
  dynamicStartUrlRedirect: '/index.html',
  fallbacks: {
    document: '/offline.html',
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\..*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v2',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 1800, // キャッシュ時間を短縮
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|html)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources-v2',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 86400,
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
      
      // React Native専用パッケージの警告を抑制
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': false,
      };
    }
    
    return config;
  },
  // スマホからのアクセスを許可
  allowedDevOrigins: ['172.20.10.11'],
};

module.exports = withPWA(nextConfig);
