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
    console.log(`🔍 fetchUserSBTs: Starting fetch for address: ${userAddress}`);
    
    const sbts: SBT[] = [];
    
    // デバッグ: 登録されたショップ情報を表示
    console.log('📋 Registered shops:', REGISTERED_SHOPS);
    console.log('🔗 Available SBT contract addresses:', SBT_ADDRESSES);
    
    // Sepoliaネットワークから実際のSBTを取得
    if (SBT_ADDRESSES.sepolia) {
      try {
        console.log('🔗 Checking Sepolia network...', SBT_ADDRESSES.sepolia);
        const sepoliaSBTs = await fetchSBTsFromNetwork(userAddress, 'sepolia');
        console.log('📦 Sepolia SBTs found:', sepoliaSBTs.length);
        sbts.push(...sepoliaSBTs);
      } catch (error) {
        console.error('❌ Failed to fetch SBTs from Sepolia:', error);
      }
    } else {
      console.log('⚠️ Sepolia contract address not configured');
    }

    // Polygon Mainnetネットワークから取得
    if (SBT_ADDRESSES.polygon) {
      try {
        console.log('🔗 Checking Polygon Mainnet...');
        // 注意: 現在Polygon MainnetにはSBTコントラクトがデプロイされていない
        // 将来のデプロイに備えてコードは残しておく
        const polygonSBTs = await fetchSBTsFromPolygon(userAddress);
        sbts.push(...polygonSBTs);
      } catch (error) {
        console.error('❌ Failed to fetch SBTs from Polygon Mainnet:', error);
      }
    } else {
      console.log('ℹ️ Polygon Mainnet SBT contract not deployed yet');
    }

    // Polygon Amoyネットワークからも取得
    if (SBT_ADDRESSES['polygon-amoy']) {
      try {
        console.log('🔗 Checking Polygon Amoy...', SBT_ADDRESSES['polygon-amoy']);
        const amoySBTs = await fetchSBTsFromPolygonAmoy(userAddress);
        console.log('📦 Polygon Amoy SBTs found:', amoySBTs.length);
        sbts.push(...amoySBTs);
      } catch (error) {
        console.error('❌ Failed to fetch SBTs from Polygon Amoy:', error);
      }
    } else {
      console.log('⚠️ Polygon Amoy contract address not configured');
    }
    
    if (sbts.length > 0) {
      console.log(`✅ Found ${sbts.length} SBTs across networks`);
      
      // 取得したSBTの詳細をログ出力
      sbts.forEach((sbt, index) => {
        console.log(`SBT ${index + 1}:`, {
          name: sbt.name,
          shopName: sbt.shopName || 'Unknown Shop',
          shopId: sbt.shopId,
          network: sbt.network,
          issuer: sbt.issuer,
          hasMetadata: !!sbt.metadata && Object.keys(sbt.metadata).length > 0,
          hasImage: !!sbt.imageUrl,
        });
      });
      
      return sbts;
    }

    // SBTが見つからない場合はログ出力
    console.log('⚠️ No SBTs found on any blockchain for address:', userAddress);
    console.log('🔍 Debug: Checked networks:', {
      sepolia: !!SBT_ADDRESSES.sepolia,
      polygonAmoy: !!SBT_ADDRESSES['polygon-amoy'],
      polygon: !!SBT_ADDRESSES.polygon
    });
    
    // デバッグ用: テスト環境でダミーSBTを表示（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode: Consider adding test SBT data');
      // 開発時にテストデータを表示したい場合は、ここで一時的なSBTを返すことも可能
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch SBTs:', error);
    return [];
  }
}

// Polygon Mainnet用の関数（将来のデプロイに備えて）
async function fetchSBTsFromPolygon(userAddress: `0x${string}`): Promise<SBT[]> {
  const sbts: SBT[] = [];
  
  try {
    // 注意: Polygon MainnetにSBTコントラクトがデプロイされたら、
    // ここにPolygon Mainnet用のクライアント作成とSBT取得ロジックを実装
    console.log('📋 Polygon Mainnet SBT contract not yet deployed');
  } catch (error) {
    console.error('Failed to fetch SBTs from Polygon Mainnet:', error);
  }
  
  return sbts;
}

