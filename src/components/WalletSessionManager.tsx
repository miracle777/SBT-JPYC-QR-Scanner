'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface WalletSessionManagerProps {
  children: React.ReactNode;
}

export function WalletSessionManager({ children }: WalletSessionManagerProps) {
  const { isConnected } = useAccount();
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  
  // ネットワーク接続状態の監視（シンプル化）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setShowOfflineWarning(false);
    const handleOffline = () => {
      if (isConnected) {
        setShowOfflineWarning(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected]);

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showOfflineWarning && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md"
          >
            <div className="bg-yellow-50 dark:bg-yellow-900/90 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <WifiOff className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                    ネットワーク接続が不安定です
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                    インターネット接続を確認してください。
                  </p>
                  <button
                    onClick={() => setShowOfflineWarning(false)}
                    className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 text-xs font-medium px-2 py-1.5 mt-2 transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 接続状態インジケーター（シンプル化） */}
      {isConnected && (
        <div className="fixed bottom-4 right-4 z-40">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2 rounded-full shadow-lg backdrop-blur-sm bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300"
            title="ウォレット接続中"
          >
            <Wifi className="h-4 w-4" />
          </motion.div>
        </div>
      )}
    </>
  );
}