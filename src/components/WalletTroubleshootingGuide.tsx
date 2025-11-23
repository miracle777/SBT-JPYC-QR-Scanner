'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, AlertTriangle } from 'lucide-react';

export function WalletTroubleshootingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const troubleshootingSteps = [
    {
      wallet: 'HashPort Wallet',
      emoji: '⚡',
      issues: [
        {
          problem: 'URL接続方法（推奨）',
          isRecommended: true,
          solutions: [
            '🎯 HashPortアプリを開く',
            '📱 アプリのURL欄に「https://jpyc-pay.app」を入力',
            '✅ アプリ内ブラウザでサイトが開きます',
            '🔗 「ウォレット接続」ボタンをタップして接続完了',
            '💡 この方法が最も確実に接続できます（成功率95%以上）',
          ]
        },
        {
          problem: 'WalletConnect経由で接続できない',
          solutions: [
            'HashPortアプリで承認ボタンが表示されるまで2-3秒待機',
            'アプリ内で「Accept」または「承認」をタップ',
            'アプリのバックグラウンド実行を許可',
            'デバイスの省電力モードを無効化',
            '上記のURL接続方法を代替手段として利用',
          ]
        }
      ]
    },
    {
      wallet: 'Trust Wallet',
      emoji: '🛡️',
      issues: [
        {
          problem: '「アカウントが無い」エラーの真の原因',
          isImportant: true,
          solutions: [
            '⚠️ 主な原因：JPYCトークンのコントラクトアドレスが未追加',
            '📱 Trust Walletの「設定」→「トークンを管理」を開く',
            '➕ 「カスタムトークンを追加」を選択',
            '🔗 Polygonネットワーク: 0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
            '🧪 Sepolia（公式）: 0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29',
            '🧪 Sepolia（Faucet用）: 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB',
          ]
        },
        {
          problem: '接続表示の問題（UI上の問題）',
          solutions: [
            '実際は接続されていることが多いです',
            '💡 解決方法：ページを再読み込み（F5キー）してください',
            'ウォレットアドレスが正常に表示されることを確認',
            '接続状態の検出タイミング問題が原因です',
          ]
        }
      ]
    },
    {
      wallet: 'MetaMask',
      emoji: '🦊',
      issues: [
        {
          problem: 'PC・スマートフォン両対応',
          solutions: [
            '💻 PC：ブラウザ拡張機能で簡単接続',
            '📱 スマートフォン：MetaMaskアプリで接続',
            '🌐 WalletConnect経由でQRコード読み取り',
            '✅ 最も安定した接続方法です',
          ]
        }
      ]
    }
  ];

  const faqItems = [
    {
      category: '🪙 トークンについて',
      items: [
        {
          question: 'tJPYCとは何ですか？',
          answer: 'tJPYC（テストJPYC）は、開発者が作成したカスタムテストトークンです。本物のJPYCではありません。',
          isWarning: true
        },
        {
          question: 'tJPYCは誰でも使えますか？',
          answer: '❌ いいえ。tJPYCは開発者専用です。デプロイの関係で、作成者以外は使用できません。一般ユーザーは公式JPYCをご利用ください。',
          isWarning: true
        },
        {
          question: '公式JPYCのコントラクトアドレスは？',
          answer: '✅ 全ネットワーク共通：0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29\n（Ethereum、Polygon、Avalanche C-Chain）'
        }
      ]
    },
    {
      category: '🔗 接続方法',
      items: [
        {
          question: 'どのウォレットが推奨ですか？',
          answer: '1. MetaMask（PC・モバイル）⭐⭐⭐\n2. Trust Wallet（モバイル）⭐⭐⭐\n3. HashPort Wallet（モバイル）⭐⭐\n4. Coinbase Wallet（モバイル）⭐⭐'
        },
        {
          question: 'HashPort WalletでWalletConnectがうまくいかない場合は？',
          answer: '💡 URL接続方法をお試しください：\n1. HashPortアプリを開く\n2. URL欄に「https://jpyc-pay.app」を入力\n3. アプリ内ブラウザで接続\n\nこの方法が最も確実です（成功率95%以上）'
        }
      ]
    },
    {
      category: '🌐 ネットワーク',
      items: [
        {
          question: '対応しているネットワークは？',
          answer: '✅ メインネット：Ethereum、Polygon、Avalanche C-Chain\n🧪 テストネット：Sepolia、Polygon Amoy、Avalanche Fuji'
        },
        {
          question: 'Sepoliaテストネットで複数のアドレスがあるのはなぜ？',
          answer: 'Faucetの都合で複数存在します：\n• 公式：0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29\n• Faucet用：0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'
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
        FAQ・ウォレット接続のトラブルシューティング
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
                  ウォレット接続 FAQ・トラブルシューティング
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* FAQ Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">❓</span>
                    よくある質問（FAQ）
                  </h3>
                  
                  <div className="space-y-4">
                    {faqItems.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-base">
                          {category.category}
                        </h4>
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className={`p-3 rounded-lg border-l-4 ${
                              item.isWarning 
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-blue-400'
                            }`}>
                              <div className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                                {item.isWarning && '⚠️ '}
                                {item.question}
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {item.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Troubleshooting Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔧</span>
                    ウォレット別トラブルシューティング
                  </h3>
                {troubleshootingSteps.map((wallet, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">{wallet.emoji}</span>
                      {wallet.wallet}
                    </h3>
                    
                    <div className="space-y-4">
                      {wallet.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className={`rounded-lg p-3 ${
                          issue.isRecommended 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'isImportant' in issue
                            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}>
                          <div className="flex items-start gap-2 mb-2">
                            {issue.isRecommended && (
                              <span className="text-green-500 mt-0.5 flex-shrink-0 text-lg">🎯</span>
                            )}
                            {'isImportant' in issue && (
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            )}
                            {!issue.isRecommended && !('isImportant' in issue) && (
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            )}
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {issue.isRecommended && '✨ '}
                              {'isImportant' in issue && '⚠️ '}
                              {issue.problem}
                            </h4>
                          </div>
                          <div className="ml-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {issue.isRecommended ? '手順:' : '対処法:'}
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
                </div>

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