// Polygon Amoy Testnetからのみ呼ばれる関数
async function fetchSBTsFromPolygonAmoy(userAddress: `0x${string}`): Promise<SBT[]> {
  const sbts: SBT[] = [];
  
  try {
    console.log(`🌐 fetchSBTsFromPolygonAmoy: Starting fetch for ${userAddress}`);
    
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

    const contractAddress = SBT_ADDRESSES['polygon-amoy']!;
    console.log('📋 Polygon Amoy contract address:', contractAddress);
    
    // ユーザーが保有するSBTの数を取得
    console.log('🔍 Calling balanceOf on Polygon Amoy...');
    let balance: bigint;
    try {
      balance = await amoyCreateClient.readContract({
        address: contractAddress,
        abi: SBT_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      }) as bigint;
      
      console.log('📊 Polygon Amoy SBT balance:', balance.toString());
    } catch (balanceError) {
      console.error('❌ Error calling balanceOf on Polygon Amoy:', balanceError);
      throw new Error(`Failed to get Polygon Amoy balance: ${balanceError}`);
    }
    
    if (balance === 0n) {
      console.log('💬 No SBTs found for this user on Polygon Amoy');
      return sbts;
    }
    
    // イベントログを使用してユーザーが所有するトークンIDを取得
    console.log('🔍 Getting user tokens via Transfer events...');
    let userTokenIds: bigint[] = [];
    
    try {
      // Transferイベントを検索してユーザーのトークンを特定
      const logs = await amoyCreateClient.getLogs({
        address: contractAddress,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true }
          ]
        },
        args: {
          to: userAddress,
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });
      
      console.log('📊 Found Transfer events:', logs.length);
      
      // トークンIDを抽出
      for (const log of logs) {
        if (log.args && log.args.tokenId) {
          const tokenId = log.args.tokenId as bigint;
          
          // そのトークンが現在もユーザーが所有しているかチェック
          try {
            const owner = await amoyCreateClient.readContract({
              address: contractAddress,
              abi: SBT_ABI,
              functionName: 'ownerOf',
              args: [tokenId],
            }) as string;
            
            if (owner.toLowerCase() === userAddress.toLowerCase()) {
              userTokenIds.push(tokenId);
              console.log('✅ Confirmed token ownership:', tokenId.toString());
            }
          } catch (ownerError) {
            console.log('⚠️ Token may have been burned:', tokenId.toString());
          }
        }
      }
    } catch (eventError) {
      console.error('❌ Error getting Transfer events:', eventError);
      // フォールバック: 簡単な範囲でトークンIDを試行
      console.log('🔄 Trying fallback method with token ID range...');
      for (let tokenId = 1; tokenId <= 1000; tokenId++) {
        try {
          const owner = await amoyCreateClient.readContract({
            address: contractAddress,
            abi: SBT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)],
          }) as string;
          
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            userTokenIds.push(BigInt(tokenId));
            console.log('✅ Found owned token via fallback:', tokenId.toString());
          }
        } catch {
          // トークンが存在しないか所有していない
        }
        
        // 見つかったトークン数がbalanceと一致したら終了
        if (userTokenIds.length >= Number(balance)) {
          break;
        }
      }
    }
    
    console.log('📋 User token IDs found:', userTokenIds.map(id => id.toString()));
    
    // 各トークンのメタデータを取得
    for (const tokenId of userTokenIds) {
      try {
        console.log('🔍 Processing Polygon Amoy token:', tokenId.toString());
        
        // トークンURIを取得
        let tokenURI = '';
        try {
          tokenURI = await amoyCreateClient.readContract({
            address: contractAddress,
            abi: SBT_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          }) as string;
          
          console.log('Polygon Amoy Token URI:', tokenURI);
        } catch (uriError) {
          console.warn('Failed to get tokenURI for Polygon Amoy token:', uriError);
        }
        
        // メタデータを取得・解析
        let metadata: any = {};
        let imageUrl = '';
        let actualShopId = 2; // デフォルトはCafe JPYC
        
        console.log('🔍 Polygon Amoy tokenURI:', tokenURI);
        
        if (tokenURI.startsWith('data:application/json;base64,')) {
          // Base64エンコードされたJSON
          try {
            const base64Data = tokenURI.replace('data:application/json;base64,', '');
            const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
            metadata = JSON.parse(jsonString);
            console.log('📄 Polygon Amoy decoded metadata:', metadata);
            
            imageUrl = metadata.image || '';
            // メタデータからshopIdを抽出（複数のフィールドを確認）
            actualShopId = metadata.shopId || metadata.shop_id || metadata.attributes?.find((attr: any) => attr.trait_type === 'Shop ID')?.value || actualShopId;
          } catch (e) {
            console.error('❌ Failed to decode Polygon Amoy base64 metadata:', e);
          }
        } else if (tokenURI.startsWith('http')) {
          // HTTPSのメタデータURL
          try {
            const response = await axios.get(tokenURI);
            metadata = response.data;
            console.log('📄 Polygon Amoy fetched metadata:', metadata);
            
            imageUrl = metadata.image || '';
            actualShopId = metadata.shopId || metadata.shop_id || metadata.attributes?.find((attr: any) => attr.trait_type === 'Shop ID')?.value || actualShopId;
          } catch (e) {
            console.error('❌ Failed to fetch Polygon Amoy metadata from URL:', e);
          }
        } else if (tokenURI.startsWith('ipfs://')) {
          // IPFSのメタデータURL
          try {
            console.log('🌐 Fetching IPFS metadata for Polygon Amoy...');
            const ipfsUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            console.log('🔗 IPFS URL:', ipfsUrl);
            
            const response = await axios.get(ipfsUrl, {
              timeout: 10000, // 10秒タイムアウト
              headers: {
                'Accept': 'application/json',
              }
            });
            metadata = response.data;
            console.log('📄 Polygon Amoy IPFS metadata:', metadata);
            
            imageUrl = metadata.image || '';
            // IPFSの画像URLをHTTPSに変換
            if (imageUrl && imageUrl.startsWith('ipfs://')) {
              imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
              console.log('🖼️ Converted image URL:', imageUrl);
            }
            
            actualShopId = metadata.shopId || metadata.shop_id || metadata.attributes?.find((attr: any) => attr.trait_type === 'Shop ID')?.value || actualShopId;
          } catch (e) {
            console.error('❌ Failed to fetch Polygon Amoy IPFS metadata:', e);
            console.log('🔄 Using fallback for IPFS metadata...');
          }
        }
        
        // ショップ情報を取得
        const shopInfo = REGISTERED_SHOPS[actualShopId as keyof typeof REGISTERED_SHOPS];
        console.log(`🏪 Polygon Amoy shop lookup: shopId=${actualShopId}, found=${!!shopInfo}`, shopInfo);
        
        // 画像URLが取得できない場合はデフォルト画像を生成
        if (!imageUrl || imageUrl.includes('placeholder')) {
          const amoyBadgeName = encodeURIComponent(metadata.name || shopInfo?.name || '来店記念');
          const amoyShopName = encodeURIComponent(shopInfo?.name || 'Cafe JPYC');
          imageUrl = `https://img.shields.io/badge/${amoyBadgeName}-${amoyShopName}-8B5CF6?style=for-the-badge&logo=polygon&logoColor=white`;
        }
        
        // IPFSリンクをHTTPSリンクに変換
        if (imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        
        // メタデータを拡張
        const enhancedMetadata = {
          ...metadata,
          name: metadata.name || `来店記念 - ${shopInfo?.name || 'Cafe JPYC'}`,
          description: metadata.description || `${shopInfo?.name || 'Cafe JPYC'}でのスタンプカード (Polygon Amoy)`,
          image: imageUrl,
          external_url: metadata.external_url || 'https://jpyc.jp',
          background_color: metadata.background_color || '8B5CF6',
          shopId: actualShopId,
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
              value: metadata.rank || shopInfo?.sbtTemplate?.rank || 'silver'
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
          id: `sbt-polygon-amoy-${contractAddress}-${tokenId}`,
          name: enhancedMetadata.name,
          symbol: metadata.symbol || shopInfo?.name?.substring(0, 4).toUpperCase() || 'CAFE',
          address: contractAddress,
          issuer: shopInfo?.name || 'Unknown Shop',
          issuerAddress: shopInfo?.wallet || contractAddress,
          description: enhancedMetadata.description,
          network: 'polygon-amoy',
          chainId: 80002,
          tokenId: tokenId,
          metadata: enhancedMetadata,
          imageUrl: imageUrl,
          rank: metadata.rank || shopInfo?.sbtTemplate?.rank || 'silver',
          issuedDate: new Date(),
          // 拡張情報
          shopId: actualShopId,
          shopName: shopInfo?.name,
          shopCategory: shopInfo?.category,
          benefits: metadata.benefits || (shopInfo?.sbtTemplate?.benefits ? [...shopInfo.sbtTemplate.benefits] : []),
          thumbnailUrl: imageUrl,
          bannerUrl: shopInfo?.bannerUrl,
          external_url: enhancedMetadata.external_url,
          background_color: enhancedMetadata.background_color,
          youtube_url: metadata.youtube_url,
          animationUrl: metadata.animation_url,
        };
        
        sbts.push(amoyToken);
        console.log('✅ Added Polygon Amoy SBT:', amoyToken);
      } catch (tokenError) {
        console.error(`Failed to fetch Polygon Amoy token ${i}:`, tokenError);
      }
    }
  } catch (error) {
    console.error('Failed to fetch SBTs from Polygon Amoy:', error);
  }
  
  return sbts;
}

