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
    console.log('Parsing QR code:', qrString);
    
    // 空文字チェック
    if (!qrString || qrString.trim() === '') {
      console.log('Empty QR code string');
      return null;
    }
    
    const trimmed = qrString.trim();
    
    // 1. JSON形式（カスタムJPYC形式、店舗QRコードなど）
    if (trimmed.startsWith('{')) {
      try {
        const data = JSON.parse(trimmed);
        console.log('Parsed JSON data:', data);
        
        // 統一JPYC決済形式（推奨）
        if (data.type === 'JPYC_PAYMENT') {
          return {
            type: 'jpyc',
            address: data.to as `0x${string}`,
            amount: data.amount,
            network: (data.network as NetworkType) || 'sepolia',
            chainId: data.chainId || SUPPORTED_NETWORKS[data.network as NetworkType]?.chainId,
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.merchant?.name,
            shopId: data.merchant?.id,
            memo: data.merchant?.description,
            timestamp: data.timestamp,
            expiresAt: data.expires,
            tokenSymbol: data.network?.includes('fuji') ? 'tJPYC' : 'JPYC', // ネットワークから自動判別
          };
        }

        // 廃止予定: カスタムtJPYC決済対応（JPYC_PAYMENTに統合予定）
        if (data.type === 'tJPYC_PAYMENT') {
          console.warn('tJPYC_PAYMENT format is deprecated. Please use JPYC_PAYMENT with network specified.');
          return {
            type: 'tjpyc',
            address: data.to as `0x${string}`,
            amount: data.amount,
            network: (data.network as NetworkType) || 'avalanche-fuji',
            chainId: data.chainId || SUPPORTED_NETWORKS[data.network as NetworkType]?.chainId,
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.merchant?.name,
            shopId: data.merchant?.id,
            memo: data.merchant?.description,
            timestamp: data.timestamp,
            expiresAt: data.expires,
            tokenSymbol: 'tJPYC',
          };
        }
        
        // 従来の店舗QRコード形式（スクリーンショットのデータに対応）
        if (data.type === 'payment' && (data.shopWallet || data.shopId)) {
          const amountInJPYC = data.amount ? 
            (BigInt(data.amount) / BigInt(10 ** 18)).toString() : 
            undefined;
          
          return {
            type: 'payment',
            address: (data.shopWallet || data.to) as `0x${string}`,
            amount: amountInJPYC,
            chainId: data.chainId || 11155111, // Default to Sepolia
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.shopName,
            shopId: data.shopId,
            paymentId: data.paymentId,
            expiresAt: data.expiresAt,
            memo: data.description || data.shopName,
            network: 'sepolia' as NetworkType,
          };
        }
        
        // スクリーンショットのような新しいJPYC Pay形式
        if (data.shopId && data.shopName && data.amount && data.contractAddress) {
          const amountInJPYC = data.amount ? 
            (BigInt(data.amount) / BigInt(10 ** 18)).toString() : 
            undefined;
          
          return {
            type: 'payment',
            address: (data.shopWallet || data.to || '0x0000000000000000000000000000000000000000') as `0x${string}`,
            amount: amountInJPYC,
            chainId: data.chainId || (data.chainId === 137 ? 137 : 11155111),
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.shopName,
            shopId: data.shopId,
            paymentId: data.paymentId || `pay_${Date.now()}`,
            expiresAt: data.expiresAt,
            memo: data.description || `Payment from ${data.shopName}`,
            network: (data.chainId === 137 ? 'polygon' : 'sepolia') as NetworkType,
          };
        }
        
        // 新しい店舗QRコード形式 (shopWalletの代わりに他フィールド)
        if (data.type === 'payment' && !data.shopWallet) {
          // スクリーンショットのような形式に対応
          const shopWallet = data.shopWallet || data.address || data.to;
          if (!shopWallet) {
            console.log('No wallet address found in payment QR');
            return null;
          }
          
          const amountInJPYC = data.amount ? 
            (BigInt(data.amount) / BigInt(10 ** 18)).toString() : 
            undefined;
          
          return {
            type: 'payment',
            address: shopWallet as `0x${string}`,
            amount: amountInJPYC,
            chainId: data.chainId,
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.shopName || 'Unknown Shop',
            shopId: data.shopId,
            paymentId: data.paymentId,
            expiresAt: data.expiresAt,
            memo: data.description || data.shopName || 'Payment',
          };
        }
        
        // スクリーンショットの形式 (version, shopId, shopName, shopWallet, amount, currency, chainId, paymentId, expiresAt, contractAddress, description)
        if (data.version && data.shopId && data.shopName && data.shopWallet) {
          const amountInJPYC = data.amount ? 
            (BigInt(data.amount) / BigInt(10 ** 18)).toString() : 
            undefined;
          
          return {
            type: 'payment',
            address: data.shopWallet as `0x${string}`,
            amount: amountInJPYC,
            chainId: data.chainId,
            contractAddress: data.contractAddress as `0x${string}`,
            shopName: data.shopName,
            shopId: data.shopId,
            paymentId: data.paymentId,
            expiresAt: data.expiresAt,
            memo: data.description || data.shopName,
          };
        }
        
        // その他のJSON形式も柔軟に対応
        if (data.address || data.to) {
          return {
            type: 'payment',
            address: (data.address || data.to) as `0x${string}`,
            amount: data.amount,
            network: (data.network as NetworkType) || 'ethereum',
            chainId: data.chainId,
            contractAddress: data.contractAddress as `0x${string}`,
            memo: data.memo || data.description || data.note,
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
        
        // ethereum:0xaddress@chainId/transfer?address=recipient&uint256=amount の形式も対応
        const eip681Match = trimmed.match(/^ethereum:([^@?/]+)(?:@(\d+))?(?:\/([^?]+))?(?:\?(.+))?$/);
        if (eip681Match) {
          const [, address, chainIdStr, functionName, paramStr] = eip681Match;
          const params = new URLSearchParams(paramStr || '');
          
          console.log('📋 Parsed EIP-681:', {
            address,
            chainId: chainIdStr,
            functionName,
            params: Object.fromEntries(params.entries())
          });
          
          const chainId = chainIdStr ? parseInt(chainIdStr) : undefined;
          const network = chainId ? getNetworkFromChainId(chainId) || 'ethereum' : 'ethereum';
          
          // ERC-20 transfer関数の場合
          if (functionName === 'transfer') {
            // アドレスパラメータの取得（複数の形式に対応）
            const recipient = params.get('address') || params.get('to') || params.get('recipient');
            
            // 金額パラメータの取得（複数の形式に対応）
            const amount = params.get('uint256') || 
                          params.get('value') || 
                          params.get('amount') ||
                          params.get('uint') ||
                          // パラメータ名なし（最初の値）の場合も対応
                          Array.from(params.values())[0];
            
            console.log('💰 EIP-681 transfer detected:', { 
              contractAddress: address, 
              recipient, 
              amount,
              allParams: Object.fromEntries(params.entries()),
              amountInJPYC: amount ? (BigInt(amount) / BigInt(10 ** 18)).toString() : '0'
            });
            
            return {
              type: 'jpyc',
              address: (recipient || address) as `0x${string}`,
              amount: amount || undefined,
              network,
              chainId: chainId || SUPPORTED_NETWORKS[network]?.chainId,
              contractAddress: address as `0x${string}`,
            };
          }
          
          // dataパラメータがある場合（encoded transfer function）
          const dataParam = params.get('data');
          if (dataParam && dataParam.startsWith('0xa9059cbb')) {
            // 0xa9059cbb = transfer(address,uint256)の関数シグネチャ
            // 次の64文字 = 受取人アドレス（32バイトパディング）
            // 次の64文字 = 金額（Wei単位、32バイトパディング）
            const recipient = '0x' + dataParam.substring(34, 74); // 10 + 24 + 40
            const amountHex = dataParam.substring(74, 138); // 64文字
            const amount = BigInt('0x' + amountHex).toString();
            
            console.log('💰 EIP-681 data parameter detected:', {
              contractAddress: address,
              recipient,
              amount,
              amountInJPYC: (BigInt(amount) / BigInt(10 ** 18)).toString()
            });
            
            return {
              type: 'jpyc',
              address: recipient as `0x${string}`,
              amount,
              network,
              chainId: chainId || SUPPORTED_NETWORKS[network]?.chainId,
              contractAddress: address as `0x${string}`,
            };
          }
          
          // 通常のETH送金の場合（function_nameなし）
          const value = params.get('value');
          const amount = value || undefined;
          
          console.log('💵 EIP-681 native payment:', { address, amount, network });
          
          return {
            type: 'ethereum',
            address: address as `0x${string}`,
            amount,
            network,
            chainId: chainId || SUPPORTED_NETWORKS[network]?.chainId,
          };
        }
        
        // フォールバック: URLパース
        const url = new URL(trimmed.replace('ethereum:', 'https://dummy/'));
        const address = url.pathname as `0x${string}`;
        const amount = url.searchParams.get('amount') || url.searchParams.get('value') || undefined;
        const network = (url.searchParams.get('network') as NetworkType) || 'ethereum';
        const chainId = SUPPORTED_NETWORKS[network]?.chainId;

        return {
          type: 'ethereum',
          address,
          amount,
          network,
          chainId,
        };
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

    // 4. jpyc: 形式: jpyc:address?amount=100&network=sepolia
    if (trimmed.startsWith('jpyc:')) {
      try {
        const url = new URL(trimmed.replace('jpyc:', 'https://dummy/'));
        const address = url.pathname as `0x${string}`;
        const amount = url.searchParams.get('amount') || undefined;
        const network = (url.searchParams.get('network') as NetworkType) || 'sepolia';
        const chainId = SUPPORTED_NETWORKS[network]?.chainId;

        return {
          type: 'jpyc',
          address,
          amount,
          network,
          chainId,
          contractAddress: url.searchParams.get('contract') as `0x${string}` || undefined,
        };
      } catch (jpycError) {
        console.error('JPYC parsing failed:', jpycError);
      }
    }

    // 5. payment: 形式
    if (trimmed.startsWith('payment:')) {
      try {
        const url = new URL(trimmed.replace('payment:', 'https://dummy/'));
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
      } catch (paymentError) {
        console.error('Payment parsing failed:', paymentError);
      }
    }

    // 7. tjpyc: 形式: tjpyc:address?amount=100&network=avalanche-fuji
    if (trimmed.startsWith('tjpyc:')) {
      try {
        const url = new URL(trimmed.replace('tjpyc:', 'https://dummy/'));
        const address = url.pathname as `0x${string}`;
        const amount = url.searchParams.get('amount') || undefined;
        const network = (url.searchParams.get('network') as NetworkType) || 'avalanche-fuji';
        const chainId = SUPPORTED_NETWORKS[network]?.chainId;

        return {
          type: 'tjpyc',
          address,
          amount,
          network,
          chainId,
          contractAddress: url.searchParams.get('contract') as `0x${string}` || undefined,
          tokenSymbol: 'tJPYC',
        };
      } catch (tjpycError) {
        console.error('tJPYC parsing failed:', tjpycError);
      }
    }

    // 8. sbt-payment: 形式
    if (trimmed.startsWith('sbt-payment:')) {
      try {
        const url = new URL(trimmed.replace('sbt-payment:', 'https://dummy/'));
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
      } catch (sbtError) {
        console.error('SBT payment parsing failed:', sbtError);
      }
    }

    // 8. WalletConnect URI（一般的）
    if (trimmed.startsWith('wc:')) {
      console.log('WalletConnect URI detected but not supported for payments');
      return null;
    }

    // 9. Coinbase Wallet URI
    if (trimmed.startsWith('https://go.cb-w.com/dapp')) {
      try {
        const url = new URL(trimmed);
        const cbUrl = decodeURIComponent(url.searchParams.get('cb_url') || '');
        if (cbUrl.startsWith('ethereum:')) {
          // Coinbase WrappedのEthereum URIを再帰的にパース
          return parseQRCodeData(cbUrl);
        }
      } catch (coinbaseError) {
        console.error('Coinbase Wallet parsing failed:', coinbaseError);
      }
    }

    // 10. Rainbow Wallet URI
    if (trimmed.startsWith('rainbow://')) {
      try {
        const ethereumUri = trimmed.replace('rainbow://', '');
        if (ethereumUri.startsWith('ethereum:')) {
          return parseQRCodeData(ethereumUri);
        }
      } catch (rainbowError) {
        console.error('Rainbow Wallet parsing failed:', rainbowError);
      }
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
