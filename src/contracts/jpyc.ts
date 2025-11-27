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
// 将来的な公式テストネットワークJPYC供給に対応するため、Faucetと公式アドレスの両方をサポート
export const JPYC_ADDRESSES = {
  // Ethereum Mainnet - Official JPYC
  ethereum: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  
  // Ethereum Sepolia Testnet - 3種類のJPYCトークンが存在
  sepolia: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),        // 公式SepoliaテストJPYC
  'sepolia-faucet': getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'),     // JPYC公式Faucetトークン
  'sepolia-community': getAddress('0xd3eF95d29A198868241FE374A999fc25F6152253'), // コミュニティJPYC
  'sepolia-official': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),   // 公式SepoliaテストJPYC
  
  // Polygon Mainnet - Official JPYC
  polygon: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  // Polygon Amoy Testnet - 公式テストJPYCとデバッグ用tJPYC（未配布）
  'polygon-amoy': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),       // 公式Amoyテスト用JPYC
  'polygon-amoy-custom': getAddress('0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a'),  // デバッグ用tJPYC（開発者専用・未配布）
  'polygon-amoy-official': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'), // 公式Amoyテスト用JPYC
  
  // Avalanche C-Chain Mainnet - Official JPYC
  avalanche: getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),
  // Avalanche Fuji Testnet - 公式テストJPYCとデバッグ用tJPYC（未配布）
  'avalanche-fuji': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'),       // 公式FujiテストJPYC
  'avalanche-fuji-custom': getAddress('0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345'),  // デバッグ用tJPYC（開発者専用・Fuji専用・未配布）
  'avalanche-fuji-official': getAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'), // 公式FujiテストJPYC
} as const;

// 環境変数によるアドレス選択設定
const USE_OFFICIAL_TESTNET = process.env.NEXT_PUBLIC_USE_OFFICIAL_JPYC === 'true';

// 動的なアドレス選択関数
export function getJPYCAddress(network: JPYCNetworkType): `0x${string}` {
  // 将来の公式テストネットワーク対応
  if (USE_OFFICIAL_TESTNET) {
    switch (network) {
      case 'sepolia':
        return JPYC_ADDRESSES['sepolia-official'];
      case 'polygon-amoy':
        return JPYC_ADDRESSES['polygon-amoy-official'];
      case 'avalanche-fuji':
        return JPYC_ADDRESSES['avalanche-fuji-official'];
      default:
        return JPYC_ADDRESSES[network];
    }
  }
  
  // 現在のFaucet/カスタムアドレス使用
  return JPYC_ADDRESSES[network];
}

// JPYC Contract Configuration (動的アドレス選択)
export const JPYC_CONFIG = {
  address: getJPYCAddress('sepolia'),
  abi: JPYC_ABI,
} as const;

// コミュニティJPYC Configuration
export const JPYC_COMMUNITY_CONFIG = {
  address: JPYC_ADDRESSES['sepolia-community'],
  abi: JPYC_ABI,
} as const;

// ネットワーク別設定取得関数
export function getJPYCConfig(network: JPYCNetworkType) {
  return {
    address: getJPYCAddress(network),
    abi: JPYC_ABI,
  };
}

// JPYCの表示フォーマット関数（小数点以下2桁表示）
export function formatJPYCDisplay(balance: bigint, decimals: number = 18): string {
  try {
    const divisor = BigInt(10 ** decimals);
    const whole = balance / divisor;
    const remainder = balance % divisor;
    
    // BigIntを安全にNumberに変換
    const wholeNumber = Number(whole);
    const remainderNumber = Number(remainder);
    const divisorNumber = Number(divisor);
    
    // 小数点以下2桁を計算
    const fractionalPart = remainderNumber / divisorNumber;
    const decimal = wholeNumber + fractionalPart;
    
    // 小数点以下2桁で表示
    return decimal.toLocaleString('ja-JP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
    console.error('formatJPYCDisplay error:', error, 'balance:', balance, 'decimals:', decimals);
    // エラー時はfallback表示
    return '0.00';
  }
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

// トークン情報取得ヘルパー (公式/カスタム対応)
export function getTokenInfo(network: JPYCNetworkType) {
  // カスタムトークンの判定
  const isCustomToken = network.includes('-custom') || 
    (!USE_OFFICIAL_TESTNET && (network === 'polygon-amoy' || network === 'avalanche-fuji'));
    
  // Faucetトークンの判定
  const isFaucetToken = network.includes('-faucet') || network.includes('-community') ||
    (!USE_OFFICIAL_TESTNET && network === 'sepolia');
  
  // 公式テストネットJPYCの判定
  const isOfficialTestnet = network === 'sepolia' || network === 'avalanche-fuji' || 
    network.includes('-official') || 
    (USE_OFFICIAL_TESTNET && (network.includes('-official') || ['ethereum', 'polygon', 'avalanche'].includes(network)));
  
  if (isCustomToken) {
    return {
      symbol: TJPYC_CONFIG.symbol,
      decimals: TJPYC_CONFIG.decimals,
      name: TJPYC_CONFIG.name,
      isCustomToken: true,
      isFaucetToken: false,
      isOfficialTestnet: false,
    };
  }
  
  return {
    symbol: 'JPYC',
    decimals: 18,
    name: 'JPY Coin',
    isCustomToken: false,
    isFaucetToken,
    isOfficialTestnet: USE_OFFICIAL_TESTNET && (network.includes('-official') || ['ethereum', 'polygon', 'avalanche'].includes(network)),
  };
}

// ネットワーク表示名取得関数
export function getNetworkDisplayName(network: JPYCNetworkType): string {
  const tokenInfo = getTokenInfo(network);
  
  const baseNames: Record<string, string> = {
    ethereum: 'Ethereum',
    sepolia: 'Ethereum Sepolia',
    polygon: 'Polygon',
    'polygon-amoy': 'Polygon Amoy',
    avalanche: 'Avalanche',
    'avalanche-fuji': 'Avalanche Fuji',
  };
  
  const baseName = baseNames[network.replace(/-faucet|-community|-official|-custom$/, '')] || network;
  
  if (tokenInfo.isCustomToken) {
    return `${baseName} (Custom tJPYC)`;
  } else if (tokenInfo.isFaucetToken) {
    return `${baseName} (Faucet JPYC)`;
  } else if (tokenInfo.isOfficialTestnet) {
    return `${baseName} (Official Test JPYC)`;
  }
  
  return `${baseName} (JPYC)`;
}

// ネットワークタイプ
export type JPYCNetworkType = keyof typeof JPYC_ADDRESSES;
