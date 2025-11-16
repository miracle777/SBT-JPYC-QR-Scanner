/**
 * SBT バッジ表示コンポーネント
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SBT, SBTBalance } from '../types';
import { fetchUserSBTs, getSBTBadgeColor, getRankDescription, getUserVisitCount } from '../utils/sbt';
import { getNetworkDisplayName, getNetworkColor } from '../utils/network';
import { Award, Shield, Badge, RefreshCw, ExternalLink, Smartphone } from 'lucide-react';
import { SBTMetaMaskGuide } from './SBTMetaMaskGuide';
import { SBTSyncChecker } from './SBTSyncChecker';
import { REGISTERED_SHOPS } from '../contracts/sbt';
import { useAccount } from 'wagmi';

interface SBTDisplayProps {
  userAddress: `0x${string}` | undefined;
  onSBTSelected?: (sbt: SBT) => void;
  compact?: boolean;
}

export function SBTDisplay({ userAddress, onSBTSelected, compact = false }: SBTDisplayProps) {
  const [sbts, setSBTs] = useState<SBT[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSBT, setSelectedSBT] = useState<string | null>(null);
  const [visitCounts, setVisitCounts] = useState<Record<number, number>>({}>;
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState(true);
  const { chain } = useAccount();

  useEffect(() => {
    if (userAddress) {
      console.log('🔄 SBTDisplay useEffect triggered:', {
        userAddress,
        chainName: chain?.name,
        chainId: chain?.id
      });
      loadSBTs();
      loadVisitCounts();
    } else {
      console.log('⚠️ SBTDisplay: No user address provided');
    }
  }, [userAddress, chain?.id]); // chain?.idも依存配列に追加

  const loadSBTs = async () => {
    if (!userAddress) return;

    try {
      setLoading(true);
      console.log('🔍 SBTDisplay: Loading SBTs for address:', userAddress);
      console.log('📡 Current network:', chain?.name, 'Chain ID:', chain?.id);
      const fetchedSBTs = await fetchUserSBTs(userAddress);
      setSBTs(fetchedSBTs);
      
      console.log('📊 SBTDisplay: Loaded SBTs count:', fetchedSBTs.length);
      fetchedSBTs.forEach((sbt, index) => {
        console.log(`🏪 SBT ${index + 1}:`, {
          name: sbt.name,
          shopName: sbt.shopName,
          shopId: sbt.shopId,
          issuer: sbt.issuer,
          category: sbt.shopCategory,
          network: sbt.network,
          chainId: sbt.chainId,
          metadata: sbt.metadata ? 'Present' : 'Missing'
        });
      });
    } catch (error) {
      console.error('❌ SBTDisplay: Failed to load SBTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVisitCounts = async () => {
    if (!userAddress) return;

    const counts: Record<number, number> = {};
    for (const shopId of Object.keys(REGISTERED_SHOPS)) {
      const count = await getUserVisitCount(userAddress, Number(shopId));
      counts[Number(shopId)] = count;
    }
    setVisitCounts(counts);
    console.log('Visit counts:', counts);
  };

  const handleAddToMetaMask = async (sbt: SBT) => {
    try {
      if (typeof window.ethereum !== 'undefined' && (window.ethereum as any).request) {
        // MetaMaskにSBTを追加 - TypeScript型チェックを完全に回避
        await (window.ethereum as any).request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC721',
            options: {
              address: sbt.address,
              tokenId: sbt.tokenId?.toString() || '0',
            },
          },
        });
        
        console.log('SBT added to MetaMask successfully');
        alert(`✅ SBT「${sbt.name}」をMetaMaskに追加しました！\n\nMetaMaskのNFTタブで確認してください。`);
        
        // 追加のヒントを表示
        setTimeout(() => {
          alert(`💡 ヒント：\n• PC・スマホで同じMetaMaskアカウントを使用していれば自動同期されます\n• 画像が表示されない場合は、ネットワーク接続を確認してください\n• ${sbt.network === 'sepolia' ? 'Sepolia' : 'Polygon Amoy'} テストネットに接続していることを確認してください`);
        }, 2000);
      } else {
        console.error('MetaMask not detected');
        alert('MetaMask が見つかりません。MetaMask をインストールしてください。');
      }
    } catch (error) {
      console.error('Failed to add SBT to MetaMask:', error);
      alert('MetaMask への追加に失敗しました。既に追加されている可能性があります。');
    }
  };

  const handleSBTClick = (sbt: SBT) => {
    setSelectedSBT(sbt.id);
    onSBTSelected?.(sbt);
  };

  if (!userAddress) {
    return (
      <div className="text-center text-gray-500 py-4">
        ウォレットを接続して SBT を表示します
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">SBT を読み込み中...</span>
      </div>
    );
  }

  if (sbts.length === 0) {
    return (
      <div className="text-center py-6">
        <Shield className="mx-auto h-8 w-8 mb-2 opacity-50 text-gray-400" />
        <p className="text-gray-500 mb-4">
          {chain ? 
            `${chain.name} で発行されたSBTがまだありません` : 
            'SBT がまだありません'
          }
        </p>
        {chain && (
          <div className="text-xs text-gray-600 mb-4">
            <p>現在のネットワーク: {chain.name}</p>
            <p>Chain ID: {chain.id}</p>
          </div>
        )}
        
        {/* 訪問回数表示 */}
        {Object.keys(visitCounts).length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 font-semibold">📍 訪問回数</p>
            {Object.entries(REGISTERED_SHOPS).map(([shopId, shop]) => (
              <div key={shopId} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                {shop.name}: {visitCounts[Number(shopId)] || 0}回
                {visitCounts[Number(shopId)] > 0 && (
                  <span className="ml-2 text-blue-600">
                    (あと{Math.max(0, 3 - (visitCounts[Number(shopId)] || 0))}回でSBT獲得!)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {sbts.map((sbt) => (
          <div
            key={sbt.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
            title={sbt.description}
          >
            <Award className="w-3 h-3" />
            {sbt.symbol}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          発行済みSBT ({sbts.length})
          {chain && (
            <span className="text-sm font-normal text-gray-600">
              - {chain.name}
            </span>
          )}
        </h3>
        <button
          onClick={() => {
            loadSBTs();
            loadVisitCounts();
          }}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1"
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          更新
        </button>
      </div>

      <div className="grid gap-3">
        {sbts.map((sbt) => (
          <div
            key={sbt.id}
            onClick={() => handleSBTClick(sbt)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedSBT === sbt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className="w-4 h-4"
                    style={{ color: getSBTBadgeColor(sbt.rank) }}
                  />
                  <h4 className="font-bold text-sm">{sbt.name}</h4>
                  {sbt.rank && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
                    >
                      {sbt.rank.toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 mb-2">{sbt.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-500">発行者: </span>
                    <span className="font-mono text-xs truncate">
                      {sbt.shopName || sbt.issuer}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">ネットワーク: </span>
                    <span
                      className="inline-block px-2 py-0.5 rounded text-white text-xs"
                      style={{ backgroundColor: getNetworkColor(sbt.network) }}
                    >
                      {getNetworkDisplayName(sbt.network)}
                    </span>
                  </div>
                </div>

                {sbt.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={sbt.imageUrl}
                      alt={sbt.name}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        console.error('Failed to load SBT image:', sbt.imageUrl);
                        // フォールバック画像を表示
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/4F46E5/FFFFFF?text=${encodeURIComponent(sbt.symbol || 'SBT')}`;
                      }}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      📱 MetaMask で同期: この SBT は自動的に MetaMask に表示されます
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToMetaMask(sbt);
                      }}
                      className="mt-2 w-full px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition flex items-center gap-1 justify-center"
                    >
                      <Smartphone className="w-3 h-3" />
                      MetaMask に手動追加
                    </button>
                    
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <div className="font-semibold text-gray-700 mb-1">🔍 同期確認情報</div>
                      <div className="space-y-1 text-gray-600">
                        <div>• ネットワーク: <span className="font-mono">{sbt.network}</span></div>
                        <div>• コントラクト: <span className="font-mono text-xs">{sbt.address}</span></div>
                        <div>• トークンID: <span className="font-mono">{sbt.tokenId?.toString()}</span></div>
                        <div>• シンボル: <span className="font-mono">{sbt.symbol}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {sbt.metadata && Object.keys(sbt.metadata).length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                <details>
                  <summary className="cursor-pointer text-gray-600">
                    メタデータを表示
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(sbt.metadata, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>

      {sbts.length > 0 && (
        <div className="space-y-3">
          <SBTSyncChecker userAddress={userAddress} />
          
          {showMetaMaskGuide && (
            <SBTMetaMaskGuide onClose={() => setShowMetaMaskGuide(false)} />
          )}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 ヒント: SBT特典の利用</p>
            <p>
              発行済みSBTを選択すると、このSBTに関連する特典や制限を確認できます。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
