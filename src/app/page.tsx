'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { QRScannerComponent } from '../components/QRScannerSimple';
import QRScannerImproved from '../components/QRScannerImproved';
import { WalletConnector } from '../components/WalletConnector';
import { SBTGallery } from '../components/SBTGallery';
import { JPYCBalance } from '../components/JPYCBalance';
import { PaymentHistoryComponent } from '../components/PaymentHistory';
import { PaymentProcessor } from '../components/PaymentProcessor';
import { ManualPayment } from '../components/ManualPayment';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  const { isConnected, address } = useAccount();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            SBT-JPYC-QR-Scanner
          </h1>
          <p className="text-sm text-gray-600">
            SBT表示とネットワーク検証機能付きJPYC決済アプリ
          </p>
          
          {/* プライバシーポリシー・利用条件 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left">
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
        </header>

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
                groupByShop={false}
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

                <div className="mb-6">
                  <QRScannerComponent onScanResult={handleScanResult} />
                </div>
                
                {/* 従来版も選択可能にする */}
                <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    📸 QRコードをスキャン（シンプル版）
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
              <span><strong>マルチチェーン対応:</strong> Ethereum、Polygon、Arbitrum、Avalancheの8ネットワークをサポート</span>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-purple-200 rounded p-3">
              <div className="font-semibold text-purple-600">Ethereum</div>
              <div className="text-sm text-gray-600">ChainID: 1</div>
            </div>
            <div className="border border-orange-200 rounded p-3">
              <div className="font-semibold text-orange-600">Sepolia</div>
              <div className="text-sm text-gray-600">ChainID: 11155111</div>
            </div>
            <div className="border border-purple-200 rounded p-3">
              <div className="font-semibold text-purple-600">Polygon</div>
              <div className="text-sm text-gray-600">ChainID: 137</div>
            </div>
            <div className="border border-purple-200 rounded p-3">
              <div className="font-semibold text-purple-400">Polygon Amoy</div>
              <div className="text-sm text-gray-600">ChainID: 80002</div>
            </div>
            <div className="border border-blue-200 rounded p-3">
              <div className="font-semibold text-blue-600">Arbitrum One</div>
              <div className="text-sm text-gray-600">ChainID: 42161</div>
            </div>
            <div className="border border-blue-200 rounded p-3">
              <div className="font-semibold text-blue-400">Arbitrum Sepolia</div>
              <div className="text-sm text-gray-600">ChainID: 421614</div>
            </div>
            <div className="border border-red-200 rounded p-3">
              <div className="font-semibold text-red-600">Avalanche</div>
              <div className="text-sm text-gray-600">ChainID: 43114</div>
            </div>
            <div className="border border-red-200 rounded p-3">
              <div className="font-semibold text-red-400">Avalanche Fuji</div>
              <div className="text-sm text-gray-600">ChainID: 43113</div>
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

        <footer className="mt-8 text-center text-sm text-gray-500 pb-6">
          <p>&copy; 2025 SBT-JPYC-QR-Scanner</p>
        </footer>
      </div>
    </main>
  );
}
