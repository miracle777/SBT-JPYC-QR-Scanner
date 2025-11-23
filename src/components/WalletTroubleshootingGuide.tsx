'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ExternalLink, AlertTriangle } from 'lucide-react';

export function WalletTroubleshootingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const troubleshootingSteps = [
    {
      wallet: 'Trust Wallet',
      emoji: '🛡️',
      issues: [
        {
          problem: 'アカウントが無いと表示される',
          solutions: [
            'Trust Walletアプリでアカウント（ウォレット）を作成してください',
            'シードフレーズを安全に保存してアカウント作成を完了',
            'アカウント作成後に再度接続を試してください',
          ]
        },
        {
          problem: '接続中のまま進まない',
          solutions: [
            'Trust Walletアプリを完全に閉じて再起動',
            'ウォレット接続画面で「承認」ボタンをタップ',
            'ネットワーク設定を確認（Ethereum、Polygon、Avalanche）',
            '数分待ってから再度試してください',
          ]
        }
      ]
    },
    {
      wallet: 'HashPort Wallet',
      emoji: '⚡',
      issues: [
        {
          problem: 'アプリが開くが接続できない',
          solutions: [
            'HashPortアプリで承認ボタンが表示されるまで待機',
            'アプリ内で「接続を承認」または「Accept」をタップ',
            'Hedera Hashgraph/Ethereum互換設定を確認',
            'アプリを最新版に更新してください',
          ]
        },
        {
          problem: '接続が途中で切れる',
          solutions: [
            'HashPortアプリのバックグラウンド実行を許可',
            'デバイスの省電力モードを無効化',
            'アプリの権限設定を確認',
            'WiFi/モバイルデータの接続を確認',
          ]
        }
      ]
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors mt-2"
      >
        <HelpCircle className="h-4 w-4" />
        ウォレット接続のトラブルシューティング
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  ウォレット接続トラブルシューティング
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {troubleshootingSteps.map((wallet, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">{wallet.emoji}</span>
                      {wallet.wallet}
                    </h3>
                    
                    <div className="space-y-4">
                      {wallet.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {issue.problem}
                            </h4>
                          </div>
                          <div className="ml-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              対処法:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                              {issue.solutions.map((solution, solutionIndex) => (
                                <li key={solutionIndex} className="leading-relaxed">
                                  {solution}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    💡 一般的な解決方法
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• ウォレットアプリを最新版に更新</li>
                    <li>• デバイスの再起動</li>
                    <li>• ブラウザのキャッシュをクリア</li>
                    <li>• 別のネットワーク（WiFi ↔ モバイルデータ）で試す</li>
                    <li>• しばらく時間を置いてから再試行</li>
                  </ul>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}