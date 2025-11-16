'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle2, X } from 'lucide-react';

export function WalletConnector() {
  const { isConnected, isConnecting } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

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
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 w-full max-w-sm"
          >
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
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
                        <button
                          onClick={() => {
                            try {
                              clearError();
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
                          disabled={isConnecting}
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                          <Wallet className="h-4 w-4" />
                          {isConnecting ? '接続中...' : 'ウォレット接続'}
                        </button>
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
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">接続済み</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mt-3">
            <p>• Sepolia テストネット対応</p>
            <p>• Polygon Amoy (Chain ID: 80002) 対応</p>
            <p>• MetaMask推奨</p>
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
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-xs font-medium transition-colors"
            >
              📦 MetaMask直接接続
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
