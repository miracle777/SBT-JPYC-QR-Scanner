'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, Wallet, AlertCircle } from 'lucide-react';
import { JPYC_ADDRESSES, JPYC_ABI, formatJPYCDisplay, JPYCNetworkType, getTokenInfo } from '../contracts/jpyc';

interface NetworkBalance {
  network: JPYCNetworkType;
  balance: bigint | null;
  displayName: string;
  isMainnet: boolean;
  color: string;
}

const NETWORK_CONFIGS: { network: JPYCNetworkType; displayName: string; isMainnet: boolean; color: string; chainId: number }[] = [
  { network: 'ethereum', displayName: 'Ethereum Mainnet (JPYC)', isMainnet: true, color: '#627EEA', chainId: 1 },
  { network: 'sepolia', displayName: 'Sepolia - Official (100 JPYC)', isMainnet: false, color: '#FF8C00', chainId: 11155111 },
  { network: 'sepolia-community', displayName: 'Sepolia - Community (882 JPYC)', isMainnet: false, color: '#FFA500', chainId: 11155111 },
  { network: 'sepolia-additional', displayName: 'Sepolia - Additional (0 JPYC)', isMainnet: false, color: '#FFD700', chainId: 11155111 },
  { network: 'polygon', displayName: 'Polygon Mainnet (JPYC)', isMainnet: true, color: '#8247E5', chainId: 137 },
  { network: 'polygon-amoy', displayName: 'Polygon Amoy (JPYC)', isMainnet: false, color: '#A29EE3', chainId: 80002 },
  { network: 'polygon-amoy-custom', displayName: 'Polygon Amoy (Custom tJPYC)', isMainnet: false, color: '#B19EE3', chainId: 80002 },
  { network: 'avalanche', displayName: 'Avalanche C-Chain (JPYC)', isMainnet: true, color: '#E84142', chainId: 43114 },
  { network: 'avalanche-fuji', displayName: 'Avalanche Fuji (JPYC)', isMainnet: false, color: '#FF6B6B', chainId: 43113 },
  { network: 'avalanche-fuji-custom', displayName: 'Avalanche Fuji (Custom tJPYC)', isMainnet: false, color: '#FF8B8B', chainId: 43113 },
];

export function JPYCBalance() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isConnected) {
    return null;
  }

  // 現在のチェーンIDに基づいて、表示可能なネットワークを取得
  const availableNetworks = NETWORK_CONFIGS.filter(config => config.chainId === chainId);
  
  // 現在のネットワーク名を取得
  const currentNetworkName = availableNetworks.length > 0 
    ? availableNetworks[0].displayName.split(' - ')[0]
    : `Chain ${chainId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            JPYC 残高
          </h2>
        </div>
        <button
          onClick={toggleVisibility}
          className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          title={isVisible ? '残高を非表示' : '残高を表示'}
        >
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>

      {availableNetworks.length === 0 ? (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              未対応のネットワーク
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              現在のネットワーク ({currentNetworkName}) ではJPYC残高を表示できません
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {availableNetworks.map((config) => (
            <JPYCBalanceRow
              key={config.network}
              network={config.network}
              displayName={config.displayName}
              color={config.color}
              isVisible={isVisible}
              userAddress={address!}
            />
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 ヒント: 他のネットワークの残高を確認するには、ウォレットでネットワークを切り替えてください
        </p>
      </div>
    </motion.div>
  );
}

interface JPYCBalanceRowProps {
  network: JPYCNetworkType;
  displayName: string;
  color: string;
  isVisible: boolean;
  userAddress: `0x${string}`;
}

function JPYCBalanceRow({ network, displayName, color, isVisible, userAddress }: JPYCBalanceRowProps) {
  const contractAddress = JPYC_ADDRESSES[network];
  const tokenInfo = getTokenInfo(network);
  
  const { data: balance, isLoading, refetch, error } = useReadContract({
    address: contractAddress,
    abi: JPYC_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      retry: 2,
      retryDelay: 1000,
    }
  });

  const { data: decimals } = useReadContract({
    address: contractAddress,
    abi: JPYC_ABI,
    functionName: 'decimals',
    query: {
      retry: 2,
      retryDelay: 1000,
    }
  });

  // デバッグ用ログ
  console.log(`[${displayName}]`, {
    contractAddress,
    balance: balance ? balance.toString() : 'null/undefined',
    balanceType: typeof balance,
    decimals: decimals ? Number(decimals) : 'loading',
    isLoading,
    error: error ? error.message : 'no error',
    tokenInfo,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Balance refresh error:', err);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const actualDecimals = decimals ? Number(decimals) : tokenInfo.decimals;
  const formattedBalance = balance ? formatJPYCDisplay(balance as bigint, actualDecimals) : '0.00';

  // エラーハンドリングの改善
  if (error) {
    return (
      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div>
            <p className="font-medium text-red-800">{displayName}</p>
            <p className="text-xs text-red-600">コントラクトエラー: 残高取得に失敗</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 text-red-600 hover:text-red-800 transition-colors"
          title="再試行"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }
  const displayValue = isVisible ? formattedBalance : '***.**';

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-400 font-mono truncate">
            ({contractAddress.slice(0, 6)}...{contractAddress.slice(-4)})
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.span
                key={isVisible ? 'visible' : 'hidden'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-semibold text-gray-900 dark:text-white font-mono"
              >
                {displayValue}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tokenInfo.symbol}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              title="更新"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
