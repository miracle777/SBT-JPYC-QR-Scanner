import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SBT-JPYC-QR-Scanner',
  description: 'SBT表示とネットワーク検証機能付きJPYC決済アプリ',
  manifest: '/manifest.json',
  themeColor: '#627EEA',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
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
        {children}
      </body>
    </html>
  );
}
