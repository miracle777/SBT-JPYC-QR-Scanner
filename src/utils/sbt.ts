/**
 * SBT (Soulbound Token) 関連のユーティリティ関数
 */

import { SBT, SBTBalance, SBTPaymentRule, NetworkType } from '@/src/types';
import axios from 'axios';
import { getAddress } from 'viem';

/**
 * サンプル SBT データ（デモ用）
 */
export const SAMPLE_SBTS: SBT[] = [
  // ============================================
  // Ethereum
  // ============================================
  {
    id: 'jpyc-early-adopter',
    name: 'JPYC Early Adopter',
    symbol: 'JPYC-EA',
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    issuer: 'JPYC Corporation',
    issuerAddress: '0x0987654321098765432109876543210987654321' as `0x${string}`,
    description: 'JPYC の初期利用者を証明する SBT',
    network: 'ethereum',
    chainId: 1,
    rank: 'gold',
    imageUrl: 'https://via.placeholder.com/150?text=JPYC+Early+Adopter',
  },

  // ============================================
  // Sepolia Testnet
  // ============================================
  {
    id: 'verified-merchant',
    name: 'Verified Merchant',
    symbol: 'VM',
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    issuer: 'Merchant Verification System',
    issuerAddress: '0x1111111111111111111111111111111111111111' as `0x${string}`,
    description: '認証されたマーチャント',
    network: 'sepolia',
    chainId: 11155111,
    rank: 'silver',
    imageUrl: 'https://via.placeholder.com/150?text=Verified+Merchant',
  },

  // ============================================
  // Polygon Mainnet
  // ============================================
  {
    id: 'polygon-defi-pioneer',
    name: 'Polygon DeFi Pioneer',
    symbol: 'PDP',
    address: '0x4444444444444444444444444444444444444444' as `0x${string}`,
    issuer: 'Polygon Foundation',
    issuerAddress: '0x5555555555555555555555555555555555555555' as `0x${string}`,
    description: 'Polygon DeFiの先駆者',
    network: 'polygon',
    chainId: 137,
    rank: 'platinum',
    imageUrl: 'https://via.placeholder.com/150?text=Polygon+DeFi+Pioneer',
  },

  // ============================================
  // Polygon Mumbai Testnet
  // ============================================
  {
    id: 'community-contributor',
    name: 'Community Contributor',
    symbol: 'CC',
    address: '0x2222222222222222222222222222222222222222' as `0x${string}`,
    issuer: 'JPYC Community',
    issuerAddress: '0x3333333333333333333333333333333333333333' as `0x${string}`,
    description: 'JPYC コミュニティへの貢献者',
    network: 'polygon-mumbai',
    chainId: 80001,
    rank: 'bronze',
    imageUrl: 'https://via.placeholder.com/150?text=Community+Contributor',
  },

  // ============================================
  // Arbitrum One Mainnet
  // ============================================
  {
    id: 'arbitrum-builder',
    name: 'Arbitrum Builder',
    symbol: 'ARB-BLD',
    address: '0x6666666666666666666666666666666666666666' as `0x${string}`,
    issuer: 'Arbitrum DAO',
    issuerAddress: '0x7777777777777777777777777777777777777777' as `0x${string}`,
    description: 'Arbitrum エコシステムのビルダー',
    network: 'arbitrum',
    chainId: 42161,
    rank: 'gold',
    imageUrl: 'https://via.placeholder.com/150?text=Arbitrum+Builder',
  },

  // ============================================
  // Arbitrum Sepolia Testnet
  // ============================================
  {
    id: 'arbitrum-testnet-developer',
    name: 'Arbitrum Testnet Developer',
    symbol: 'ARB-DEV',
    address: '0x8888888888888888888888888888888888888888' as `0x${string}`,
    issuer: 'Arbitrum Foundation',
    issuerAddress: '0x9999999999999999999999999999999999999999' as `0x${string}`,
    description: 'Arbitrum テストネット開発者',
    network: 'arbitrum-sepolia',
    chainId: 421614,
    rank: 'silver',
    imageUrl: 'https://via.placeholder.com/150?text=Arbitrum+Developer',
  },
];

