/**
 * SBT バッジ表示コンポーネント
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SBT, SBTBalance } from '../types';
import { fetchUserSBTs, getSBTBadgeColor, getRankDescription, getUserVisitCount } from '../utils/sbt';
import { getNetworkDisplayName, getNetworkColor } from '../utils/network';
import { Award, Shield, Badge, RefreshCw } from 'lucide-react';
import { REGISTERED_SHOPS } from '../contracts/sbt';

interface SBTDisplayProps {
  userAddress: `0x${string}` | undefined;
  onSBTSelected?: (sbt: SBT) => void;
  compact?: boolean;
}

export function SBTDisplay({ userAddress, onSBTSelected, compact = false }: SBTDisplayProps) {
  const [sbts, setSBTs] = useState<SBT[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSBT, setSelectedSBT] = useState<string | null>(null);
  const [visitCounts, setVisitCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (userAddress) {
      loadSBTs();
      loadVisitCounts();
    }
  }, [userAddress]);

  const loadSBTs = async () => {
    if (!userAddress) return;

    try {
      setLoading(true);
      const fetchedSBTs = await fetchUserSBTs(userAddress);
      setSBTs(fetchedSBTs);
      console.log('Loaded SBTs:', fetchedSBTs);
    } catch (error) {
      console.error('Failed to load SBTs:', error);
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
        <p className="text-gray-500 mb-4">SBT がまだありません</p>
        
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
                      {sbt.issuer}
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
                  <img
                    src={sbt.imageUrl}
                    alt={sbt.name}
                    className="w-full h-32 object-cover rounded mt-2"
                  />
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
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p>
            💡 ヒント: 発行済みSBTを選択すると、このSBTに関連する特典や制限を確認できます。
          </p>
        </div>
      )}
    </div>
  );
}
