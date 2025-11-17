import { getAddress } from 'viem';

// ERC20 Standard ABI for JPYC
export const JPYC_ABI = [
  // ERC20 Standard Functions
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// JPYC Contract Addresses per Network
export const JPYC_ADDRESSES = {
  // Ethereum Mainnet
  ethereum: getAddress('0x2370f9d504c7a6e775bf6e14b3f12846b594cd53'),
  // Ethereum Sepolia Testnet - Official JPYC (推奨)
  sepolia: getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'),
  // Ethereum Sepolia Testnet - Alternative addresses
  'sepolia-community': getAddress('0xd3eF95d29A198868241FE374A999fc25F6152253'),
  'sepolia-additional': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  
  // Polygon Mainnet
  polygon: getAddress('0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'),
  // Polygon Amoy Testnet 
  'polygon-amoy': getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'),
  
  // Avalanche C-Chain Mainnet
  avalanche: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  // Avalanche Fuji Testnet
  'avalanche-fuji': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  
  // カスタムテストトークン (tJPYC)
  'avalanche-fuji-custom': getAddress('0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345'),
  'polygon-amoy-custom': getAddress('0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a'),
} as const;

// JPYC Contract Configuration (backward compatibility)
export const JPYC_CONFIG = {
  // 推奨JPYC Address (Sepolia testnet)
  address: JPYC_ADDRESSES.sepolia,
  abi: JPYC_ABI,
} as const;

// コミュニティJPYC Configuration
export const JPYC_COMMUNITY_CONFIG = {
  address: JPYC_ADDRESSES['sepolia-community'],
  abi: JPYC_ABI,
} as const;

// JPYCの表示フォーマット関数
export function formatJPYCDisplay(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const fraction = balance % divisor;
  
  // 小数点以下2桁まで表示
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
  
  return `${whole.toLocaleString('ja-JP')}.${fractionStr}`;
}

// カスタムtJPYCトークンの設定
export const TJPYC_CONFIG = {
  symbol: 'tJPYC',
  decimals: 18,
  name: 'Test JPYC',
  networks: {
    'avalanche-fuji-custom': {
      address: JPYC_ADDRESSES['avalanche-fuji-custom'],
      chainId: 43113,
      displayName: 'Avalanche Fuji (Custom tJPYC)',
    },
    'polygon-amoy-custom': {
      address: JPYC_ADDRESSES['polygon-amoy-custom'],
      chainId: 80002,
      displayName: 'Polygon Amoy (Custom tJPYC)',
    },
  },
} as const;

// トークン情報取得ヘルパー
export function getTokenInfo(network: JPYCNetworkType) {
  if (network === 'avalanche-fuji-custom' || network === 'polygon-amoy-custom') {
    return {
      symbol: TJPYC_CONFIG.symbol,
      decimals: TJPYC_CONFIG.decimals,
      name: TJPYC_CONFIG.name,
      isCustomToken: true,
    };
  }
  return {
    symbol: 'JPYC',
    decimals: 18,
    name: 'JPY Coin',
    isCustomToken: false,
  };
}

// ネットワークタイプ
export type JPYCNetworkType = keyof typeof JPYC_ADDRESSES;
