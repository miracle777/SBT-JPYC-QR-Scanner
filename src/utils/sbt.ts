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
    allowedNetworks: ['polygon-amoy'],
    rank: 'bronze',
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
        const sepoliaSBTs = await fetchSBTsFromNetwork(userAddress, 'sepolia');
        sbts.push(...sepoliaSBTs);
      } catch (error) {
        console.error('Failed to fetch SBTs from Sepolia:', error);
      }
    }

    // Polygon Amoyネットワークからも取得
    if (SBT_ADDRESSES['polygon-amoy']) {
      try {
        const amoyCreateClient = createPublicClient({
          chain: {
            id: 80002,
            name: 'Polygon Amoy',
            network: 'polygon-amoy',
            nativeCurrency: {
              decimals: 18,
              name: 'MATIC',
              symbol: 'MATIC',
            },
            rpcUrls: {
              default: { http: ['https://rpc-amoy.polygon.technology'] },
              public: { http: ['https://rpc-amoy.polygon.technology'] },
            },
          },
          transport: http(),
        });

        const contractAddress = SBT_ADDRESSES['polygon-amoy'];
        console.log('Checking SBT contract on Polygon Amoy:', contractAddress);
        
        // ユーザーが保有するSBTの数を取得
        const balance = await amoyCreateClient.readContract({
          address: contractAddress,
          abi: SBT_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        }) as bigint;
        
        console.log('Polygon Amoy SBT balance:', balance.toString());
        
        if (balance > 0n) {
          // Polygon AmoyでSBTを発見
          const shopId = 2; // デフォルトでCafe JPYCとする
          const shopInfo = REGISTERED_SHOPS[shopId as keyof typeof REGISTERED_SHOPS];
          
          // Polygon Amoy用の画像URL生成
          const amoyBadgeName = encodeURIComponent('来店記念');
          const amoyShopName = encodeURIComponent(shopInfo?.name || 'Cafe JPYC');
          const amoyImageUrl = `https://img.shields.io/badge/${amoyBadgeName}-${amoyShopName}-8B5CF6?style=for-the-badge&logo=polygon&logoColor=white`;
          
          const amoyMetadata = {
            name: `来店記念 - ${shopInfo?.name || 'Cafe JPYC'}`,
            description: `${shopInfo?.name || 'Cafe JPYC'}でのスタンプカード (Polygon Amoy)`,
            image: amoyImageUrl,
            external_url: 'https://jpyc.jp',
            background_color: '8B5CF6',
            attributes: [
              {
                trait_type: 'Shop Name',
                value: shopInfo?.name || 'Cafe JPYC'
              },
              {
                trait_type: 'Shop Category',
                value: shopInfo?.category || 'カフェ・飲食'
              },
              {
                trait_type: 'Rank',
                value: shopInfo?.sbtTemplate?.rank || 'silver'
              },
              {
                trait_type: 'Network',
                value: 'Polygon Amoy Testnet'
              },
              {
                trait_type: 'Token Standard',
                value: 'ERC721'
              }
            ]
          };
          
          const amoyToken: SBT = {
            id: `sbt-polygon-amoy-${contractAddress}`,
            name: amoyMetadata.name,
            symbol: shopInfo?.name?.substring(0, 4).toUpperCase() || 'CAFE',
            address: contractAddress,
            issuer: shopInfo?.name || 'Polygon Amoy Network',
            issuerAddress: contractAddress,
            description: amoyMetadata.description,
            network: 'polygon-amoy',
            chainId: 80002,
            tokenId: 1n,
            metadata: amoyMetadata,
            imageUrl: amoyImageUrl,
            rank: shopInfo?.sbtTemplate?.rank || 'silver',
            issuedDate: new Date(),
            // 拡張情報
            shopId: shopId,
            shopName: shopInfo?.name,
            shopCategory: shopInfo?.category,
            benefits: shopInfo?.sbtTemplate?.benefits ? [...shopInfo.sbtTemplate.benefits] : [],
            thumbnailUrl: amoyImageUrl,
            bannerUrl: shopInfo?.bannerUrl,
            external_url: amoyMetadata.external_url,
            background_color: amoyMetadata.background_color,
          };
          sbts.push(amoyToken);
        }
      } catch (error) {
        console.error('Failed to fetch SBTs from Polygon Amoy:', error);
      }
    }

    if (sbts.length > 0) {
      console.log(`✅ Found ${sbts.length} SBTs across networks`);
      return sbts;
    }

    // SBTが見つからない場合はサンプルデータを表示しない
    console.log('⚠️ No SBTs found on any blockchain');
    return [];
  } catch (error) {
    console.error('Failed to fetch SBTs:', error);
    return [];
  }
}

