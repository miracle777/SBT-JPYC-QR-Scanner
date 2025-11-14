/**
 * ネットワーク関連のユーティリティ関数
 */

import { NetworkType, PaymentNetwork, PaymentQRData, NetworkValidationResult } from '../types';

/**
 * サポートされているネットワーク設定
 */
export const SUPPORTED_NETWORKS: Record<NetworkType, PaymentNetwork> = {
  // ============================================
  // Ethereum
  // ============================================
  ethereum: {
    name: 'ethereum',
    chainId: 1,
    rpcUrl: 'https://eth.public-rpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    currencySymbol: 'ETH',
    displayName: 'Ethereum Mainnet',
    color: '#627EEA',
    isMainnet: true,
  },
  sepolia: {
    name: 'sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    currencySymbol: 'SepoliaETH',
    displayName: 'Sepolia Testnet',
    color: '#FF8C00',
    isMainnet: false,
  },

  // ============================================
  // Polygon (本番 + テストネット)
  // ============================================
  polygon: {
    name: 'polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    currencySymbol: 'MATIC',
    displayName: 'Polygon Mainnet',
    color: '#8247E5',
    isMainnet: true,
  },
  'polygon-amoy': {
    name: 'polygon-amoy',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorerUrl: 'https://amoy.polygonscan.com',
    currencySymbol: 'POL',
    displayName: 'Polygon Amoy Testnet',
    color: '#A29EE3',
    isMainnet: false,
  },

  // ============================================
  // Arbitrum (本番 + テストネット)
  // ============================================
  arbitrum: {
    name: 'arbitrum',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    currencySymbol: 'ETH',
    displayName: 'Arbitrum One Mainnet',
    color: '#28A0F0',
    isMainnet: true,
  },
  'arbitrum-sepolia': {
    name: 'arbitrum-sepolia',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorerUrl: 'https://sepolia.arbiscan.io',
    currencySymbol: 'ETH',
    displayName: 'Arbitrum Sepolia Testnet',
    color: '#1A9EFF',
    isMainnet: false,
  },
};

/**
 * ChainID からネットワーク名を取得
 */
export function getNetworkFromChainId(chainId: number): NetworkType | null {
  const entry = Object.entries(SUPPORTED_NETWORKS).find(
    ([_, network]) => network.chainId === chainId
  );
  return entry ? (entry[0] as NetworkType) : null;
}

/**
 * ネットワーク情報を取得
 */
export function getNetworkInfo(network: NetworkType): PaymentNetwork {
  return SUPPORTED_NETWORKS[network];
}

/**
 * QRコード文字列をパース
 */
export function parseQRCodeData(qrString: string): PaymentQRData | null {
  try {
    // ethereum: 形式: ethereum:0xaddress?amount=100&network=sepolia
    if (qrString.startsWith('ethereum:')) {
      const url = new URL(qrString.replace('ethereum:', 'https://dummy/'));
      const address = url.pathname as `0x${string}`;
      const amount = url.searchParams.get('amount') || undefined;
      const network = (url.searchParams.get('network') as NetworkType) || 'ethereum';
      const chainId = SUPPORTED_NETWORKS[network]?.chainId;

      return {
        type: 'ethereum',
        address,
        amount,
        network,
        chainId,
      };
    }

    // jpyc: 形式: jpyc:0xaddress?amount=100&network=sepolia
    if (qrString.startsWith('jpyc:')) {
      const url = new URL(qrString.replace('jpyc:', 'https://dummy/'));
      const address = url.pathname as `0x${string}`;
      const amount = url.searchParams.get('amount') || undefined;
      const network = (url.searchParams.get('network') as NetworkType) || 'ethereum';
      const chainId = SUPPORTED_NETWORKS[network]?.chainId;

      return {
        type: 'jpyc',
        address,
        amount,
        network,
        chainId,
      };
    }

    // payment: 形式: payment:0xaddress?amount=100&network=sepolia&memo=xxx
    if (qrString.startsWith('payment:')) {
      const url = new URL(qrString.replace('payment:', 'https://dummy/'));
      const address = url.pathname as `0x${string}`;
      const amount = url.searchParams.get('amount') || undefined;
      const network = (url.searchParams.get('network') as NetworkType) || 'ethereum';
      const memo = url.searchParams.get('memo') || undefined;
      const chainId = SUPPORTED_NETWORKS[network]?.chainId;

      return {
        type: 'payment',
        address,
        amount,
        network,
        memo,
        chainId,
      };
    }

    // sbt-payment: 形式
    if (qrString.startsWith('sbt-payment:')) {
      const url = new URL(qrString.replace('sbt-payment:', 'https://dummy/'));
      const address = url.pathname as `0x${string}`;
      const amount = url.searchParams.get('amount') || undefined;
      const network = (url.searchParams.get('network') as NetworkType) || 'ethereum';
      const sbtRequired = url.searchParams.get('sbt')?.split(',') || [];
      const minimumSBTRank = (url.searchParams.get('sbt-rank') as any) || undefined;
      const chainId = SUPPORTED_NETWORKS[network]?.chainId;

      return {
        type: 'sbt-payment',
        address,
        amount,
        network,
        chainId,
        sbtRequired,
        minimumSBTRank,
      };
    }

    return null;
  } catch (error) {
    console.error('QR code parsing error:', error);
    return null;
  }
}

