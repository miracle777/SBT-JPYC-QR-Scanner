'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, Wallet } from 'lucide-react';
import { JPYC_ADDRESSES, JPYC_ABI, formatJPYCDisplay, JPYCNetworkType } from '../contracts/jpyc';
import { getNetworkDisplayName } from '../utils/network';

interface NetworkBalance {
  network: JPYCNetworkType;
  balance: bigint | null;
  displayName: string;
  isMainnet: boolean;
  color: string;
}

const NETWORK_CONFIGS: { network: JPYCNetworkType; displayName: string; isMainnet: boolean; color: string }[] = [
  { network: 'ethereum', displayName: 'Ethereum', isMainnet: true, color: '#627EEA' },
  { network: 'sepolia', displayName: 'Sepolia (Test)', isMainnet: false, color: '#FF8C00' },
  { network: 'polygon', displayName: 'Polygon', isMainnet: true, color: '#8247E5' },
  { network: 'polygon-amoy', displayName: 'Polygon Amoy (Test)', isMainnet: false, color: '#A29EE3' },
  { network: 'avalanche', displayName: 'Avalanche', isMainnet: true, color: '#E84142' },
  { network: 'avalanche-fuji', displayName: 'Avalanche Fuji (Test)', isMainnet: false, color: '#FF6B6B' },
];

export function JPYCBalance() {
  const { address, isConnected } = useAccount();
  const [isVisible, setIsVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 各ネットワークの残高を取得するための設定
  const contracts = NETWORK_CONFIGS.map(({ network }) => ({
    address: JPYC_ADDRESSES[network],
    abi: JPYC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: getChainIdForNetwork(network),
  }));

  const { data, isLoading, refetch } = useReadContracts({
    contracts: contracts,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isConnected) {
    return null;
  }

  // 残高データを整理
  const balances: NetworkBalance[] = NETWORK_CONFIGS.map((config, index) => {
    const result = data?.[index]?.result;
    const balance = result !== undefined && typeof result === 'bigint' ? result : null;
    
    return {
      network: config.network,
      displayName: config.displayName,
      isMainnet: config.isMainnet,
      color: config.color,
      balance,
    };
  });

  // メインネットとテストネットに分ける
  const mainnetBalances = balances.filter(b => b.isMainnet);
  const testnetBalances = balances.filter(b => !b.isMainnet);

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="残高を更新"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={toggleVisibility}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            title={isVisible ? '残高を非表示' : '残高を表示'}
          >
            {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            残高を読み込み中...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* メインネット */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              メインネット
            </h3>
            <div className="space-y-2">
              {mainnetBalances.map((item) => (
                <BalanceRow
                  key={item.network}
                  network={item.displayName}
                  balance={item.balance}
                  isVisible={isVisible}
                  color={item.color}
                />
              ))}
            </div>
          </div>

          {/* テストネット */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              テストネット
            </h3>
            <div className="space-y-2">
              {testnetBalances.map((item) => (
                <BalanceRow
                  key={item.network}
                  network={item.displayName}
                  balance={item.balance}
                  isVisible={isVisible}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface BalanceRowProps {
  network: string;
  balance: bigint | null;
  isVisible: boolean;
  color: string;
}

function BalanceRow({ network, balance, isVisible, color }: BalanceRowProps) {
  const formattedBalance = balance !== null ? formatJPYCDisplay(balance) : '0.00';
  const displayValue = isVisible ? formattedBalance : '***.**';

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {network}
        </span>
      </div>
      <div className="flex items-center gap-2">
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
          JPYC
        </span>
      </div>
    </div>
  );
}

// ネットワークからChain IDを取得するヘルパー関数
function getChainIdForNetwork(network: JPYCNetworkType): number {
  const chainIds: Record<JPYCNetworkType, number> = {
    ethereum: 1,
    sepolia: 11155111,
    polygon: 137,
    'polygon-amoy': 80002,
    avalanche: 43114,
    'avalanche-fuji': 43113,
  };
  return chainIds[network];
}
