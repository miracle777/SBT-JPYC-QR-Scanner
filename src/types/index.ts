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
  metadata?: Record<string, any>;
  rank?: 'bronze' | 'silver' | 'gold' | 'platinum';
  issuedDate?: Date;
  expiryDate?: Date;
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
  | 'polygon-mumbai'
  // Arbitrum
  | 'arbitrum' 
  | 'arbitrum-sepolia';

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
  sbtUsed?: string[];
  discount?: number;
  status: 'pending' | 'success' | 'failed';
}
