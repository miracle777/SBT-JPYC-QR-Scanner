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
      staleTime: 5 * 60 * 1000, // 5分間キャッシュを有効とする
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
      icons: ['https://jpyc-pay.app/images/icon-192x192.png'],
    },
    // Trust WalletとHashPort Wallet対応
    showQrModal: true,
    optionalChains: [1, 11155111, 137, 80002, 43114, 43113],
    // 接続タイムアウトを延長
    timeout: 60000,
    // モバイルリンクオプション
    enableExplorer: true
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
