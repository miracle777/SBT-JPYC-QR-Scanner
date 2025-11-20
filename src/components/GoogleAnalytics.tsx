'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// ページビューを送信
export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// イベントを送信
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// ページ遷移を追跡（useSearchParamsを使わない簡易版）
function GoogleAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

    // window.locationから直接URLを取得
    const url = window.location.pathname + window.location.search;
    pageview(url);
  }, [pathname]);

  return null;
}

// メインコンポーネント
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <GoogleAnalyticsTracker />
    </>
  );
}
