'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { event as gaEvent } from './GoogleAnalytics';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // iOS検出を初期化時に設定
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  // スタンドアローンモード検出を初期化時に設定
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone);
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // アプリがインストールされた時のハンドラ
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');

      // Google Analyticsにインストールイベントを送信
      gaEvent({
        action: 'pwa_install',
        category: 'PWA',
        label: 'installed',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // ローカルストレージでインストール促進の表示状態を管理
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    if (!hasSeenPrompt && !isStandalone) {
      // 数秒後にプロンプトを表示（iOS用）
      setTimeout(() => {
        if (isIOS && !isStandalone) {
          setShowPrompt(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isIOS, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
      // インストール受諾をトラッキング
      gaEvent({
        action: 'pwa_install_prompt',
        category: 'PWA',
        label: 'accepted',
      });
    } else {
      console.log('User dismissed PWA install');
      // インストール拒否をトラッキング
      gaEvent({
        action: 'pwa_install_prompt',
        category: 'PWA',
        label: 'dismissed',
      });
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 1日間は表示しない
    localStorage.setItem('pwa-install-prompt-dismissed', Date.now().toString());
  };

  // 既にスタンドアローンモードまたは表示しない設定の場合は何も表示しない
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {isIOS ? <Smartphone className="h-5 w-5 text-blue-600" /> : <Download className="h-5 w-5 text-blue-600" />}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              アプリをインストール
            </h3>

            {isIOS ? (
              <div className="text-xs text-gray-600 mb-3">
                <p className="mb-1">ホーム画面に追加して快適に使用：</p>
                <ol className="space-y-1">
                  <li>1. 共有ボタン (⎘) をタップ</li>
                  <li>2. 「ホーム画面に追加」を選択</li>
                </ol>
              </div>
            ) : (
              <p className="text-xs text-gray-600 mb-3">
                ホーム画面に追加してアプリのように使用できます
              </p>
            )}

            <div className="flex gap-2">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  インストール
                </button>
              )}

              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
