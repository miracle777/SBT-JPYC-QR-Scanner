import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'SBT JPYC Scanner',
  description: 'SBT表示機能付きJPYC決済スキャナーアプリ - PWA対応',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SBT Scanner',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'SBT Scanner',
    'apple-mobile-web-app-title': 'SBT Scanner',
  },
};

export const viewport: Viewport = {
  themeColor: '#627EEA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
