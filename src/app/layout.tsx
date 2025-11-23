import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { GoogleAnalytics } from '../components/GoogleAnalytics';
import { StructuredData } from '../components/StructuredData';
import { Analytics } from '@vercel/analytics/next';
import { ProvidersWrapper } from '../components/ProvidersWrapper';

export const metadata: Metadata = {
  metadataBase: new URL('https://jpyc-pay.app'),
  title: {
    default: 'SBT masaru21 QR Scanner - JPYC決済アプリ',
    template: '%s | SBT masaru21 Scanner',
  },
  description: 'SBT表示とネットワーク検証機能付きJPYC決済アプリ。Ethereum、Polygon、AvalancheでのJPYC支払いに対応したPWAアプリケーション。',
  keywords: ['JPYC', 'SBT', 'QRスキャナー', 'Web3', 'Ethereum', 'Polygon', 'Avalanche', '決済', 'ブロックチェーン', 'PWA'],
  authors: [{ name: 'masaru21', url: 'https://x.com/masaru21' }],
  creator: 'masaru21',
  publisher: 'masaru21',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://jpyc-pay.app',
    title: 'SBT masaru21 QR Scanner - JPYC決済アプリ',
    description: 'SBT表示とネットワーク検証機能付きJPYC決済アプリ。マルチチェーン対応のWeb3決済ソリューション。',
    siteName: 'SBT masaru21 Scanner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBT masaru21 QR Scanner',
    description: 'SBT表示とネットワーク検証機能付きJPYC決済アプリ',
    creator: '@masaru21',
  },
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
        <StructuredData />
        <GoogleAnalytics />
        <ProvidersWrapper>
          {children}
          <PWAInstallPrompt />
          <Analytics />
          {/* JPYC免責事項 - デスクトップで左寄せ、コンテンツの下に表示 */}
          <footer className="mt-8 py-6 px-4 bg-gray-50 border-t border-gray-200">
            <div className="max-w-2xl mx-auto">
              <div className="text-left space-y-2">
                <p className="text-xs text-gray-600">
                  ※ 本プログラムは、JPYC株式会社による公式コンテンツではありません。
                </p>
                <p className="text-xs text-gray-600">
                  ※ 「JPYC」は、JPYC株式会社の提供するステーブルコインです。
                </p>
                <p className="text-xs text-gray-600">
                  ※ JPYC及びJPYCロゴは、JPYC株式会社の登録商標です。
                </p>
              </div>
            </div>
          </footer>
        </ProvidersWrapper>
      </body>
    </html>
  );
}
