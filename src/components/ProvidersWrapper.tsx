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

interface ProvidersWrapperProps {
  children: ReactNode;
}

export function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return <Providers>{children}</Providers>;
}