/**
 * SBT 支払いルール設定
 */
export const SBT_PAYMENT_RULES: Record<string, SBTPaymentRule> = {
  // Ethereum / Sepolia
  'jpyc-early-adopter': {
    sbtId: 'jpyc-early-adopter',
    minBalance: BigInt(1),
    discount: 10, // 10% 割引
    maxTransactionAmount: BigInt(1000000) * BigInt(10 ** 18),
    allowedNetworks: ['ethereum', 'sepolia'],
    rank: 'gold',
  },
  'verified-merchant': {
    sbtId: 'verified-merchant',
    minBalance: BigInt(1),
    discount: 5, // 5% 割引
    maxTransactionAmount: BigInt(500000) * BigInt(10 ** 18),
    allowedNetworks: ['sepolia', 'polygon', 'polygon-mumbai'],
    rank: 'silver',
  },

  // Polygon Mainnet
  'polygon-defi-pioneer': {
    sbtId: 'polygon-defi-pioneer',
    minBalance: BigInt(1),
    discount: 15, // 15% 割引（Platinum）
    maxTransactionAmount: BigInt(5000000) * BigInt(10 ** 18),
    allowedNetworks: ['polygon'],
    rank: 'platinum',
  },

  // Polygon Mumbai Testnet
  'community-contributor': {
    sbtId: 'community-contributor',
    minBalance: BigInt(1),
    discount: 2, // 2% 割引
    maxTransactionAmount: BigInt(100000) * BigInt(10 ** 18),
    allowedNetworks: ['polygon-mumbai', 'arbitrum-sepolia'],
    rank: 'bronze',
  },

  // Arbitrum One Mainnet
  'arbitrum-builder': {
    sbtId: 'arbitrum-builder',
    minBalance: BigInt(1),
    discount: 10, // 10% 割引
    maxTransactionAmount: BigInt(1000000) * BigInt(10 ** 18),
    allowedNetworks: ['arbitrum'],
    rank: 'gold',
  },

  // Arbitrum Sepolia Testnet
  'arbitrum-testnet-developer': {
    sbtId: 'arbitrum-testnet-developer',
    minBalance: BigInt(1),
    discount: 5, // 5% 割引
    maxTransactionAmount: BigInt(500000) * BigInt(10 ** 18),
    allowedNetworks: ['arbitrum-sepolia'],
    rank: 'silver',
  },
};

/**
 * ランク定義（ボーナス情報）
 */
export const RANK_INFO = {
  bronze: {
    displayName: 'Bronze',
    description: '基本メンバー',
    discount: 2,
    maxDaily: BigInt(100000) * BigInt(10 ** 18),
    maxMonthly: BigInt(1000000) * BigInt(10 ** 18),
    color: '#CD7F32',
  },
  silver: {
    displayName: 'Silver',
    description: 'シルバーメンバー',
    discount: 5,
    maxDaily: BigInt(500000) * BigInt(10 ** 18),
    maxMonthly: BigInt(5000000) * BigInt(10 ** 18),
    color: '#C0C0C0',
  },
  gold: {
    displayName: 'Gold',
    description: 'ゴールドメンバー',
    discount: 10,
    maxDaily: BigInt(1000000) * BigInt(10 ** 18),
    maxMonthly: BigInt(10000000) * BigInt(10 ** 18),
    color: '#FFD700',
  },
  platinum: {
    displayName: 'Platinum',
    description: 'プラチナメンバー',
    discount: 15,
    maxDaily: BigInt(5000000) * BigInt(10 ** 18),
    maxMonthly: BigInt(50000000) * BigInt(10 ** 18),
    color: '#E5E4E2',
  },
};

/**
 * SBT 情報を取得（ここではモック実装）
 */
