'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SBTGallery } from '../../components/SBTGallery';
import { HamburgerMenu } from '../../components/HamburgerMenu';
import { CheckCircle, Award } from 'lucide-react';

export default function SBTGalleryPage() {
  const { isConnected, address } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-shrink-0">
              <HamburgerMenu />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 text-center flex-1 flex items-center justify-center gap-2">
              <Award className="w-8 h-8 text-purple-600" />
              SBTコレクション
            </h1>
            <div className="flex-shrink-0 w-10"></div> {/* スペーサー */}
          </div>
          <p className="text-sm text-gray-600 text-center">
            あなたが取得したSoulbound Tokenのコレクション
          </p>
        </header>

        {/* ウォレット接続状態 */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                SBTコレクションを表示するにはウォレットを接続してください
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800">接続済み</div>
                  <div className="text-xs text-gray-600 font-mono truncate">
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <ConnectButton />
              </div>
            </div>
          )}
        </div>

        {/* SBTギャラリー */}
        {isConnected && address && (
          <div className="mb-6">
            <SBTGallery 
              userAddress={address} 
              viewMode="grid" 
              showStats={true}
              groupByShop={true}
              enableTagFilter={true}
              showVisitCardsInitial={true}
            />  
          </div>
        )}

        {/* SBTについての説明 */}
        {isConnected && (
          <>
            {/* SBTコントラクト情報 */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-purple-800 flex items-center">
                <span className="mr-2">📄</span>
                SBTコントラクト情報
              </h2>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-700 mb-3">Sepolia Testnet</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 font-medium min-w-[120px]">コントラクト:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs break-all">
                        0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4
                      </code>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium min-w-[120px]">チェーンID:</span>
                      <span className="text-gray-800">11155111</span>
                    </div>
                    <div className="flex items-center">
                      <a
                        href="https://sepolia.etherscan.io/address/0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        📊 Sepolia Etherscanで確認
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-700 mb-3">Polygon Amoy Testnet</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 font-medium min-w-[120px]">コントラクト:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs break-all">
                        0x6b39d1F8a9799aB3E1Ea047052e831186106DD8E
                      </code>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium min-w-[120px]">チェーンID:</span>
                      <span className="text-gray-800">80002</span>
                    </div>
                    <div className="flex items-center">
                      <a
                        href="https://amoy.polygonscan.com/address/0x6b39d1F8a9799aB3E1Ea047052e831186106DD8E"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        📊 Polygon Amoy Explorerで確認
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ 注意:</strong> これらはテストネット用のコントラクトです。本番環境では使用しないでください。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                🎫 SBT（ソウルバウンドトークン）とは
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  SBT（Soulbound Token）は、<strong>譲渡不可能なデジタル証明書</strong>です。
                  通常のNFTとは異なり、取得したウォレットに永続的に結び付いており、売買や譲渡ができません。
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">✨ 主な特徴</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• 譲渡不可能（売買できない）</li>
                      <li>• ブロックチェーン上に永続保存</li>
                      <li>• 個人の実績や体験を証明</li>
                      <li>• コレクション性が高い</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🎁 メリット</h3>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• 店舗での特典・割引が受けられる</li>
                      <li>• 来店履歴を証明できる</li>
                      <li>• ロイヤルカスタマーとして認識</li>
                      <li>• 限定イベントへの参加権</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
