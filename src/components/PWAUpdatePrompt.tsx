'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, X } from 'lucide-react';

export function PWAUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Service Worker の更新検知
    if ('serviceWorker' in navigator) {
      // Service Worker メッセージリスナー
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('Service Worker updated via message');
          setUpdateAvailable(true);
          setShowPrompt(true);
        }
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed - update available');
        setUpdateAvailable(true);
        setShowPrompt(true);
      });

      // Service Worker の登録確認と更新チェック
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          // 定期的に更新をチェック
          setInterval(() => {
            registration.update().then(() => {
              console.log('Checked for Service Worker update');
            });
          }, 60000); // 1分ごとにチェック

          // Service Worker の状態変化を監視
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New Service Worker installed - showing update prompt');
                  setUpdateAvailable(true);
                  setShowPrompt(true);
                }
              });
            }
          });
        }
      });

      // ページロード時に既に新しいService Workerが待機中かチェック
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          console.log('Service Worker waiting - update available');
          setUpdateAvailable(true);
          setShowPrompt(true);
        }
      });
    }

    // ページビューアビリティ監視（バックグラウンドから戻った時の更新チェック）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleUpdate = async () => {
    if (!updateAvailable) return;
    
    setIsUpdating(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration && registration.waiting) {
          // 新しいService Workerをアクティブ化
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // ページを再読み込みして新しいバージョンを適用
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 10分後に再度表示するかチェック
    setTimeout(() => {
      if (updateAvailable) {
        setShowPrompt(true);
      }
    }, 600000); // 10分
  };

  if (!showPrompt || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 border border-blue-300 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {isUpdating ? (
                <RefreshCw className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Download className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-1">
              アプリの更新が利用可能です
            </h3>
            
            <p className="text-xs text-blue-100 mb-3">
              新機能とバグ修正が含まれています。今すぐ更新しますか？
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3" />
                    更新
                  </>
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                disabled={isUpdating}
                className="px-3 py-2 text-blue-100 hover:text-white transition-colors disabled:opacity-50"
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