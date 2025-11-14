'use client';

import { SBTDisplay } from '@/src/components/SBTDisplay';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            SBT-JPYC-QR-Scanner
          </h1>
          <p className="text-gray-600">
            SBT表示とネットワーク検証機能付きJPYC決済アプリ
          </p>
        </header>

        <div className="grid gap-6">
          {/* SBT表示カード */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              🎖️ サンプルSBT表示
            </h2>
            <SBTDisplay 
              userAddress={'0x1234567890123456789012345678901234567890'}
            />
          </div>
        </div>

        {/* 機能説明 */}
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

        {/* 対応ネットワーク */}
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