export async function fetchUserSBTs(userAddress: `0x${string}`): Promise<SBT[]> {
  try {
    // 実装例：ブロックチェーンから SBT 情報を取得
    // 現在はモック実装
    console.log(`Fetching SBTs for address: ${userAddress}`);

    // APIでデータを取得する場合の例
    // const response = await axios.get(`/api/sbt/user/${userAddress}`);
    // return response.data;

    // デモ用にサンプルデータを返す
    return SAMPLE_SBTS;
  } catch (error) {
    console.error('Failed to fetch SBTs:', error);
    return [];
  }
}

/**
 * 特定のネットワークで利用可能な SBT を取得
 */
export async function fetchSBTsByNetwork(
  userAddress: `0x${string}`,
  network: NetworkType
): Promise<SBT[]> {
  const sbts = await fetchUserSBTs(userAddress);
  return sbts.filter((sbt) => sbt.network === network);
}

/**
 * ユーザーが特定の SBT を保有しているかチェック
 */
export async function hasSBT(
  userAddress: `0x${string}`,
  sbtId: string
): Promise<boolean> {
  const sbts = await fetchUserSBTs(userAddress);
  return sbts.some((sbt) => sbt.id === sbtId);
}

/**
 * SBT ランクを取得
 */
export async function getUserHighestRank(
  userAddress: `0x${string}`
): Promise<'bronze' | 'silver' | 'gold' | 'platinum' | null> {
  const sbts = await fetchUserSBTs(userAddress);

  const ranks = sbts
    .map((sbt) => sbt.rank)
    .filter((rank): rank is 'bronze' | 'silver' | 'gold' | 'platinum' => rank !== undefined);

  if (ranks.length === 0) return null;

  const rankOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
  return ranks.reduce((highest, current) => {
    return rankOrder[current] > rankOrder[highest] ? current : highest;
  });
}

/**
 * ユーザーが指定されたネットワークで決済可能かチェック
 */
export async function canPayWithNetwork(
  userAddress: `0x${string}`,
  requiredNetwork: NetworkType,
  amount: bigint = BigInt(0)
): Promise<{ canPay: boolean; reason?: string; discount?: number }> {
  const sbts = await fetchUserSBTs(userAddress);

  // ネットワークで利用可能な SBT を確認
  const availableSBTs = sbts.filter((sbt) => sbt.network === requiredNetwork);

  if (availableSBTs.length === 0) {
    return {
      canPay: true,
      reason: `このネットワーク (${requiredNetwork}) では SBT ボーナスは利用できません。`,
    };
  }

  // 最高ランクの割引を適用
  const highestRank = availableSBTs
    .map((sbt) => sbt.rank)
    .filter((rank): rank is 'bronze' | 'silver' | 'gold' | 'platinum' => rank !== undefined)
    .reduce((highest, current) => {
      const rankOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
      return rankOrder[current] > rankOrder[highest] ? current : highest;
    }, 'bronze' as const);

  const rule = SBT_PAYMENT_RULES[availableSBTs[0].id];
  const discount = rule?.discount || 0;

  // 最大取引額をチェック
  if (rule?.maxTransactionAmount && amount > rule.maxTransactionAmount) {
    return {
      canPay: false,
      reason: `この SBT では最大 ${rule.maxTransactionAmount} までの取引が可能です。`,
    };
  }

  return {
    canPay: true,
    discount,
  };
}

/**
 * 割引金額を計算
 */
export function calculateDiscount(amount: bigint, discountPercent: number): bigint {
  return (amount * BigInt(discountPercent)) / BigInt(100);
}

/**
 * SBT バッジの色を取得
 */
export function getSBTBadgeColor(rank?: 'bronze' | 'silver' | 'gold' | 'platinum'): string {
  if (!rank) return '#999';
  return RANK_INFO[rank].color;
}

/**
 * SBT ランクの説明を取得
 */
export function getRankDescription(rank: 'bronze' | 'silver' | 'gold' | 'platinum'): string {
  return RANK_INFO[rank].description;
}

/**
 * SBT をアドレスで正規化
 */
export function normalizeSBTAddress(address: string): `0x${string}` {
  try {
    return getAddress(address) as `0x${string}`;
  } catch {
    return address as `0x${string}`;
  }
}