/**
 * ネットワーク検証
 */
export function validateNetwork(
  currentChainId: number,
  requiredNetwork: NetworkType
): NetworkValidationResult {
  const requiredChainId = SUPPORTED_NETWORKS[requiredNetwork].chainId;
  const currentNetwork = getNetworkFromChainId(currentChainId);

  const isValid = currentChainId === requiredChainId;
  const mismatch = !isValid;

  return {
    isValid,
    currentNetwork: currentNetwork || 'ethereum',
    requiredNetwork,
    mismatch,
    message: isValid
      ? `✅ ネットワークが正しく設定されています (${SUPPORTED_NETWORKS[requiredNetwork].displayName})`
      : `⚠️ ネットワークが異なります。現在: ${currentNetwork ? SUPPORTED_NETWORKS[currentNetwork].displayName : '不明'}, 必要: ${SUPPORTED_NETWORKS[requiredNetwork].displayName}`,
    action: isValid ? undefined : 'switch-network',
  };
}

/**
 * QRコードデータからネットワーク検証
 */
export function validatePaymentNetwork(
  currentChainId: number,
  qrData: PaymentQRData
): NetworkValidationResult {
  if (!qrData.network) {
    // ネットワーク指定がない場合は現在のネットワークを使用
    return {
      isValid: true,
      currentNetwork: getNetworkFromChainId(currentChainId) || 'ethereum',
      requiredNetwork: 'ethereum',
      mismatch: false,
      message: 'ネットワーク指定なし - 現在のネットワークで実行',
    };
  }

  return validateNetwork(currentChainId, qrData.network);
}

/**
 * QRコード生成用URL作成（支払い用）
 */
export function createPaymentQRCode(
  address: `0x${string}`,
  amount?: string,
  network: NetworkType = 'ethereum',
  memo?: string
): string {
  const params = new URLSearchParams();
  if (amount) params.append('amount', amount);
  params.append('network', network);
  if (memo) params.append('memo', memo);

  const queryString = params.toString();
  return `payment:${address}${queryString ? '?' + queryString : ''}`;
}

/**
 * QRコード生成用URL作成（SBT支払い用）
 */
export function createSBTPaymentQRCode(
  address: `0x${string}`,
  amount?: string,
  network: NetworkType = 'ethereum',
  sbtRequired?: string[],
  minimumRank?: 'bronze' | 'silver' | 'gold' | 'platinum'
): string {
  const params = new URLSearchParams();
  if (amount) params.append('amount', amount);
  params.append('network', network);
  if (sbtRequired?.length) params.append('sbt', sbtRequired.join(','));
  if (minimumRank) params.append('sbt-rank', minimumRank);

  const queryString = params.toString();
  return `sbt-payment:${address}${queryString ? '?' + queryString : ''}`;
}

/**
 * ネットワークカラーを取得
 */
export function getNetworkColor(network: NetworkType): string {
  return SUPPORTED_NETWORKS[network].color;
}

/**
 * ネットワーク表示名を取得
 */
export function getNetworkDisplayName(network: NetworkType): string {
  return SUPPORTED_NETWORKS[network].displayName;
}
