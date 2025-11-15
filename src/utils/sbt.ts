/**
 * SBT (Soulbound Token) 関連のユーティリティ関数
 */

import { SBT, SBTBalance, SBTPaymentRule, NetworkType } from '../types';
import axios from 'axios';
import { getAddress } from 'viem';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { SBT_ABI, SBT_ADDRESSES, REGISTERED_SHOPS } from '../contracts/sbt';

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
  // Polygon Amoy Testnet
  // ============================================
  {
    id: 'community-contributor',
    name: 'Community Contributor',
    symbol: 'CC',
    address: '0x2222222222222222222222222222222222222222' as `0x${string}`,
    issuer: 'JPYC Community',
    issuerAddress: '0x3333333333333333333333333333333333333333' as `0x${string}`,
    description: 'JPYC コミュニティへの貢献者',
    network: 'polygon-amoy',
    chainId: 80002,
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
    allowedNetworks: ['sepolia', 'polygon', 'polygon-amoy'],
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

  // Polygon Amoy Testnet
  'community-contributor': {
    sbtId: 'community-contributor',
    minBalance: BigInt(1),
    discount: 2, // 2% 割引
    maxTransactionAmount: BigInt(100000) * BigInt(10 ** 18),
    allowedNetworks: ['polygon-amoy', 'arbitrum-sepolia'],
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
 * SBT 情報を取得（ブロックチェーンから実際に取得）
 */
export async function fetchUserSBTs(userAddress: `0x${string}`): Promise<SBT[]> {
  try {
    console.log(`Fetching SBTs for address: ${userAddress}`);
    
    const sbts: SBT[] = [];
    
    // Sepoliaネットワークから実際のSBTを取得
    if (SBT_ADDRESSES.sepolia) {
      try {
        const client = createPublicClient({
          chain: sepolia,
          transport: http(),
        });
        
        const contractAddress = SBT_ADDRESSES.sepolia;
        console.log('Checking SBT contract:', contractAddress);
        
        // ユーザーが保有するSBTの数を取得
        const balance = await client.readContract({
          address: contractAddress,
          abi: SBT_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        }) as bigint;
        
        console.log('SBT balance:', balance.toString());
        
        // 各SBTのトークンIDを取得
        for (let i = 0; i < Number(balance); i++) {
          try {
            const tokenId = await client.readContract({
              address: contractAddress,
              abi: SBT_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [userAddress, BigInt(i)],
            }) as bigint;
            
            console.log('Token ID:', tokenId.toString());
            
            // トークンURIを取得
            const tokenURI = await client.readContract({
              address: contractAddress,
              abi: SBT_ABI,
              functionName: 'tokenURI',
              args: [tokenId],
            }) as string;
            
            console.log('Token URI:', tokenURI);
            
            // メタデータを取得（JSONの場合）
            let metadata: any = {};
            if (tokenURI.startsWith('data:application/json;base64,')) {
              // Base64エンコードされたJSON
              const base64Data = tokenURI.replace('data:application/json;base64,', '');
              const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
              metadata = JSON.parse(jsonString);
            } else if (tokenURI.startsWith('http')) {
              // HTTPSのメタデータURL
              try {
                const response = await axios.get(tokenURI);
                metadata = response.data;
              } catch (e) {
                console.error('Failed to fetch metadata from URL:', e);
              }
            }
            
            // shopIdを特定（tokenIdから推測、またはメタデータから）
            const shopId = 1; // Shop ID: 1 (SBT JPYC Pay Demo Store)
            const shopInfo = REGISTERED_SHOPS[shopId as keyof typeof REGISTERED_SHOPS];
            
            const sbt: SBT = {
              id: `sbt-${contractAddress}-${tokenId}`,
              name: metadata.name || shopInfo?.name || `SBT #${tokenId}`,
              symbol: 'SBT',
              address: contractAddress,
              issuer: shopInfo?.name || 'Unknown Shop',
              issuerAddress: shopInfo?.wallet || contractAddress,
              description: metadata.description || `Shop loyalty SBT for ${shopInfo?.name || 'shop'}`,
              network: 'sepolia',
              chainId: 11155111,
              tokenId: tokenId,
              metadata: metadata,
              imageUrl: metadata.image,
              rank: 'bronze', // デフォルトランク
              issuedDate: new Date(),
            };
            
            sbts.push(sbt);
          } catch (tokenError) {
            console.error(`Failed to fetch token ${i}:`, tokenError);
          }
        }
        
        if (sbts.length > 0) {
          console.log(`✅ Found ${sbts.length} SBTs on Sepolia`);
          return sbts;
        }
      } catch (error) {
        console.error('Failed to fetch SBTs from Sepolia:', error);
      }
    }

    // SBTが見つからない場合はサンプルデータを表示しない
    console.log('⚠️ No SBTs found on blockchain');
    return [];
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

/**
 * ユーザーのショップ訪問回数を取得
 */
export async function getUserVisitCount(
  userAddress: `0x${string}`,
  shopId: number
): Promise<number> {
  try {
    if (!SBT_ADDRESSES.sepolia) {
      console.log('SBT contract not deployed on Sepolia');
      return 0;
    }

    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const visits = await client.readContract({
      address: SBT_ADDRESSES.sepolia,
      abi: SBT_ABI,
      functionName: 'userVisits',
      args: [userAddress, BigInt(shopId)],
    }) as bigint;

    console.log(`User ${userAddress} has ${visits} visits to shop ${shopId}`);
    return Number(visits);
  } catch (error) {
    console.error('Failed to get user visit count:', error);
    return 0;
  }
}

/**
 * ユーザーが特定ショップのSBTを保有しているか確認
 */
export async function checkUserHasSBT(
  userAddress: `0x${string}`,
  shopId: number
): Promise<boolean> {
  try {
    if (!SBT_ADDRESSES.sepolia) {
      console.log('SBT contract not deployed on Sepolia');
      return false;
    }

    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const hasSBT = await client.readContract({
      address: SBT_ADDRESSES.sepolia,
      abi: SBT_ABI,
      functionName: 'hasSBT',
      args: [userAddress, BigInt(shopId)],
    }) as boolean;

    console.log(`User ${userAddress} has SBT for shop ${shopId}: ${hasSBT}`);
    return hasSBT;
  } catch (error) {
    console.error('Failed to check SBT:', error);
    return false;
  }
}

/**
 * ショップ情報を取得
 */
export async function getShopInfo(shopId: number): Promise<{
  shopWallet: string;
  shopName: string;
  requiredVisits: number;
  isActive: boolean;
} | null> {
  try {
    if (!SBT_ADDRESSES.sepolia) {
      console.log('SBT contract not deployed on Sepolia');
      return null;
    }

    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const shopInfo = await client.readContract({
      address: SBT_ADDRESSES.sepolia,
      abi: SBT_ABI,
      functionName: 'shops',
      args: [BigInt(shopId)],
    }) as [string, string, bigint, boolean];

    return {
      shopWallet: shopInfo[0],
      shopName: shopInfo[1],
      requiredVisits: Number(shopInfo[2]),
      isActive: shopInfo[3],
    };
  } catch (error) {
    console.error('Failed to get shop info:', error);
    return null;
  }
}

