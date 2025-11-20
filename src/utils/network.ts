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
  // Avalanche (本番 + テストネット)
  // ============================================
  avalanche: {
    name: 'avalanche',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://snowtrace.io',
    currencySymbol: 'AVAX',
    displayName: 'Avalanche C-Chain',
    color: '#E84142',
    isMainnet: true,
  },
  'avalanche-fuji': {
    name: 'avalanche-fuji',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://testnet.snowtrace.io',
    currencySymbol: 'AVAX',
    displayName: 'Avalanche Fuji Testnet',
    color: '#FF6B6B',
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
 * QRコード文字列をパース（改善版）
 */
export function parseQRCodeData(qrString: string): PaymentQRData | null {
  try {
    console.log('🔍 Parsing QR code:', qrString);
    
    // 空文字チェック
    if (!qrString || qrString.trim() === '') {
      console.error('❌ Empty QR code string');
      return null;
    }
    
    const trimmed = qrString.trim();
    
    // 1. JSON形式（カスタムJPYC形式、店舗QRコードなど）
    if (trimmed.startsWith('{')) {
      try {
        const data = JSON.parse(trimmed);
        console.log('✅ Parsed JSON data:', data);
        
        // ★ 独自規格: MASARU21_PAYMENT - amountは既にJPYC単位
        if (data.type === 'JPYC_PAYMENT' || data.type === 'MASARU21_PAYMENT') {
          console.log(`✅ Detected ${data.type} format`);
          const result = {
            type: 'jpyc' as const,
            address: data.to as `0x${string}`,
            amount: data.amount, // ★ 既にJPYC単位 - 変換不要
            network: (data.network as NetworkType) || 'sepolia',
            chainId: data.chainId || SUPPORTED_NETWORKS[data.network as NetworkType]?.chainId,
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.merchant?.name,
            shopId: data.merchant?.id,
            memo: data.merchant?.description,
            timestamp: data.timestamp,
            expiresAt: data.expires,
            tokenSymbol: 'JPYC',
          };
          console.log('✅ Parsed result:', result);
          return result;
        }

        // その他のJSON形式も同じ処理（シンプル化）
        // amount が存在する場合、それがJPYC単位かWei単位かを判定
        if (data.amount && data.contractAddress) {
          // amountが大きすぎる場合（18桁以上）はWei単位と判定して変換
          const amountStr = data.amount.toString();
          const isWeiUnit = amountStr.length > 10; // 10億以上はWei単位と判定
          
          const amountInJPYC = isWeiUnit 
            ? (BigInt(data.amount) / BigInt(10 ** 18)).toString()
            : data.amount.toString();
          
          const chainId = data.chainId || 11155111;
          const network = getNetworkFromChainId(chainId) || 'sepolia';
          
          return {
            type: 'payment',
            address: (data.shopWallet || data.to || data.address) as `0x${string}`,
            amount: amountInJPYC,
            chainId: chainId,
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.shopName || data.merchant?.name,
            shopId: data.shopId || data.merchant?.id,
            paymentId: data.paymentId,
            expiresAt: data.expiresAt || data.expires,
            memo: data.description || data.memo || data.merchant?.description,
            network: network,
          };
        }
        
      } catch (jsonError) {
        console.error('JSON parsing failed:', jsonError);
      }
    }

    // 2. EIP-681形式: ethereum:0xaddress[@chainId][/function_name][?parameters]
    if (trimmed.startsWith('ethereum:')) {
      try {
        console.log('🔍 EIP-681 format detected:', trimmed);
        
        const eip681Match = trimmed.match(/^ethereum:([^@?/]+)(?:@(\d+))?(?:\/([^?]+))?(?:\?(.+))?$/);
        if (eip681Match) {
          const [, address, chainIdStr, functionName, paramStr] = eip681Match;
          const params = new URLSearchParams(paramStr || '');
          
          const chainId = chainIdStr ? parseInt(chainIdStr) : undefined;
          const network = chainId ? getNetworkFromChainId(chainId) || 'ethereum' : 'ethereum';
          
          // ★ value パラメータ（Wei単位）を取得
          const valueWei = params.get('value');
          const amountInJPYC = valueWei 
            ? (BigInt(valueWei) / BigInt(10 ** 18)).toString()
            : undefined;
          
          return {
            type: 'ethereum',
            address: address as `0x${string}`,
            amount: amountInJPYC, // Wei→JPYC変換済み
            network,
            chainId: chainId || SUPPORTED_NETWORKS[network]?.chainId,
            contractAddress: address as `0x${string}`,
          };
        }
      } catch (eipError) {
        console.error('EIP-681 parsing failed:', eipError);
      }
    }

    // 3. 単純なアドレス形式: 0x...
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return {
        type: 'ethereum',
        address: trimmed as `0x${string}`,
        network: 'ethereum',
        chainId: SUPPORTED_NETWORKS.ethereum.chainId,
      };
    }

    console.log('Unknown QR code format:', trimmed);
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

  // JPYC対応ネットワークを拡張
  const validChainIds = [11155111, 80002, 137, 43113, 43114]; // Sepolia, Polygon Amoy, Polygon, Avalanche Fuji, Avalanche C-Chain
  const isValid = validChainIds.includes(currentChainId) || currentChainId === requiredChainId;
  const mismatch = !isValid;

  return {
    isValid,
    currentNetwork: currentNetwork || 'ethereum',
    requiredNetwork,
    mismatch,
    message: isValid
      ? `✅ ネットワークが正しく設定されています (${currentNetwork ? SUPPORTED_NETWORKS[currentNetwork].displayName : '不明'})`
      : `⚠️ ネットワークが異なります。現在: ${currentNetwork ? SUPPORTED_NETWORKS[currentNetwork].displayName : '不明'}, 推奨: JPYC対応ネットワーク`,
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
 * QRコード生成用URL作成（tJPYC支払い用）
 */
export function createTJPYCPaymentQRCode(
  address: `0x${string}`,
  amount?: string,
  network: NetworkType = 'avalanche-fuji',
  contractAddress?: `0x${string}`,
  memo?: string
): string {
  const params = new URLSearchParams();
  if (amount) params.append('amount', amount);
  params.append('network', network);
  if (contractAddress) params.append('contract', contractAddress);
  if (memo) params.append('memo', memo);

  const queryString = params.toString();
  return `tjpyc:${address}${queryString ? '?' + queryString : ''}`;
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
 * MetaMask/Trust Wallet対応のEIP-681形式QRコード生成
 */
export function createEIP681QRCode(
  address: `0x${string}`,
  amount?: string,
  network: NetworkType = 'ethereum',
  data?: string
): string {
  const networkInfo = getNetworkInfo(network);
  const chainId = networkInfo?.chainId;
  
  let url = `ethereum:${address}`;
  if (chainId) {
    url += `@${chainId}`;
  }
  
  const params = new URLSearchParams();
  if (amount) {
    // ETH単位からWei単位に変換
    const weiAmount = (BigInt(amount) * BigInt(10 ** 18)).toString();
    params.append('value', weiAmount);
  }
  if (data) params.append('data', data);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

/**
 * Coinbase Wallet対応のディープリンク生成
 */
export function createCoinbaseWalletQRCode(
  address: `0x${string}`,
  amount?: string,
  network: NetworkType = 'ethereum'
): string {
  const eip681Uri = createEIP681QRCode(address, amount, network);
  const encodedUri = encodeURIComponent(eip681Uri);
  return `https://go.cb-w.com/dapp?cb_url=${encodedUri}`;
}

/**
 * Rainbow Wallet対応のディープリンク生成
 */
export function createRainbowWalletQRCode(
  address: `0x${string}`,
  amount?: string,
  network: NetworkType = 'ethereum'
): string {
  const eip681Uri = createEIP681QRCode(address, amount, network);
  return `rainbow://${eip681Uri}`;
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

/**
 * QRコードデータを自動判別（拡張版）
 */
export function detectQRCodeFormat(qrString: string): string {
  if (!qrString) return 'unknown';
  
  const trimmed = qrString.trim();
  
  if (trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed);
      if (data.type === 'MASARU21_PAYMENT') return 'masaru21 Payment (Unified)';
      if (data.type === 'JPYC_PAYMENT') return 'JPYC Payment v2';
      if (data.type === 'payment') return 'Shop Payment';
      if (data.shopWallet) return 'Shop QR Code';
      return 'JSON Format';
    } catch {
      return 'Invalid JSON';
    }
  }
  
  if (trimmed.startsWith('ethereum:')) return 'EIP-681 (Ethereum)';
  if (trimmed.startsWith('jpyc:')) return 'JPYC Custom';
  if (trimmed.startsWith('tjpyc:')) return 'tJPYC Custom';
  if (trimmed.startsWith('payment:')) return 'Payment URL';
  if (trimmed.startsWith('sbt-payment:')) return 'SBT Payment';
  if (trimmed.startsWith('wc:')) return 'WalletConnect';
  if (trimmed.startsWith('https://go.cb-w.com/dapp')) return 'Coinbase Wallet';
  if (trimmed.startsWith('rainbow://')) return 'Rainbow Wallet';
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return 'Ethereum Address';
  
  return 'Unknown Format';
}

/**
 * QRコードの形式詳細を表示
 */
export function describeQRCodeFormat(qrString: string): string {
  const format = detectQRCodeFormat(qrString);
  
  switch (format) {
    case 'masaru21 Payment (Unified)':
      return 'masaru21決済（統一標準）- テスト・本番統一の推奨形式';
    case 'JPYC Payment v2':
      return 'JPYC決済（新版）- 店舗情報付きの高機能決済QRコード';
    case 'Shop Payment':
    case 'Shop QR Code':
      return 'JPYC店舗QRコード - 店舗固有の決済用QRコード';
    case 'EIP-681 (Ethereum)':
      return 'Ethereum標準（EIP-681）- MetaMask・Trust Wallet等で対応';
    case 'JPYC Custom':
      return 'JPYC独自形式 - JPYCアプリ専用QRコード';
    case 'tJPYC Custom':
      return 'tJPYCカスタム形式 - テスト用JPYC専用QRコード';
    case 'Payment URL':
      return '汎用決済URL - 複数の決済方法に対応';
    case 'SBT Payment':
      return 'SBT決済 - SBT保有者限定の特別決済';
    case 'WalletConnect':
      return 'WalletConnect - ウォレット接続（決済不可）';
    case 'Coinbase Wallet':
      return 'Coinbase Wallet - Coinbase専用ディープリンク';
    case 'Rainbow Wallet':
      return 'Rainbow Wallet - Rainbow専用ディープリンク';
    case 'Ethereum Address':
      return 'Ethereumアドレス - シンプルな送金用アドレス';
    default:
      return '未対応形式 - この形式は現在サポートされていません';
  }
}