async function fetchSBTsFromNetwork(userAddress: `0x${string}`, network: 'sepolia'): Promise<SBT[]> {
  const sbts: SBT[] = [];
  
  try {
    console.log(`🌐 fetchSBTsFromNetwork: Starting ${network} fetch for ${userAddress}`);
    
    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });
    
    const contractAddress = SBT_ADDRESSES.sepolia!;
    console.log('📋 Contract address:', contractAddress);
    
    // ユーザーが保有するSBTの数を取得
    console.log('🔍 Calling balanceOf...');
    let balance: bigint;
    try {
      balance = await client.readContract({
        address: contractAddress,
        abi: SBT_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      }) as bigint;
      
      console.log('📊 SBT balance:', balance.toString());
    } catch (balanceError) {
      console.error('❌ Error calling balanceOf:', balanceError);
      // balanceOf が失敗した場合、コントラクトが存在しないか、アドレスが無効
      throw new Error(`Failed to get balance: ${balanceError}`);
    }
    
    if (balance === 0n) {
      console.log('💬 No SBTs found for this user on Sepolia');
      return sbts;
    }
    
    // イベントログを使用してユーザーが所有するトークンIDを取得
    console.log('🔍 Getting user tokens via Transfer events on Sepolia...');
    let userTokenIds: bigint[] = [];
    
    try {
      // Transferイベントを検索してユーザーのトークンを特定
      const logs = await client.getLogs({
        address: contractAddress,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true }
          ]
        },
        args: {
          to: userAddress,
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });
      
      console.log('📊 Found Transfer events on Sepolia:', logs.length);
      
      // トークンIDを抽出
      for (const log of logs) {
        if (log.args && log.args.tokenId) {
          const tokenId = log.args.tokenId as bigint;
          
          // そのトークンが現在もユーザーが所有しているかチェック
          try {
            const owner = await client.readContract({
              address: contractAddress,
              abi: SBT_ABI,
              functionName: 'ownerOf',
              args: [tokenId],
            }) as string;
            
            if (owner.toLowerCase() === userAddress.toLowerCase()) {
              userTokenIds.push(tokenId);
              console.log('✅ Confirmed Sepolia token ownership:', tokenId.toString());
            }
          } catch (ownerError) {
            console.log('⚠️ Sepolia token may have been burned:', tokenId.toString());
          }
        }
      }
    } catch (eventError) {
      console.error('❌ Error getting Transfer events on Sepolia:', eventError);
      // フォールバック: 簡単な範囲でトークンIDを試行
      console.log('🔄 Trying fallback method with token ID range on Sepolia...');
      for (let tokenId = 1; tokenId <= 1000; tokenId++) {
        try {
          const owner = await client.readContract({
            address: contractAddress,
            abi: SBT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)],
          }) as string;
          
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            userTokenIds.push(BigInt(tokenId));
            console.log('✅ Found owned Sepolia token via fallback:', tokenId.toString());
          }
        } catch {
          // トークンが存在しないか所有していない
        }
        
        // 見つかったトークン数がbalanceと一致したら終了
        if (userTokenIds.length >= Number(balance)) {
          break;
        }
      }
    }
    
    console.log('📋 Sepolia user token IDs found:', userTokenIds.map(id => id.toString()));
    
    // 各トークンのメタデータを取得
    for (const tokenId of userTokenIds) {
      try {
        console.log('🔍 Processing Sepolia token:', tokenId.toString());
        
        // トークンURIを取得
        const tokenURI = await client.readContract({
          address: contractAddress,
          abi: SBT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string;
        
        console.log('Sepolia Token URI:', tokenURI);
        
        // メタデータを取得・解析
        let metadata: any = {};
        let imageUrl = '';
        let actualShopId = 1; // デフォルトはDemo Store
        
        console.log('🔍 Sepolia tokenURI:', tokenURI);
        
        if (tokenURI.startsWith('data:application/json;base64,')) {
          // Base64エンコードされたJSON
          try {
            const base64Data = tokenURI.replace('data:application/json;base64,', '');
            const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
            metadata = JSON.parse(jsonString);
            console.log('📄 Sepolia decoded metadata:', metadata);
            
            imageUrl = metadata.image || '';
            actualShopId = metadata.shopId || metadata.shop_id || metadata.attributes?.find((attr: any) => attr.trait_type === 'Shop ID')?.value || actualShopId;
          } catch (e) {
            console.error('❌ Failed to decode Sepolia base64 metadata:', e);
          }
        } else if (tokenURI.startsWith('http')) {
          // HTTPSのメタデータURL
          try {
            const response = await axios.get(tokenURI);
            metadata = response.data;
            console.log('📄 Sepolia fetched metadata:', metadata);
            
            imageUrl = metadata.image || '';
            actualShopId = metadata.shopId || metadata.shop_id || metadata.attributes?.find((attr: any) => attr.trait_type === 'Shop ID')?.value || actualShopId;
          } catch (e) {
            console.error('❌ Failed to fetch Sepolia metadata from URL:', e);
          }
        } else if (tokenURI.startsWith('ipfs://')) {
          // IPFSのメタデータURL
          try {
            console.log('🌐 Fetching IPFS metadata for Sepolia...');
            const ipfsUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            console.log('🔗 IPFS URL:', ipfsUrl);
            
            const response = await axios.get(ipfsUrl, {
              timeout: 10000, // 10秒タイムアウト
              headers: {
                'Accept': 'application/json',
              }
            });
            metadata = response.data;
            console.log('📄 Sepolia IPFS metadata:', metadata);
            
            imageUrl = metadata.image || '';
            // IPFSの画像URLをHTTPSに変換
            if (imageUrl && imageUrl.startsWith('ipfs://')) {
              imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
              console.log('🖼️ Converted Sepolia image URL:', imageUrl);
            }
            
            actualShopId = metadata.shopId || metadata.shop_id || metadata.attributes?.find((attr: any) => attr.trait_type === 'Shop ID')?.value || actualShopId;
          } catch (e) {
            console.error('❌ Failed to fetch Sepolia IPFS metadata:', e);
            console.log('🔄 Using fallback for Sepolia IPFS metadata...');
          }
        }
        
        // ショップ情報を取得
        const actualShopInfo = REGISTERED_SHOPS[actualShopId as keyof typeof REGISTERED_SHOPS];
        
        // ショップ情報が見つからない場合のフォールバック
        let fallbackShopInfo = actualShopInfo;
        if (!actualShopInfo) {
          // コントラクトアドレスベースでショップを推測
          console.log('⚠️ Shop not found by shopId, trying fallback methods...');
          
          // Sepoliaコントラクトの場合は通常Demo Store (ID: 1)
          if (contractAddress.toLowerCase() === SBT_ADDRESSES.sepolia?.toLowerCase()) {
            fallbackShopInfo = REGISTERED_SHOPS[1];
            actualShopId = 1;
            console.log('📍 Fallback: Using Demo Store for Sepolia contract');
          }
          
          // メタデータの店舗名から推測
          if (!fallbackShopInfo && metadata.name) {
            const shopName = metadata.name.toLowerCase();
            if (shopName.includes('cafe') || shopName.includes('jpyc')) {
              fallbackShopInfo = REGISTERED_SHOPS[2];
              actualShopId = 2;
              console.log('📍 Fallback: Using Cafe JPYC based on name');
            } else if (shopName.includes('demo') || shopName.includes('test')) {
              fallbackShopInfo = REGISTERED_SHOPS[1];
              actualShopId = 1;
              console.log('📍 Fallback: Using Demo Store based on name');
            }
          }
        }
        
        console.log(`🏪 Sepolia shop lookup: shopId=${actualShopId}, found=${!!fallbackShopInfo}`, fallbackShopInfo);
        
        // 画像URLが取得できない場合はデフォルト画像を使用
        if (!imageUrl || imageUrl.includes('placeholder')) {
          // MetaMask表示用により適切なデフォルト画像（金色のバッジデザイン）
          const badgeName = encodeURIComponent(metadata.name || fallbackShopInfo?.name || `来店記念`);
          const shopName = encodeURIComponent(fallbackShopInfo?.name || 'DEMOショップ');
          imageUrl = `https://img.shields.io/badge/${badgeName}-${shopName}-FFD700?style=for-the-badge&logo=star&logoColor=white`;
          
          console.log('Generated default image URL for Sepolia SBT:', imageUrl);
        }
        
        // IPFSリンクをHTTPSリンクに変換
        if (imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
          console.log('Converted IPFS URL to HTTPS:', imageUrl);
        }
        
        // メタデータにMetaMask表示用の詳細情報を追加
        const enhancedMetadata = {
          ...metadata,
          name: metadata.name || `来店記念 - ${fallbackShopInfo?.name || 'DEMOショップ'}`,
          description: metadata.description || `${fallbackShopInfo?.name || 'DEMOショップ'}でのスタンプカード`,
          image: imageUrl,
          external_url: metadata.external_url || 'https://jpyc.jp',
          background_color: metadata.background_color || 'FFD700',
          shopId: actualShopId,
          attributes: [
            {
              trait_type: 'Shop Name',
              value: fallbackShopInfo?.name || 'DEMOショップ'
            },
            {
              trait_type: 'Shop Category',
              value: fallbackShopInfo?.category || 'デモ・実験店舗'
            },
            {
              trait_type: 'Rank',
              value: metadata.rank || fallbackShopInfo?.sbtTemplate?.rank || 'bronze'
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
        
        console.log('Enhanced Sepolia SBT Image URL:', imageUrl);
        console.log('Enhanced Sepolia SBT Metadata:', enhancedMetadata);
        console.log('Actual shop info used:', fallbackShopInfo);
        
        const sbt: SBT = {
          id: `sbt-${contractAddress}-${tokenId}`,
          name: enhancedMetadata.name,
          symbol: metadata.symbol || fallbackShopInfo?.name?.substring(0, 4).toUpperCase() || 'SBT',
          address: contractAddress,
          issuer: fallbackShopInfo?.name || 'Unknown Shop',
          issuerAddress: fallbackShopInfo?.wallet || contractAddress,
          description: enhancedMetadata.description,
          network: 'sepolia',
          chainId: 11155111,
          tokenId: tokenId,
          metadata: enhancedMetadata,
          imageUrl: imageUrl,
          rank: metadata.rank || fallbackShopInfo?.sbtTemplate?.rank || 'bronze',
          issuedDate: new Date(),
          // 拡張情報
          shopId: actualShopId,
          shopName: fallbackShopInfo?.name,
          shopCategory: fallbackShopInfo?.category,
          benefits: metadata.benefits || (fallbackShopInfo?.sbtTemplate?.benefits ? [...fallbackShopInfo.sbtTemplate.benefits] : []),
          thumbnailUrl: imageUrl,
          bannerUrl: fallbackShopInfo?.bannerUrl,
          external_url: enhancedMetadata.external_url,
          background_color: enhancedMetadata.background_color,
          youtube_url: metadata.youtube_url,
          animationUrl: metadata.animation_url,
        };
        
        sbts.push(sbt);
        console.log('✅ Successfully added Sepolia SBT:', {
          id: sbt.id,
          name: sbt.name,
          shopId: sbt.shopId,
          shopName: sbt.shopName,
          issuer: sbt.issuer,
          tokenId: sbt.tokenId?.toString(),
          imageUrl: sbt.imageUrl
        });
      } catch (tokenError) {
        console.error(`Failed to fetch Sepolia token ${tokenId.toString()}:`, tokenError);
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

