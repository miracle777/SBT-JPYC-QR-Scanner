'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { QRScannerComponent } from '@/components/QRScannerSimple';
import { WalletConnector } from '@/components/WalletConnector';
import { SBTDisplay } from '@/components/SBTDisplay';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  const { isConnected, address } = useAccount();
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleScanResult = (data: string) => {
    console.log('Scanned data:', data);
    setScannedData(data);
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
          <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              🎖️ 保有SBT
            </h2>
            <SBTDisplay userAddress={address} compact={true} />
          </div>
        )}

        {isConnected && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📸 QRコードをスキャン
            </h2>
            <QRScannerComponent onScanResult={handleScanResult} />
            
            {scannedData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">スキャン成功!</p>
                <p className="text-xs font-mono text-green-700 break-all">{scannedData}</p>
              </div>
            )}
          </div>
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
              <span><strong>マルチチェーン対応:</strong> Ethereum、Polygon、Arbitrumの6ネットワークをサポート</span>
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
          </div>
        </div>
      </div>
    </main>
  );
}
