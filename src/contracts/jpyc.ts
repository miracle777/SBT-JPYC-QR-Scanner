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
  // Ethereum Sepolia Testnet
  sepolia: getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'),
  
  // Polygon Mainnet
  polygon: getAddress('0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'),
  // Polygon Amoy Testnet (use the testnet faucet address if available)
  'polygon-amoy': getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'), // Update with actual address when available
  
  // Avalanche C-Chain Mainnet
  avalanche: getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'), // Update with actual address
  // Avalanche Fuji Testnet
  'avalanche-fuji': getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'), // Update with actual address
} as const;

// JPYC Contract Configuration (backward compatibility)
export const JPYC_CONFIG = {
  // 公式JPYC Faucet (Sepolia testnet)
  address: JPYC_ADDRESSES.sepolia,
  abi: JPYC_ABI,
} as const;

// コミュニティJPYC Configuration
export const JPYC_COMMUNITY_CONFIG = {
  address: getAddress('0xd3eF95d29A198868241FE374A999fc25F6152253'),
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

// ネットワークタイプ
export type JPYCNetworkType = keyof typeof JPYC_ADDRESSES;
