'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { QRScannerComponent } from '../components/QRScannerSimple';
import { WalletConnector } from '../components/WalletConnector';
import { SBTGallery } from '../components/SBTGallery';
import { JPYCBalance } from '../components/JPYCBalance';
import { PaymentHistoryComponent } from '../components/PaymentHistory';
import { PaymentProcessor } from '../components/PaymentProcessor';
import { ManualPayment } from '../components/ManualPayment';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  const { isConnected, address, chain } = useAccount();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  
  // デバッグ情報をコンソールに出力
  console.log('🔍 Home component state:', {
    isConnected,
    address,
    chainName: chain?.name,
    chainId: chain?.id,
  });

  const handleScanResult = (data: string) => {
    console.log('Scanned data:', data);
    setScannedData(data);
    setShowPaymentProcessor(true);
    setScannerError(null); // エラーをクリア
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
    setScannerError(error);
  };

  const handleManualPayment = (data: { address: string; amount: string; memo?: string }) => {
    // 手動入力データをQRコード形式に変換
    const qrData = JSON.stringify({
      type: 'payment',
      address: data.address,
      amount: data.amount,
      memo: data.memo,
      network: 'sepolia',
      chainId: 11155111,
    });
    setScannedData(qrData);
    setShowPaymentProcessor(true);
  };

  const handlePaymentComplete = () => {
    setScannedData(null);
    setShowPaymentProcessor(false);
    setScannerError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-3xl font-bold text-gray-800">
              SBT-JPYC-QR-Scanner
            </h1>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="ヘルプとSBTの説明"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            SBT表示とネットワーク検証機能付きJPYC決済アプリ
          </p>
        </header>

        {/* プライバシーポリシー・利用条件 - ウォレット接続前に表示 */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                📋 プライバシーポリシー・利用条件
              </h3>
              <div className="text-xs text-blue-700 space-y-2">
                <div className="bg-white p-3 rounded border">
                  <strong>🌍 位置情報の利用について</strong>
                  <p>決済を行った場所を履歴に記録するため、位置情報を使用します。この情報はお客様の決済履歴の管理にのみ使用されます。</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>💾 データの保存について</strong>
                  <p>このアプリは<span className="font-semibold text-blue-800">UIデモ</span>です。ウォレット機能はありません。すべてのデータは<span className="font-semibold text-blue-800">お客様のブラウザにローカル保存</span>され、サーバーには一切送信・保存されません。</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>🔒 セキュリティについて</strong>
                  <p>決済履歴、SBT情報、位置情報などはすべてブラウザ内で管理され、外部に送信されることはありません。ブラウザのデータを削除すると履歴も削除されます。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          {!isConnected ? (
            <WalletConnector />
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-semibold text-gray-800">接続済み</div>
                  <div className="text-xs text-gray-600 font-mono">
                    {address?.slice(0, 10)}......{address?.slice(-8)}
                  </div>
                </div>
              </div>
              <ConnectButton />
            </div>
          )}
        </div>

        {isConnected && address && (
          <>
            <JPYCBalance />
            
            <div className="mb-6">
              <SBTGallery 
                userAddress={address} 
                viewMode="grid" 
                showStats={true}
                groupByShop={true}
                enableTagFilter={true}
              />  
            </div>
          </>
        )}

        {isConnected && (
          <>
            {!showPaymentProcessor && (
              <>
                {/* スキャナーエラー表示 */}
                {scannerError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          スキャンエラー
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{scannerError}</p>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => setScannerError(null)}
                            className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                          >
                            閉じる
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    📸 QRコードをスキャン
                  </h2>
                  <QRScannerComponent onScanResult={handleScanResult} />
                </div>

                <div className="mb-6">
                  <ManualPayment onSubmit={handleManualPayment} />
                </div>
              </>
            )}

            {showPaymentProcessor && scannedData && (
              <div className="mb-6">
                <PaymentProcessor 
                  qrData={scannedData} 
                  onComplete={handlePaymentComplete}
                />
              </div>
            )}

            {address && (
              <div className="mb-6">
                <PaymentHistoryComponent />
              </div>
            )}
          </>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            📱 主な機能
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>SBT表示:</strong> あなたが保有するSoulbound Tokenを表示</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>ネットワーク検証:</strong> QRコードスキャン時に正しいネットワークか自動確認</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>マルチチェーン対応:</strong> Ethereum、Polygon、Avalancheの6ネットワークをサポート</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>PWA対応:</strong> スマートフォンにインストール可能</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🌐 対応ネットワーク
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-purple-200 rounded-lg p-3">
              <div className="font-semibold text-purple-600 text-sm">Ethereum</div>
              <div className="text-xs text-gray-600 break-words">ChainID: 1</div>
            </div>
            <div className="border border-orange-200 rounded-lg p-3">
              <div className="font-semibold text-orange-600 text-sm">Sepolia</div>
              <div className="text-xs text-gray-600 break-words">ChainID: 11155111</div>
            </div>
            <div className="border border-purple-200 rounded-lg p-3">
              <div className="font-semibold text-purple-600 text-sm">Polygon</div>
              <div className="text-xs text-gray-600 break-words">ChainID: 137</div>
            </div>
            <div className="border border-purple-200 rounded-lg p-3">
              <div className="font-semibold text-purple-400 text-sm">Polygon Amoy</div>
              <div className="text-xs text-gray-600 break-words">ChainID: 80002</div>
            </div>
            <div className="border border-red-200 rounded-lg p-3">
              <div className="font-semibold text-red-600 text-sm">Avalanche</div>
              <div className="text-xs text-gray-600 break-words">ChainID: 43114</div>
            </div>
            <div className="border border-red-200 rounded-lg p-3">
              <div className="font-semibold text-red-400 text-sm">Avalanche Fuji</div>
              <div className="text-xs text-gray-600 break-words">ChainID: 43113</div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            📮 お仕事問い合わせ先
          </h2>
          <p className="text-gray-600 mb-4">お仕事のご相談はこちらからお願いします：</p>
          <div className="space-y-3">
            <a
              href="https://x.com/masaru21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-800">X (Twitter)</div>
                <div className="text-sm text-gray-600">@masaru21</div>
              </div>
            </a>
            <a
              href="https://lit.link/itsapotamk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">リンクイット</div>
                <div className="text-sm text-gray-600">lit.link/itsapotamk</div>
              </div>
            </a>
          </div>
        </div>

        {/* 重要な注意事項と免責事項 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            ⚠️ 重要な注意事項
          </h2>
          
          <div className="space-y-4 text-sm">
            {/* PWA注意事項 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                📱 PWA（スマートフォンアプリ化）について
              </h3>
              <div className="text-blue-700">
                <p className="mb-2">
                  <strong>ウォレット接続の注意:</strong> ウェブブラウザでウォレットを接続した後、PWA（ホーム画面に追加したアプリ）を起動すると、<span className="font-semibold bg-blue-100 px-1 rounded">新規扱い</span>になりウォレットを再接続する必要があります。
                </p>
                <div className="bg-blue-100 p-2 rounded text-xs">
                  <strong>理由:</strong> PWAとウェブブラウザは異なるセッション環境のため、保存されたウォレット接続情報が共有されません。
                </div>
              </div>
            </div>

            {/* 免責事項 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                🔴 重要：免責事項
              </h3>
              <div className="text-red-700">
                <p className="mb-2">
                  <strong className="bg-red-100 px-1 rounded">このアプリはテスト版です。</strong>
                  本番環境のJPYCを誤って送金してしまった場合、<span className="font-semibold underline">開発者は一切の責任を負いません。</span>
                </p>
                <div className="bg-red-100 p-2 rounded text-xs space-y-1">
                  <div><strong>• 本番JPYC送金時の損害について一切責任を負いません</strong></div>
                  <div><strong>• 誤操作による資産損失について責任を負いません</strong></div>
                  <div><strong>• ネットワーク手数料等の損失について責任を負いません</strong></div>
                  <div><strong>• 利用は完全に自己責任でお願いします</strong></div>
                </div>
                <p className="mt-2 text-xs">
                  <strong>推奨:</strong> 必ずテストネット（Sepoliaなど）でのみご利用ください。
                </p>
              </div>
            </div>

            {/* テスト用途の説明 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🧪 このアプリの目的</h3>
              <div className="text-gray-600 text-xs space-y-1">
                <div>• SBT（ソウルバウンドトークン）表示機能のデモンストレーション</div>
                <div>• JPYC決済QRコードスキャン機能のテスト</div>
                <div>• マルチチェーン対応ネットワーク検証機能の検証</div>
                <div>• <strong>実際の商用利用を意図したものではありません</strong></div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 pb-6">
          <p>&copy; 2025 SBT-JPYC-QR-Scanner</p>
        </footer>

        {/* ヘルプモーダル */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  🎫 SBT（ソウルバウンドトークン）について
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* SBTとは */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                    <span className="mr-2">💎</span>
                    SBTとは？
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    SBT（Soulbound Token / ソウルバウンドトークン）は、<strong>譲渡不可能なデジタル証明書</strong>です。
                    通常のNFTとは異なり、取得したウォレットに永続的に結び付いており、売買や譲渡ができません。
                    これにより、<strong>個人の実績や体験を確実に証明</strong>することができます。
                  </p>
                </div>

                {/* このアプリでのSBT */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">🏪</span>
                    このアプリでのSBTコレクション
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      <strong>専用のJPYC決済アプリで発行されたSBTのみが表示されます！</strong>
                      このアプリは「SBT-JPYC-Pay」で発行されたSBTを表示する専用ビューアーです。
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">📍 対応店舗・SBT発行元</h4>
                      <div className="text-sm text-blue-700">
                        <p>• <strong>SBT JPYC Pay Demo Store</strong> - デモ・実験店舗</p>
                        <p>• <strong>Cafe JPYC</strong> - JPYCカフェ</p>
                        <p>• <strong>Tech Store JPYC</strong> - エレクトロニクス専門店</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚙️ 技術詳細</h4>
                      <div className="text-sm text-yellow-700">
                        <p>• <strong>コントラクト</strong>: 0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4</p>
                        <p>• <strong>対応ネットワーク</strong>: Sepolia テストネット・Polygon Amoy</p>
                        <p>• <strong>標準</strong>: ERC-721準拠（譲渡不可能）</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SBTの特徴 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">✨</span>
                    SBTの特徴とメリット
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">譲渡不可能</div>
                          <div className="text-sm text-gray-600">売買や譲渡ができないため、本人の実績として確実に証明</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">永続保存</div>
                          <div className="text-sm text-gray-600">ブロックチェーン上に永続的に記録される</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">透明性</div>
                          <div className="text-sm text-gray-600">取得日時や条件を公開的に検証可能</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">コレクション性</div>
                          <div className="text-sm text-gray-600">様々な店舗のSBTを集めてコレクションを作成</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 使い方 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    SBT取得と表示の手順
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4">1</div>
                      <div>
                        <div className="font-semibold">SBT-JPYC-Payアプリで決済</div>
                        <div className="text-sm text-gray-600">専用の決済アプリで対応店舗でJPYC決済を実行</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4">2</div>
                      <div>
                        <div className="font-semibold">条件達成でSBT自動発行</div>
                        <div className="text-sm text-gray-600">店舗での決済回数が条件に達するとSBTが自動発行される</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4">3</div>
                      <div>
                        <div className="font-semibold">このアプリでコレクション表示</div>
                        <div className="text-sm text-gray-600">このアプリで取得したSBTのコレクションを確認・表示</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-sm text-orange-700">
                        <strong>⚠️ 注意:</strong> このアプリは<strong>SBT表示専用</strong>です。SBTの発行は「SBT-JPYC-Pay」アプリで行われます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 技術情報 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">⚙️</span>
                    技術的詳細
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-700 mb-2">対応ネットワーク</div>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Sepolia テストネット</li>
                        <li>• Polygon Amoy テストネット</li>
                        <li>• （将来的にメインネット対応予定）</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 mb-2">標準仕様</div>
                      <ul className="space-y-1 text-gray-600">
                        <li>• ERC-721準拠</li>
                        <li>• 譲渡機能無効化（SBT）</li>
                        <li>• メタデータ標準対応</li>
                        <li>• 店舗情報埋め込み</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>コントラクトアドレス:</strong> 0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4
                    </p>
                  </div>
                </div>

                {/* 連携アプリ情報 */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-pink-800 mb-3 flex items-center">
                    <span className="mr-2">🔗</span>
                    連携アプリについて
                  </h3>
                  <p className="text-gray-700 mb-4">
                    このアプリは「SBT-JPYC-Pay」アプリと連携して動作します。SBTの発行は決済アプリで行われ、このアプリではコレクションの表示・管理を行います。
                  </p>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-purple-800 mb-2">📱 SBT-JPYC-Pay（決済アプリ）</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 店舗での JPYC 決済機能</li>
                      <li>• SBT 発行・管理機能</li>
                      <li>• 店舗登録・訪問回数カウント</li>
                      <li>• 決済履歴管理</li>
                    </ul>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>※ 現在プライベート開発中 - 完成後に公開予定</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
