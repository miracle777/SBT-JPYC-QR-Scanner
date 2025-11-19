import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'SBT-JPYC-QR-Scanner',
  description: 'SBT表示とネットワーク検証機能付きJPYC決済アプリ - プライバシーポリシー対応 PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SBT-JPYC-Scanner',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'SBT-JPYC-Scanner',
    'apple-mobile-web-app-title': 'SBT-JPYC-Scanner',
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
      <body className="antialiased">
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
