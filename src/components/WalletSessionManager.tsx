'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useDisconnect, useReconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface WalletSessionManagerProps {
  children: React.ReactNode;
}

export function WalletSessionManager({ children }: WalletSessionManagerProps) {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { reconnect } = useReconnect();
  
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const activityTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // MetaMaskの接続状態を確認する関数
  const checkMetaMaskConnection = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || !window.ethereum || !isConnected || !address) {
        return false;
      }

      // MetaMaskの場合の詳細チェック
      if (connector?.name?.toLowerCase().includes('metamask') || 
          window.ethereum.isMetaMask) {
        
        // アカウント情報を取得して接続状態を確認
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          return false;
        }
        
        // 現在のアドレスが有効かチェック
        const currentAccount = accounts[0];
        if (currentAccount.toLowerCase() !== address.toLowerCase()) {
          return false;
        }
        
        // ネットワーク接続をテスト（エラーハンドリング強化）
        try {
          await window.ethereum.request({ 
            method: 'eth_chainId' 
          });
        } catch (error) {
          console.warn('Chain ID check failed:', error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('MetaMask connection check failed:', error);
      return false;
    }
  }, [isConnected, address, connector]);

  // セッションの健全性をチェック
  const checkSessionHealth = useCallback(async () => {
    if (!isConnected || isChecking) return;
    
    setIsChecking(true);
    
    try {
      const isValid = await checkMetaMaskConnection();
      
      if (!isValid && isConnected) {
        console.warn('Session validation failed, marking as invalid');
        setIsSessionValid(false);
        setShowSessionWarning(true);
      } else {
        setIsSessionValid(true);
        setShowSessionWarning(false);
      }
    } catch (error) {
      console.error('Session health check error:', error);
      setIsSessionValid(false);
      setShowSessionWarning(true);
    } finally {
      setIsChecking(false);
    }
  }, [isConnected, isChecking, checkMetaMaskConnection]);

  // 自動再接続を実行
  const handleAutoReconnect = useCallback(async () => {
    try {
      setIsChecking(true);
      
      // まず切断
      await disconnect();
      
      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 再接続を試行
      await reconnect();
      
      setShowSessionWarning(false);
      setIsSessionValid(true);
    } catch (error) {
      console.error('Auto reconnect failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [disconnect, reconnect]);

  // ユーザーアクティビティを記録
  const recordActivity = useCallback(() => {
    setLastActivity(Date.now());
    
    // アクティビティタイムアウトをリセット
    if (activityTimeout.current) {
      clearTimeout(activityTimeout.current);
    }
    
    // 5分間非アクティブな場合にセッションチェックを実行
    activityTimeout.current = setTimeout(() => {
      if (isConnected) {
        checkSessionHealth();
      }
    }, 5 * 60 * 1000); // 5分
  }, [isConnected, checkSessionHealth]);

  // 定期的なセッションチェックを設定
  useEffect(() => {
    if (isConnected && isSessionValid) {
      // 30秒ごとにセッション状態をチェック
      sessionCheckInterval.current = setInterval(() => {
        checkSessionHealth();
      }, 30 * 1000);
      
      return () => {
        if (sessionCheckInterval.current) {
          clearInterval(sessionCheckInterval.current);
        }
      };
    }
  }, [isConnected, isSessionValid, checkSessionHealth]);

  // ユーザーアクティビティの監視
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => recordActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
    };
  }, [recordActivity]);

  // MetaMaskアカウント変更の監視
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0 && isConnected) {
        // アカウントが削除された場合
        setIsSessionValid(false);
        setShowSessionWarning(true);
      } else if (accounts.length > 0 && address && 
                 accounts[0].toLowerCase() !== address.toLowerCase()) {
        // アカウントが変更された場合
        setShowSessionWarning(true);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload(); // ページをリロードして状態を同期
          }
        }, 2000);
      }
    };

    const handleChainChanged = () => {
      // チェーン変更時は少し待ってからセッションチェック
      setTimeout(checkSessionHealth, 1000);
    };

    const handleConnect = () => {
      setIsSessionValid(true);
      setShowSessionWarning(false);
    };

    const handleDisconnect = () => {
      setIsSessionValid(false);
    };

    const ethereum = window.ethereum as (typeof window.ethereum & {
      on?: (event: string, callback: (data?: unknown) => void) => void;
      removeListener?: (event: string, callback: (data?: unknown) => void) => void;
    });
    
    const handleAccountsChangedWrapper = (data: unknown) => {
      if (Array.isArray(data)) {
        handleAccountsChanged(data);
      }
    };
    
    const handleChainChangedWrapper = () => {
      handleChainChanged();
    };
    
    const handleConnectWrapper = () => {
      handleConnect();
    };
    
    const handleDisconnectWrapper = () => {
      handleDisconnect();
    };
    
    if (ethereum?.on) {
      ethereum.on('accountsChanged', handleAccountsChangedWrapper);
      ethereum.on('chainChanged', handleChainChangedWrapper);
      ethereum.on('connect', handleConnectWrapper);
      ethereum.on('disconnect', handleDisconnectWrapper);
    }

    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChangedWrapper);
        ethereum.removeListener('chainChanged', handleChainChangedWrapper);
        ethereum.removeListener('connect', handleConnectWrapper);
        ethereum.removeListener('disconnect', handleDisconnectWrapper);
      }
    };
  }, [isConnected, address, checkSessionHealth]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
    };
  }, []);

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showSessionWarning && isConnected && (
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
                    ウォレット接続に問題があります
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                    MetaMaskのセッションが無効になっている可能性があります。再接続をお試しください。
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleAutoReconnect}
                      disabled={isChecking}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          再接続中...
                        </>
                      ) : (
                        <>
                          <Wifi className="h-3 w-3" />
                          再接続
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowSessionWarning(false)}
                      className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 text-xs font-medium px-2 py-1.5 transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 接続状態インジケーター */}
      {isConnected && (
        <div className="fixed bottom-4 right-4 z-40">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm ${
              isSessionValid 
                ? 'bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-300'
            }`}
            title={isSessionValid ? 'ウォレット接続正常' : 'ウォレット接続に問題があります'}
          >
            {isSessionValid ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}