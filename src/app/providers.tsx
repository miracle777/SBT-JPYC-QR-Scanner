'use client';

import { WagmiProvider } from 'wagmi';
import { sepolia, polygon, polygonAmoy, mainnet, avalanche, avalancheFuji } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // MetaMaskエラーの場合はリトライしない
        if (error?.message?.includes('User rejected') || 
            error?.message?.includes('user rejected')) {
          return false;
        }
        // IndexedDBエラーの場合はリトライしない
        if (error?.message?.includes('IndexedDB') || 
            error?.name === 'InternalError') {
          return false;
        }
        // WalletConnect暗号化エラーの場合はリトライしない
        if (error?.message?.includes('aes/gcm') || 
            error?.message?.includes('ghash') ||
            error?.message?.includes('decrypt')) {
          return false;
        }
        // WalletConnectタイムアウトの場合は1回だけリトライ
        if (error?.message?.includes('timeout') || 
            error?.message?.includes('Timeout')) {
          return failureCount < 1;
        }
        // 接続関連エラーは2回までリトライ
        if (error?.message?.includes('connect') || 
            error?.message?.includes('network')) {
          return failureCount < 2;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // WalletConnect接続時の不要な再取得を防ぐ
      staleTime: 10 * 60 * 1000, // 10分間キャッシュを有効とする
      gcTime: 30 * 60 * 1000, // 30分間ガベージコレクションを延期
      refetchOnReconnect: 'always', // ネットワーク再接続時は常に再取得
    },
    mutations: {
      retry: (failureCount, error) => {
        // ウォレット接続関連は1回だけリトライ
        if (error?.message?.includes('User rejected') || 
            error?.message?.includes('user rejected')) {
          return false;
        }
        return failureCount < 1;
      }
    }
  },
});

const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'JPYC Payment Scanner',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '6555c7059cb6013d85148b2253053b8d',
  chains: [
    mainnet,        // Ethereum Mainnet (ChainID: 1)
    sepolia,        // Sepolia Testnet (ChainID: 11155111)  
    polygon,        // Polygon Mainnet (ChainID: 137)
    polygonAmoy,    // Polygon Amoy Testnet (ChainID: 80002)
    avalanche,      // Avalanche C-Chain (ChainID: 43114)
    avalancheFuji   // Avalanche Fuji Testnet (ChainID: 43113)
  ],
  ssr: true,
  // WalletConnect設定を強化
  walletConnectParameters: {
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '6555c7059cb6013d85148b2253053b8d',
    metadata: {
      name: 'JPYC Payment Scanner',
      description: 'SBT and JPYC payment scanner with network validation',
      url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://jpyc-pay.app',
      icons: [],
    },
    // Trust WalletとHashPort Wallet対応
    showQrModal: true,
    optionalChains: [1, 11155111, 137, 80002, 43114, 43113],
    // 接続タイムアウトを延長（PC環境での長時間接続を考慮）
    timeout: 120000, // 2分に延長
    // モバイルリンクオプション
    enableExplorer: true,
    // セッション管理の改善
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7日間のセッション維持
    reconnect: true, // 自動再接続を有効化
  },
  // SSR対応とクライアントサイドハイドレーションの改善
  syncConnectedChain: true, // チェーン同期を有効化
  // ストレージ設定（長期間の接続状態保存）
  storage: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    key: 'jpyc-wallet-state',
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;
