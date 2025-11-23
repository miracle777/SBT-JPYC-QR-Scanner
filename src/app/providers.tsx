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
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // WalletConnect接続時の不要な再取得を防ぐ
      staleTime: 5 * 60 * 1000, // 5分間キャッシュを有効とする
    },
  },
});

const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'JPYC Payment Scanner',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '6555c7059cb6013d85148b2253053b8d', // 本番用実際のプロジェクトID
  chains: [
    mainnet,        // Ethereum Mainnet (ChainID: 1)
    sepolia,        // Sepolia Testnet (ChainID: 11155111)  
    polygon,        // Polygon Mainnet (ChainID: 137)
    polygonAmoy,    // Polygon Amoy Testnet (ChainID: 80002)
    avalanche,      // Avalanche C-Chain (ChainID: 43114)
    avalancheFuji   // Avalanche Fuji Testnet (ChainID: 43113)
  ],
  ssr: true,
  // WalletConnect接続設定を強化
  walletConnectOptions: {
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '6555c7059cb6013d85148b2253053b8d',
    metadata: {
      name: 'JPYC Payment Scanner',
      description: 'SBT and JPYC payment scanner with network validation',
      url: 'https://sbt-jpyc-qr-scanner.vercel.app',
      icons: ['https://sbt-jpyc-qr-scanner.vercel.app/images/icon-192x192.png']
    },
    // タイムアウト設定を延長（デフォルトは30秒）
    timeout: 60000,
    // QRモード表示時間を延長
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'light',
      themeVariables: {
        '--wcm-z-index': '99999'
      }
    }
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
