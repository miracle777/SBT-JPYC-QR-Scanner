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
};

module.exports = withPWA(nextConfig);
