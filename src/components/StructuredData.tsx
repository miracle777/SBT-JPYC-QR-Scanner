'use client';

export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SBT masaru21 QR Scanner',
    description: 'SBT表示とネットワーク検証機能付きJPYC決済アプリ。Ethereum、Polygon、AvalancheでのJPYC支払いに対応したPWAアプリケーション。',
    url: 'https://jpyc-pay.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    author: {
      '@type': 'Person',
      name: 'masaru21',
      url: 'https://x.com/masaru21',
    },
    featureList: [
      'SBT (Soulbound Token) 表示',
      'JPYC決済QRコードスキャン',
      'マルチネットワーク対応（Ethereum、Polygon、Avalanche）',
      'ネットワーク自動検証',
      'PWA対応',
      'MetaMask連携',
    ],
    screenshot: 'https://jpyc-pay.app/og-image.png',
    softwareVersion: '1.1.0',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: '10',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
