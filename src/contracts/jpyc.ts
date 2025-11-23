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
  // Ethereum Mainnet - Official JPYC
  ethereum: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  
  // Ethereum Sepolia Testnet - 公式JPYCテストネットワーク
  sepolia: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  // Ethereum Sepolia Testnet - Faucet用アドレス、故意的に異なるアドレスにしている可能性あり
  'sepolia-faucet': getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'),
  'sepolia-community': getAddress('0xd3eF95d29A198868241FE374A999fc25F6152253'),
  
  // Polygon Mainnet - Official JPYC
  polygon: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  // Polygon Amoy Testnet - 公式JPYCテストネットワーク
  'polygon-amoy': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  
  // Avalanche C-Chain Mainnet - Official JPYC
  avalanche: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  // Avalanche Fuji Testnet - 公式JPYCテストネットワーク
  'avalanche-fuji': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  
  // カスタムテストトークン (tJPYC)
  'avalanche-fuji-custom': getAddress('0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345'),
  'polygon-amoy-custom': getAddress('0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a'),
} as const;

// JPYC Contract Configuration (backward compatibility)
export const JPYC_CONFIG = {
  // 推奨JPYC Address (Sepolia testnet 公式)
  address: JPYC_ADDRESSES.sepolia,
  abi: JPYC_ABI,
} as const;

// コミュニティJPYC Configuration (Faucet用)
export const JPYC_COMMUNITY_CONFIG = {
  address: JPYC_ADDRESSES['sepolia-faucet'],
  abi: JPYC_ABI,
} as const;

// JPYCの表示フォーマット関数（小数点以下2桁表示）
export function formatJPYCDisplay(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;
  
  // 小数点以下2桁を計算
  const fractionalPart = Number(remainder) / Number(divisor);
  const decimal = whole + fractionalPart;
  
  // 小数点以下2桁で表示
  return decimal.toLocaleString('ja-JP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
