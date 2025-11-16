/**
 * SBT (Soulbound Token) 関連の型定義
 */

export interface SBT {
  id: string;
  name: string;
  symbol: string;
  address: `0x${string}`;
  issuer: string;
  issuerAddress: `0x${string}`;
  description: string;
  imageUrl?: string;
  network: NetworkType;
  chainId: number;
  tokenId?: bigint;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    category?: string;
    shopId?: number;
    shopName?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
    [key: string]: any;
  };
  rank?: 'bronze' | 'silver' | 'gold' | 'platinum';
  issuedDate?: Date;
  expiryDate?: Date;
  // 店舗情報
  shopId?: number;
  shopName?: string;
  shopCategory?: string;
  // 追加詳細情報
  badges?: string[];
  achievements?: string[];
  benefits?: readonly string[];
  visitCount?: number;
  requiredVisits?: number;
  // 画像・メディア
  thumbnailUrl?: string;
  bannerUrl?: string;
  animationUrl?: string;
  // メタデータ
  external_url?: string;
  background_color?: string;
  youtube_url?: string;
}

export interface SBTBalance {
  sbt: SBT;
  balance: bigint;
  hasToken: boolean;
}

/**
 * 決済ネットワーク情報
 */

export type NetworkType = 
  // Ethereum
  | 'ethereum' 
  | 'sepolia'
  // Polygon
  | 'polygon' 
  | 'polygon-amoy'
  // Avalanche
  | 'avalanche'
  | 'avalanche-fuji';

export interface PaymentNetwork {
  name: NetworkType;
  chainId: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  currencySymbol: string;
  displayName: string;
  color: string;
  icon?: string;
  isMainnet: boolean;
}

/**
 * QRコード支払い情報
 */

export interface PaymentQRData {
  type: 'ethereum' | 'jpyc' | 'payment' | 'sbt-payment';
  address: `0x${string}`;
  amount?: string;
  network?: NetworkType;
  chainId?: number;
  contractAddress?: `0x${string}`;
  shopName?: string;
  shopId?: string;
  paymentId?: string;
  expiresAt?: number;
  sbtRequired?: string[];
  minimumSBTRank?: 'bronze' | 'silver' | 'gold' | 'platinum';
  memo?: string;
  timestamp?: number;
}

/**
 * ネットワーク検証結果
 */

export interface NetworkValidationResult {
  isValid: boolean;
  currentNetwork: NetworkType;
  requiredNetwork: NetworkType;
  mismatch: boolean;
  message: string;
  action?: 'switch-network' | 'confirm' | 'cancel';
}

/**
 * SBT支払い制限ルール
 */

export interface SBTPaymentRule {
  sbtId: string;
  minBalance: bigint;
  discount: number; // パーセンテージ
  maxTransactionAmount?: bigint;
  dailyLimit?: bigint;
  monthlyLimit?: bigint;
  allowedNetworks: NetworkType[];
  rank?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * 店舗情報
 */
export interface ShopInfo {
  id: number;
  name: string;
  category: string;
  description?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  wallet: `0x${string}`;
  requiredVisits: number;
  sbtTemplate?: {
    name: string;
    description: string;
    imageUrl: string;
    rank: 'bronze' | 'silver' | 'gold' | 'platinum';
    benefits: readonly string[];
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * SBT統計情報
 */
export interface SBTStats {
  totalSBTs: number;
  sbtsByRank: Record<'bronze' | 'silver' | 'gold' | 'platinum', number>;
  sbtsByShop: Record<number, number>;
  recentAchievements: SBT[];
  totalVisits: number;
  activeShops: number;
}

/**
 * 決済履歴
 */

export interface PaymentHistory {
  id: string;
  amount: string;
  recipient: `0x${string}`;
  network: NetworkType;
  chainId: number;
  txHash?: string;
  timestamp: Date;
  memo?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  sbtUsed?: string[];
  discount?: number;
  status: 'pending' | 'success' | 'failed';
}

/**
 * Ethereum Provider インターフェース（MetaMask）
 */
declare global {
  interface Window {
    ethereum?: {
      request: (request: {
        method: string;
        params?: any;
      }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

export {};
