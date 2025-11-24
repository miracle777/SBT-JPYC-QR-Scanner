'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// ProvidersをSSRなしでdynamic importする
const Providers = dynamic(() => import('../app/providers').then(mod => ({ default: mod.Providers })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
});

// WalletSessionManagerをdynamic importする
const WalletSessionManager = dynamic(() => import('./WalletSessionManager').then(mod => ({ default: mod.WalletSessionManager })), {
  ssr: false
});

// WalletErrorBoundaryをdynamic importする
const WalletErrorBoundary = dynamic(() => import('./WalletErrorBoundary').then(mod => ({ default: mod.WalletErrorBoundary })), {
  ssr: false,
  loading: () => null
});

interface ProvidersWrapperProps {
  children: ReactNode;
}

export function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return (
    <WalletErrorBoundary>
      <Providers>
        <WalletSessionManager>
          {children}
        </WalletSessionManager>
      </Providers>
    </WalletErrorBoundary>
  );
}