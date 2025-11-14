/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
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
  // Next.js 16 では Turbopack がデフォルト
  turbopack: {},
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  // スマホからのアクセスを許可
  allowedDevOrigins: ['172.20.10.11'],
};

module.exports = withPWA(nextConfig);
