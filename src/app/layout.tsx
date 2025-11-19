import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'SBT masaru21 QR Scanner（仮）',
  description: 'SBT表示とネットワーク検証機能付きJPYC決済アプリ - プライバシーポリシー対応 PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SBT masaru21 Scanner',

  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'SBT masaru21 Scanner',
    'apple-mobile-web-app-title': 'SBT masaru21 Scanner',
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
          <footer className="mt-8 py-4 px-4 text-center text-xs text-gray-500 border-t border-gray-200">
            <div className="space-y-1">
              <p>※ 本プログラムは、JPYC株式会社による公式コンテンツではありません。</p>
              <p>※ 「JPYC」は、JPYC株式会社の提供するステーブルコインです。</p>
              <p>※ JPYC及びJPYCロゴは、JPYC株式会社の登録商標です。</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
