'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useReconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle2, X, RefreshCw, Loader2, Wifi } from 'lucide-react';
import { WalletTroubleshootingGuide } from './WalletTroubleshootingGuide';

export function WalletConnector() {
  const { isConnected, isConnecting, isDisconnected, address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { reconnect } = useReconnect();
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSessionCheck, setLastSessionCheck] = useState<number>(0);
  const [isSessionHealthy, setIsSessionHealthy] = useState(true);
  
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setConnectionAttempts(0);
  }, []);

  const clearConnectionTimeout = useCallback(() => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
  }, [connectionTimeout]);

  // セッションの健全性をチェック
  const checkSessionHealth = useCallback(async (): Promise<boolean> => {
    try {
      if (!window.ethereum || !isConnected || !address) {
        return false;
      }

      // MetaMaskの場合の詳細チェック
      if (connector?.name?.toLowerCase().includes('metamask') || 
          window.ethereum.isMetaMask) {
        
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (!accounts || accounts.length === 0) {
          return false;
        }
        
        const currentAccount = accounts[0];
        if (currentAccount.toLowerCase() !== address.toLowerCase()) {
          return false;
        }
        
        // ネットワーク接続をテスト
        await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
      }
      
      return true;
    } catch (error) {
      console.error('Session health check failed:', error);
      return false;
    }
  }, [isConnected, address, connector]);

  // セッション監視を開始
  const startSessionMonitoring = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(async () => {
      if (isConnected) {
        const isHealthy = await checkSessionHealth();
        setIsSessionHealthy(isHealthy);
        setLastSessionCheck(Date.now());
        
        if (!isHealthy) {
          console.warn('Session unhealthy, may need reconnection');
          setError('ウォレットセッションが無効になっています。再接続が必要です。');
        }
      }
    }, 30000); // 30秒ごとにチェック
  }, [isConnected, checkSessionHealth]);

  // セッション監視を停止
  const stopSessionMonitoring = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  }, []);

  // 接続タイムアウトを設定
  const setConnectionTimeoutHandler = useCallback(() => {
    clearConnectionTimeout();
    const timeout = setTimeout(() => {
      if (isConnecting && !isConnected) {
        setError('接続がタイムアウトしました。ウォレットアプリで承認を確認するか、アプリを再起動してください。');
        setIsRetrying(false);
      }
    }, 60000); // 60秒でタイムアウト（Trust Wallet対応）
    setConnectionTimeout(timeout);
  }, [isConnecting, isConnected, clearConnectionTimeout]);

  // 接続成功時にクリーンアップ
  useEffect(() => {
    if (isConnected) {
      clearConnectionTimeout();
      clearError();
      setIsRetrying(false);
      setIsSessionHealthy(true);
      startSessionMonitoring();
    } else {
      stopSessionMonitoring();
      setIsSessionHealthy(true);
    }
  }, [isConnected, clearConnectionTimeout, clearError, startSessionMonitoring, stopSessionMonitoring]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      stopSessionMonitoring();
      clearConnectionTimeout();
    };
  }, [stopSessionMonitoring, clearConnectionTimeout]);

  // 再接続処理
  const handleRetry = useCallback(async () => {
    if (connectionAttempts >= 3) {
      setError('接続試行回数が上限に達しました。ページを更新して再度お試しください。');
      return;
    }

    setIsRetrying(true);
    setError(null);
    setConnectionAttempts(prev => prev + 1);
    
    try {
      // セッションが無効な場合は強制的に再接続
      if (!isSessionHealthy && isConnected) {
        console.log('Forcing reconnection due to unhealthy session');
        disconnect();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await reconnect();
      } else {
        // 一度切断してから再接続
        if (isConnected) {
          disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setConnectionTimeoutHandler();
    } catch (err) {
      console.error('Retry error:', err);
      setError('再接続に失敗しました。');
      setIsRetrying(false);
    }
  }, [connectionAttempts, isConnected, isSessionHealthy, disconnect, reconnect, setConnectionTimeoutHandler]);

  // 接続済みの場合は何も表示しない
  if (isConnected) {
    return null;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg w-full max-w-sm"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
              <div className="flex gap-1">
                {connectionAttempts < 3 && (
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                    title="再試行"
                  >
                    {isRetrying ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </button>
                )}
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="エラーを閉じる"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            {connectionAttempts > 0 && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                接続試行: {connectionAttempts}/3
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full"
      >
        <div className="mb-4">
          <Wallet className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            ウォレットを接続
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            JPYC決済をご利用ください
          </p>
        </div>

        <div>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              try {
                                clearError();
                                setConnectionTimeoutHandler();
                                openConnectModal();
                              } catch (err: unknown) {
                                console.error('Connect error:', err);
                                const errorMessage = err instanceof Error ? err.message : String(err);
                                setError(
                                  errorMessage?.includes('User rejected') || 
                                  errorMessage?.includes('user rejected')
                                    ? 'ウォレットでの接続要求が拒否されました。再度お試しください。'
                                    : 'ウォレット接続中にエラーが発生しました。'
                                );
                              }
                            }}
                            disabled={isConnecting || isRetrying}
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                          >
                            {isConnecting || isRetrying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                接続中...
                              </>
                            ) : (
                              <>
                                <Wallet className="h-4 w-4" />
                                ウォレット接続
                              </>
                            )}
                          </button>

                          {(isConnecting) && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <p>• ウォレットアプリで接続を承認してください</p>
                              <p>• QRコードをスキャンするか、ディープリンクをタップしてください</p>
                              <p>• Trust Wallet: アカウント作成後に再試行してください</p>
                              <p>• HashPort Wallet: アプリが開いたら承認ボタンをタップ</p>
                              <p>• 接続に時間がかかる場合があります（最大60秒）</p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (chain?.unsupported) {
                      return (
                        <div className="space-y-2">
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                サポートされていないネットワークです
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            ネットワークを切り替え
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center justify-center">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          isSessionHealthy 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
                        }`}>
                          {isSessionHealthy ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {isSessionHealthy ? '接続済み' : 'セッション不安定'}
                          </span>
                          {!isSessionHealthy && (
                            <button
                              onClick={handleRetry}
                              disabled={isRetrying}
                              className="ml-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                              title="再接続"
                            >
                              {isRetrying ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mt-3">
            <p>• Sepolia / Polygon Amoy / Polygon 対応</p>
            <p>• ウォレットのネットワーク設定を優先</p>
            <p>• MetaMask / Trust Wallet / Coinbase Wallet / HashPort Wallet 対応</p>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={async () => {
                  try {
                    if (typeof window !== 'undefined' && window.ethereum) {
                      await window.ethereum.request({ method: 'eth_requestAccounts' });
                    } else {
                      window.open('https://metamask.io/download/', '_blank');
                    }
                  } catch (error) {
                    console.error('Failed to connect MetaMask:', error);
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-xs font-medium transition-colors"
              >
                🦊 MetaMaskをダウンロード
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.open('https://trustwallet.com/', '_blank')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  🛡️ Trust Wallet
                </button>
                <button
                  onClick={() => window.open('https://www.hashport.network/', '_blank')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  ⚡ HashPort Wallet
                </button>
              </div>
              
              {connectionAttempts >= 3 && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-xs font-medium transition-colors"
                >
                  🔄 ページを更新
                </button>
              )}
            </div>
            <WalletTroubleshootingGuide />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
