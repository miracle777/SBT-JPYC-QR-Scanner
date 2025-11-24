/**
 * SBTギャラリー表示コンポーネント - 画像付き詳細表示
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SBT, ShopInfo, SBTStats } from '../types';
import { fetchUserSBTs, getSBTBadgeColor, getUserVisitCount } from '../utils/sbt';
import { getNetworkDisplayName, getNetworkColor } from '../utils/network';
import { 
  Award, Shield, Badge, RefreshCw, Store, Calendar, 
  Star, Gift, MapPin, ExternalLink, Filter, Grid3X3,
  List, Search, ChevronDown, TrendingUp, Users, Trophy, X
} from 'lucide-react';
import { REGISTERED_SHOPS } from '../contracts/sbt';
import { useAccount } from 'wagmi';

interface SBTGalleryProps {
  userAddress: `0x${string}` | undefined;
  viewMode?: 'grid' | 'list';
  showStats?: boolean;
  groupByShop?: boolean;
  enableTagFilter?: boolean;
  showVisitCardsInitial?: boolean;
}

export function SBTGallery({ 
  userAddress, 
  viewMode: initialViewMode = 'grid',
  showStats = true,
  groupByShop = false,
  enableTagFilter = false,
  showVisitCardsInitial = false
}: SBTGalleryProps) {
  const [sbts, setSBTs] = useState<SBT[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [selectedSBT, setSelectedSBT] = useState<SBT | null>(null);
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterShop, setFilterShop] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visitCounts, setVisitCounts] = useState<Record<number, number>>({});
  const [stats, setStats] = useState<SBTStats | null>(null);
  const [availableShops, setAvailableShops] = useState<Set<string>>(new Set());
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set());
  const [selectedShopForVisits, setSelectedShopForVisits] = useState<string>('all');
  const [showVisitCards, setShowVisitCards] = useState(showVisitCardsInitial);
  const { chain } = useAccount();

  useEffect(() => {
    if (userAddress) {
      loadSBTs();
      loadVisitCounts();
    }
  }, [userAddress]);

  useEffect(() => {
    if (sbts.length > 0) {
      calculateStats();
      updateAvailableFilters();
    }
  }, [sbts, visitCounts]);

  const updateAvailableFilters = () => {
    const shops = new Set<string>();
    const categories = new Set<string>();
    
    sbts.forEach(sbt => {
      // 店舗情報を収集
      if (sbt.shopName) {
        shops.add(sbt.shopName);
      }
      
      // カテゴリ情報を収集
      if (sbt.shopCategory) {
        categories.add(sbt.shopCategory);
      } else if (sbt.metadata?.category) {
        categories.add(sbt.metadata.category);
      }
    });
    
    setAvailableShops(shops);
    setAvailableCategories(categories);
  };

  const loadSBTs = async () => {
    if (!userAddress) return;

    try {
      setLoading(true);
      const fetchedSBTs = await fetchUserSBTs(userAddress);
      
      // SBTに店舗情報とメタデータを拡張
      const enrichedSBTs = fetchedSBTs.map(sbt => {
        // 既存のshopIdを優先、次にメタデータから、最後にwallet addressで検索
        let shopInfo = null;
        
        // 1. 既にSBTにshopIdが設定されている場合
        if (sbt.shopId) {
          shopInfo = REGISTERED_SHOPS[sbt.shopId as keyof typeof REGISTERED_SHOPS];
        }
        
        // 2. メタデータからshopIdを取得
        if (!shopInfo && sbt.metadata?.shopId) {
          shopInfo = REGISTERED_SHOPS[sbt.metadata.shopId as keyof typeof REGISTERED_SHOPS];
        }
        
        // 3. wallet addressで検索（フォールバック）
        if (!shopInfo) {
          shopInfo = Object.values(REGISTERED_SHOPS).find(shop => 
            shop.wallet === sbt.issuerAddress
          );
        }
        
        const enrichedSBT = {
          ...sbt,
          shopId: shopInfo?.id || sbt.shopId,
          shopName: shopInfo?.name || sbt.shopName || sbt.issuer,
          shopCategory: shopInfo?.category || sbt.shopCategory,
          benefits: sbt.benefits || shopInfo?.sbtTemplate?.benefits || [],
          thumbnailUrl: sbt.imageUrl,
          bannerUrl: shopInfo?.bannerUrl,
        };
        
        return enrichedSBT;
      });
      
      setSBTs(enrichedSBTs);
    } catch (error) {
      console.error('❌ SBTGallery: Failed to load SBTs:', error);
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
  };

  const calculateStats = () => {
    const sbtsByRank = sbts.reduce((acc, sbt) => {
      const rank = sbt.rank || 'bronze';
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sbtsByShop = sbts.reduce((acc, sbt) => {
      if (sbt.shopId) {
        acc[sbt.shopId] = (acc[sbt.shopId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const totalVisits = Object.values(visitCounts).reduce((sum, count) => sum + count, 0);
    const activeShops = Object.keys(sbtsByShop).length;

    setStats({
      totalSBTs: sbts.length,
      sbtsByRank: {
        bronze: sbtsByRank.bronze || 0,
        silver: sbtsByRank.silver || 0,
        gold: sbtsByRank.gold || 0,
        platinum: sbtsByRank.platinum || 0,
      },
      sbtsByShop,
      recentAchievements: sbts.slice(0, 3),
      totalVisits,
      activeShops,
    });
  };

  const filteredSBTs = sbts.filter(sbt => {
    // ランクフィルター
    if (filterRank !== 'all' && sbt.rank !== filterRank) return false;
    
    // ショップフィルター（店舗名ベース）
    if (filterShop !== 'all' && sbt.shopName !== filterShop) return false;
    
    // タグフィルター（店舗カテゴリ）
    if (enableTagFilter && filterTag !== 'all' && sbt.shopCategory !== filterTag) return false;
    
    // 検索クエリフィルター
    if (searchQuery && !sbt.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !sbt.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !sbt.shopName?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const groupedSBTs = groupByShop ? 
    filteredSBTs.reduce((acc, sbt) => {
      const shopKey = sbt.shopName || 'unknown';
      if (!acc[shopKey]) acc[shopKey] = [];
      acc[shopKey].push(sbt);
      return acc;
    }, {} as Record<string, SBT[]>) :
    { all: filteredSBTs };

  const handleSBTClick = (sbt: SBT) => {
    setSelectedSBT(sbt);
  };

  const SBTCard = ({ sbt }: { sbt: SBT }) => (
    <div
      onClick={() => handleSBTClick(sbt)}
      className={`group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
        viewMode === 'grid' 
          ? 'bg-white rounded-xl overflow-hidden shadow-md border border-gray-200' 
          : 'bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4'
      }`}
    >
      {viewMode === 'grid' ? (
        <>
          {/* ネットワークとランクバッジ */}
          <div className="flex justify-between items-center p-3 pb-2">
            <div 
              className="px-2 py-1 rounded text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: getNetworkColor(sbt.network) }}
            >
              {getNetworkDisplayName(sbt.network)}
            </div>
            {sbt.rank && (
              <div 
                className="px-2 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
              >
                {sbt.rank.toUpperCase()}
              </div>
            )}
          </div>
          
          {/* 画像部分 */}
          <div className="relative h-28 overflow-hidden bg-gray-50 mx-3 mb-3 rounded">
            {sbt.imageUrl ? (
              <img
                src={sbt.imageUrl}
                alt={sbt.name}
                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/300x200/${getSBTBadgeColor(sbt.rank)?.replace('#', '')}/FFFFFF?text=${encodeURIComponent(sbt.symbol)}`;
                }}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
              >
                {sbt.symbol}
              </div>
            )}
          </div>
          
          {/* 情報部分 */}
          <div className="p-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-800 text-sm truncate flex-1">
                {sbt.name}
              </h3>
              <Award className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" />
            </div>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {sbt.description}
            </p>
            
            {sbt.shopName && (
              <div className="flex items-center gap-1 mb-2">
                <Store className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600 truncate">
                  {sbt.shopName}
                </span>
              </div>
            )}
            
            {sbt.issuedDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {sbt.issuedDate.toLocaleDateString('ja-JP')}
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* リスト表示 */}
          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
            {sbt.imageUrl ? (
              <img
                src={sbt.imageUrl}
                alt={sbt.name}
                className="w-full h-full object-contain bg-gray-50"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/64/${getSBTBadgeColor(sbt.rank)?.replace('#', '')}/FFFFFF?text=${encodeURIComponent(sbt.symbol)}`;
                }}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
              >
                {sbt.symbol}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800">
                {sbt.name}
              </h3>
              {sbt.rank && (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-bold text-white"
                  style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
                >
                  {sbt.rank.toUpperCase()}
                </span>
              )}
              <span 
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: getNetworkColor(sbt.network) }}
              >
                {getNetworkDisplayName(sbt.network)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">
              {sbt.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {sbt.shopName && (
                  <div className="flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    <span>{sbt.shopName}</span>
                  </div>
                )}
                {sbt.issuedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{sbt.issuedDate.toLocaleDateString('ja-JP')}</span>
                  </div>
                )}
              </div>
              <Award className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (!userAddress) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>ウォレットを接続して SBT を表示します</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 - SBTに焦点を当てた表示 */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">保有SBT数</p>
                <p className="text-2xl font-bold">{stats.totalSBTs}</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">参画店舗数</p>
                <p className="text-2xl font-bold">{stats.activeShops}</p>
              </div>
              <Store className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">最高ランク</p>
                <p className="text-2xl font-bold">
                  {stats.sbtsByRank.platinum > 0 ? 'PLT' :
                   stats.sbtsByRank.gold > 0 ? 'GOLD' :
                   stats.sbtsByRank.silver > 0 ? 'SIL' : 'BRZ'}
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      )}

      {/* 店舗別来店回数カード表示 - 特定店舗選択時のみ */}
      {showVisitCards && Object.keys(visitCounts).length > 0 && selectedShopForVisits !== 'all' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="text-purple-800">{selectedShopForVisits}</span>
              </div>
              <span className="text-gray-600">のスタンプカード</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedShopForVisits('all')}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <Store className="w-3 h-3" />
                全店舗表示
              </button>
              <button
                onClick={() => setShowVisitCards(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="カードを非表示"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            {/* 選択された店舗のカードを表示 */}
            {(() => {
              // 登録済み店舗から検索
              const registeredShop = Object.values(REGISTERED_SHOPS).find(shop => shop.name === selectedShopForVisits);
              if (registeredShop) {
                const visitCount = visitCounts[registeredShop.id] || 0;
                const progressPercentage = Math.min((visitCount / registeredShop.requiredVisits) * 100, 100);
                const hasSBT = sbts.some(sbt => sbt.shopId === registeredShop.id);
                const remainingVisits = Math.max(0, registeredShop.requiredVisits - visitCount);
                
                return (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 mb-1">{registeredShop.name}</h4>
                        <p className="text-sm text-gray-600">{registeredShop.category}</p>
                        <p className="text-xs text-gray-500 mt-1">{registeredShop.description}</p>
                      </div>
                      {hasSBT && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <Trophy className="w-4 h-4" />
                          SBT取得済み
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700 font-medium">訪問回数</span>
                        <span className="font-bold text-xl text-purple-700">
                          {visitCount} / {registeredShop.requiredVisits}回
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      
                      {!hasSBT && remainingVisits > 0 && (
                        <div className="text-center p-3 bg-purple-100 rounded-lg">
                          <p className="text-base text-purple-700 font-semibold">
                            あと{remainingVisits}回でSBT獲得！
                          </p>
                        </div>
                      )}
                      
                      {hasSBT && registeredShop.sbtTemplate?.benefits && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700 font-semibold mb-2">🎁 利用可能特典:</p>
                          <ul className="text-sm text-green-600 space-y-1">
                            {registeredShop.sbtTemplate.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              
              // 実際のSBTデータから検索
              const shopSBTs = sbts.filter(sbt => sbt.shopName === selectedShopForVisits);
              if (shopSBTs.length > 0) {
                const sampleSBT = shopSBTs[0];
                
                return (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 mb-1">{selectedShopForVisits}</h4>
                        <p className="text-sm text-gray-600">{sampleSBT.shopCategory || '未分類'}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <Trophy className="w-4 h-4" />
                        SBT保有中
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700 font-medium">保有SBT</span>
                        <span className="font-bold text-xl text-blue-700">
                          {shopSBTs.length}個
                        </span>
                      </div>
                      
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full w-full"></div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-semibold mb-2">🏪 この店舗のSBT:</p>
                        <ul className="text-sm text-blue-600 space-y-2">
                          {shopSBTs.slice(0, 5).map((sbt, index) => (
                            <li key={index} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                <span>{sbt.name}</span>
                              </div>
                              {sbt.rank && (
                                <span className="text-xs font-bold bg-blue-100 px-2 py-1 rounded">
                                  {sbt.rank.toUpperCase()}
                                </span>
                              )}
                            </li>
                          ))}
                          {shopSBTs.length > 5 && (
                            <li className="text-xs text-blue-500 text-center pt-2 border-t border-blue-200">
                              ...他{shopSBTs.length - 5}個のSBT
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return null;
            })()
            }
          </div>
        </div>
      )}

      {/* コントロール */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            SBT コレクション ({filteredSBTs.length})
            {chain && (
              <span className="text-sm font-normal text-gray-600">
                - {chain.name}
              </span>
            )}
          </h2>
          
          <button
            onClick={loadSBTs}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            更新
          </button>
        </div>
        
        {/* 表示切り替えとフィルター */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* ランクフィルター */}
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全ランク</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
          
          {/* ショップフィルター */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
            <Store className="w-4 h-4 text-gray-600" />
            <label className="text-sm text-gray-700 font-medium">店舗:</label>
            <select
              value={filterShop}
              onChange={(e) => setFilterShop(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="all">全店舗表示</option>
              {Array.from(availableShops).sort().map(shopName => (
                <option key={shopName} value={shopName}>
                  {shopName}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (filterShop !== 'all') {
                  setSelectedShopForVisits(filterShop);
                  setShowVisitCards(true);
                }
              }}
              disabled={filterShop === 'all'}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
              title="選択した店舗の詳細なスタンプカード情報を表示"
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">スタンプカード</span>
            </button>
          </div>

          {/* タグフィルター（カテゴリ） */}
          {enableTagFilter && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全カテゴリ</option>
              {Array.from(availableCategories).sort().map(category => {
                // カテゴリに応じたアイコンを動的に生成
                const getIcon = (cat: string) => {
                  if (cat.includes('デモ') || cat.includes('実験')) return '🧪';
                  if (cat.includes('カフェ') || cat.includes('飲食') || cat.includes('レストラン')) return '☕';
                  if (cat.includes('エレクトロニクス') || cat.includes('テック') || cat.includes('技術')) return '⚡';
                  if (cat.includes('ショッピング') || cat.includes('小売')) return '🛍️';
                  if (cat.includes('エンターテイメント') || cat.includes('娯楽')) return '🎭';
                  return '🏪';
                };
                
                return (
                  <option key={category} value={category}>
                    {getIcon(category)} {category}
                  </option>
                );
              })}
            </select>
          )}
          
          {/* 表示モード切り替え */}
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SBT表示 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">SBT を読み込み中...</span>
        </div>
      ) : filteredSBTs.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 mb-4 opacity-50 text-gray-400" />
          <p className="text-gray-500 mb-4">
            {sbts.length === 0 ? 'SBT がまだありません' : 'フィルター条件に一致するSBTがありません'}
          </p>
          {searchQuery || filterRank !== 'all' || filterShop !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRank('all');
                setFilterShop('all');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              フィルターをクリア
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSBTs).map(([groupKey, groupSBTs]) => (
            <div key={groupKey}>
              {groupByShop && groupKey !== 'all' && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    {groupKey}
                    <span className="text-sm text-gray-500">({groupSBTs.length})</span>
                  </h3>
                </div>
              )}
              
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-3'
              }>
                {groupSBTs.map((sbt) => (
                  <SBTCard key={sbt.id} sbt={sbt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SBT詳細モーダル */}
      {selectedSBT && (
        <SBTDetailModal 
          sbt={selectedSBT} 
          onClose={() => setSelectedSBT(null)}
          visitCount={selectedSBT.shopId ? visitCounts[selectedSBT.shopId] : undefined}
        />
      )}
    </div>
  );
}

// SBT詳細モーダルコンポーネント
function SBTDetailModal({ 
  sbt, 
  onClose, 
  visitCount 
}: { 
  sbt: SBT; 
  onClose: () => void;
  visitCount?: number;
}) {
  const shopInfo = sbt.shopId ? REGISTERED_SHOPS[sbt.shopId as keyof typeof REGISTERED_SHOPS] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー画像 */}
        <div className="relative h-48 overflow-hidden">
          {sbt.bannerUrl || sbt.imageUrl ? (
            <img
              src={sbt.bannerUrl || sbt.imageUrl}
              alt={sbt.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
            >
              <div className="text-white text-4xl font-bold">
                {sbt.symbol}
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
          >
            ×
          </button>
          
          {sbt.rank && (
            <div 
              className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: getSBTBadgeColor(sbt.rank) }}
            >
              {sbt.rank.toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          {/* 基本情報 */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {sbt.name}
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              {sbt.description}
            </p>
            {sbt.shopName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Store className="w-4 h-4" />
                <span>{sbt.shopName}</span>
                {sbt.shopCategory && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {sbt.shopCategory}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* 特典情報 */}
          {sbt.benefits && sbt.benefits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                特典・メリット
              </h3>
              <ul className="space-y-1">
                {sbt.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 訪問情報 */}
          {shopInfo && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">訪問情報</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">現在の訪問回数</span>
                  <span className="font-semibold">{visitCount || 0}回</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SBT獲得必要回数</span>
                  <span className="font-semibold">{shopInfo.requiredVisits}回</span>
                </div>
                {visitCount !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((visitCount / shopInfo.requiredVisits) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 技術情報 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">技術情報</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ネットワーク</span>
                <span 
                  className="px-2 py-0.5 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: getNetworkColor(sbt.network) }}
                >
                  {getNetworkDisplayName(sbt.network)}
                </span>
              </div>
              {sbt.tokenId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Token ID</span>
                  <span className="font-mono text-xs">{sbt.tokenId.toString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">コントラクト</span>
                <span className="font-mono text-xs truncate ml-2">
                  {sbt.address.slice(0, 10)}...{sbt.address.slice(-8)}
                </span>
              </div>
              {sbt.issuedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">発行日</span>
                  <span className="text-xs">
                    {sbt.issuedDate.toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}