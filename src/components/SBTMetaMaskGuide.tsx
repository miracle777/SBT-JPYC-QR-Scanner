/**
 * MetaMask SBT 同期ガイドコンポーネント
 */

'use client';

import React, { useState } from 'react';
import { Smartphone, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SBTMetaMaskGuideProps {
  onClose?: () => void;
}

export function SBTMetaMaskGuide({ onClose }: SBTMetaMaskGuideProps) {
  const [showFullGuide, setShowFullGuide] = useState(false);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-orange-800">MetaMask SBT同期ガイド</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
          <div>
            <span className="font-medium text-green-700">自動同期される場合</span>
            <p className="text-green-600 text-xs">同じウォレットアドレスでPC・スマホ両方でMetaMaskを使用している場合、SBTは自動的に表示されます。</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
          <div>
            <span className="font-medium text-orange-700">手動追加が必要な場合</span>
            <p className="text-orange-600 text-xs">MetaMaskでSBTが見えない場合は、「MetaMaskに手動追加」ボタンを使用してください。</p>
          </div>
        </div>

        <button
          onClick={() => setShowFullGuide(!showFullGuide)}
          className="text-blue-600 text-xs underline hover:text-blue-800"
        >
          {showFullGuide ? '詳細ガイドを隠す' : '詳細な同期手順を表示'}
        </button>

        {showFullGuide && (
          <div className="bg-white rounded p-3 space-y-2 border border-gray-200">
            <h4 className="font-semibold text-sm text-gray-800">🔧 完全な同期手順</h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <h5 className="font-medium text-gray-700">1. 自動同期を確認</h5>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>PC・スマホで同じMetaMaskウォレット（同じニーモニックフレーズ）を使用</li>
                  <li>SBTが発行されたネットワーク（Sepolia、Polygon Amoy）に接続</li>
                  <li>MetaMaskのNFTタブで確認</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-gray-700">2. 手動追加方法</h5>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>「MetaMaskに手動追加」ボタンをクリック</li>
                  <li>MetaMaskのポップアップで「Add token」を承認</li>
                  <li>NFTタブでSBTを確認</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-gray-700">3. トラブルシューティング</h5>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>正しいネットワークに接続しているか確認</li>
                  <li>MetaMaskでアカウントが同期されているか確認</li>
                  <li>ブラウザとMetaMaskアプリの両方で最新バージョンを使用</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700">
                <strong>重要:</strong> 毎回インポートする必要はありません！同じウォレットなら自動同期されます。
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}