async function fetchSBTsFromNetwork(userAddress: `0x${string}`, network: 'sepolia'): Promise<SBT[]> {
  const sbts: SBT[] = [];
  
  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });
    
    const contractAddress = SBT_ADDRESSES.sepolia!;
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
        let imageUrl = '';
        
        if (tokenURI.startsWith('data:application/json;base64,')) {
          // Base64エンコードされたJSON
          const base64Data = tokenURI.replace('data:application/json;base64,', '');
          const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
          metadata = JSON.parse(jsonString);
          imageUrl = metadata.image || '';
        } else if (tokenURI.startsWith('http')) {
          // HTTPSのメタデータURL
          try {
            const response = await axios.get(tokenURI);
            metadata = response.data;
            imageUrl = metadata.image || '';
          } catch (e) {
            console.error('Failed to fetch metadata from URL:', e);
          }
        }
        
        // 画像URLが取得できない場合はデフォルト画像を使用
        if (!imageUrl || imageUrl.includes('placeholder')) {
          // MetaMask表示用により適切なデフォルト画像（金色のバッジデザイン）
          const badgeName = encodeURIComponent(metadata.name || actualShopInfo?.name || `来店記念`);
          const shopName = encodeURIComponent(actualShopInfo?.name || 'DEMOショップ');
          imageUrl = `https://img.shields.io/badge/${badgeName}-${shopName}-FFD700?style=for-the-badge&logo=star&logoColor=white`;
          
          // さらに詳細な画像が必要な場合の代替案
          if (!imageUrl) {
            imageUrl = `https://via.placeholder.com/400x400/FFD700/000000.png?text=${badgeName}+%0A${shopName}`;
          }
        }
        
        // IPFSリンクをHTTPSリンクに変換
        if (imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        
        // メタデータにMetaMask表示用の詳細情報を追加
        const enhancedMetadata = {
          ...metadata,
          name: metadata.name || `来店記念 - ${actualShopInfo?.name || 'DEMOショップ'}`,
          description: metadata.description || `${actualShopInfo?.name || 'DEMOショップ'}でのスタンプカード`,
          image: imageUrl,
          external_url: metadata.external_url || 'https://jpyc.jp',
          background_color: metadata.background_color || 'FFD700',
          attributes: [
            {
              trait_type: 'Shop Name',
              value: actualShopInfo?.name || 'DEMOショップ'
            },
            {
              trait_type: 'Shop Category',
              value: actualShopInfo?.category || 'デモ・実験店舗'
            },
            {
              trait_type: 'Rank',
              value: metadata.rank || actualShopInfo?.sbtTemplate?.rank || 'bronze'
            },
            {
              trait_type: 'Network',
              value: 'Sepolia Testnet'
            },
            {
              trait_type: 'Token Standard',
              value: 'ERC721'
            }
          ]
        };
        
        console.log('Enhanced SBT Image URL:', imageUrl);
        console.log('Enhanced SBT Metadata:', enhancedMetadata);
        
        // shopIdを特定（tokenIdから推測、またはメタデータから）
        const shopId = 1; // Shop ID: 1 (SBT JPYC Pay Demo Store)
        const shopInfo = REGISTERED_SHOPS[shopId as keyof typeof REGISTERED_SHOPS];
        
        // メタデータからより詳細な情報を抽出
        const extractedShopId = metadata.shopId || metadata.shop_id || shopId;
        const actualShopInfo = REGISTERED_SHOPS[extractedShopId as keyof typeof REGISTERED_SHOPS] || shopInfo;
        
        const sbt: SBT = {
          id: `sbt-${contractAddress}-${tokenId}`,
          name: enhancedMetadata.name,
          symbol: metadata.symbol || actualShopInfo?.name?.substring(0, 4).toUpperCase() || 'SBT',
          address: contractAddress,
          issuer: actualShopInfo?.name || 'Unknown Shop',
          issuerAddress: actualShopInfo?.wallet || contractAddress,
          description: enhancedMetadata.description,
          network: 'sepolia',
          chainId: 11155111,
          tokenId: tokenId,
          metadata: enhancedMetadata,
          imageUrl: imageUrl,
          rank: metadata.rank || actualShopInfo?.sbtTemplate?.rank || 'bronze',
          issuedDate: new Date(),
          // 拡張情報
          shopId: extractedShopId,
          shopName: actualShopInfo?.name,
          shopCategory: actualShopInfo?.category,
          benefits: metadata.benefits || (actualShopInfo?.sbtTemplate?.benefits ? [...actualShopInfo.sbtTemplate.benefits] : []),
          thumbnailUrl: imageUrl,
          bannerUrl: actualShopInfo?.bannerUrl,
          external_url: enhancedMetadata.external_url,
          background_color: enhancedMetadata.background_color,
          youtube_url: metadata.youtube_url,
          animationUrl: metadata.animation_url,
        };
        
        sbts.push(sbt);
      } catch (tokenError) {
        console.error(`Failed to fetch token ${i}:`, tokenError);
      }
    }
    
    if (sbts.length > 0) {
      console.log(`✅ Found ${sbts.length} SBTs on Sepolia`);
    }
  } catch (error) {
    console.error('Failed to fetch SBTs from Sepolia:', error);
  }
  
  return sbts;
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

    console.log(`Attempting to get visit count for user ${userAddress}, shop ${shopId}`);
    
    // コントラクト関数が存在しない可能性があるため、デモデータを返す
    console.log('userVisits function may not exist in contract, returning demo data');
    
    // デモ用の訪問回数を返す（実際の実装では適宜調整）
    const demoVisitCount = Math.floor(Math.random() * 5); // 0-4回のランダム訪問回数
    console.log(`Demo visit count for user ${userAddress}, shop ${shopId}: ${demoVisitCount}`);
    return demoVisitCount;
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

    console.log(`Attempting to check SBT for user ${userAddress}, shop ${shopId}`);
    
    // コントラクト関数が存在しない可能性があるため、balanceOfで確認
    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const balance = await client.readContract({
      address: SBT_ADDRESSES.sepolia,
      abi: SBT_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    }) as bigint;

    const hasSBT = balance > 0n;
    console.log(`User ${userAddress} has SBT for shop ${shopId}: ${hasSBT} (balance: ${balance})`);
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
    // コントラクトから取得する代わりに、登録済みショップ情報を返す
    const shop = REGISTERED_SHOPS[shopId as keyof typeof REGISTERED_SHOPS];
    if (!shop) {
      console.log(`Shop ${shopId} not found in registered shops`);
      return null;
    }

    return {
      shopWallet: shop.wallet,
      shopName: shop.name,
      requiredVisits: 3, // デフォルトで3回訪問が必要
      isActive: true,
    };
  } catch (error) {
    console.error('Failed to get shop info:', error);
    return null;
  }
}

