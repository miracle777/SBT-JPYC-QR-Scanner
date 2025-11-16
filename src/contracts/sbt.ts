import { getAddress } from 'viem';

// SBT Contract ABI
export const SBT_ABI = [
  // balanceOf - ERC721互換
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // tokenOfOwnerByIndex - ERC721Enumerable互換
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // tokenURI - メタデータ取得
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // name
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // symbol
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ownerOf
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // カスタム関数: ショップ情報取得
  {
    inputs: [{ name: 'shopId', type: 'uint256' }],
    name: 'shops',
    outputs: [
      { name: 'shopWallet', type: 'address' },
      { name: 'shopName', type: 'string' },
      { name: 'requiredVisits', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // カスタム関数: ユーザーの訪問回数取得
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'shopId', type: 'uint256' },
    ],
    name: 'userVisits',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // カスタム関数: SBT保有確認
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'shopId', type: 'uint256' },
    ],
    name: 'hasSBT',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// SBT Contract Addresses per Network
export const SBT_ADDRESSES = {
  // Ethereum Sepolia Testnet
  sepolia: getAddress('0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4'),
  
  // Polygon Amoy Testnet (Chain ID 80002)
  'polygon-amoy': getAddress('0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4'),
  
  // 他のネットワークは未デプロイ
  ethereum: undefined,
  polygon: undefined,
  arbitrum: undefined,
  'arbitrum-sepolia': undefined,
  avalanche: undefined,
  'avalanche-fuji': undefined,
} as const;

// デプロイアカウント（動的に設定）
export const DEPLOYER_ADDRESS = getAddress('0x0000000000000000000000000000000000000000');

// 登録済みショップ情報
export const REGISTERED_SHOPS = {
  1: {
    id: 1,
    name: 'SBT JPYC Pay Demo Store',
    category: 'デモ・実験店舗',
    description: 'SBT JPYCペイのデモンストレーション店舗です',
    wallet: DEPLOYER_ADDRESS,
    requiredVisits: 3,
    sbtTemplate: {
      name: 'Demo Store Loyalty Badge',
      description: 'デモ店舗の常連客証明SBT',
      imageUrl: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=DEMO+SBT',
      rank: 'bronze' as const,
      benefits: ['5%割引', '限定商品アクセス', '優先予約']
    },
    logoUrl: 'https://via.placeholder.com/100/4F46E5/FFFFFF?text=DEMO',
    bannerUrl: 'https://via.placeholder.com/400x150/4F46E5/FFFFFF?text=DEMO+STORE',
    isActive: true,
  },
  2: {
    id: 2,
    name: 'Cafe JPYC',
    category: 'カフェ・飲食',
    description: 'JPYCが使えるおしゃれなカフェ',
    wallet: DEPLOYER_ADDRESS,
    requiredVisits: 5,
    sbtTemplate: {
      name: 'Cafe Regular Customer',
      description: 'カフェの常連客証明SBT',
      imageUrl: 'https://via.placeholder.com/150/8B4513/FFFFFF?text=CAFE+SBT',
      rank: 'silver' as const,
      benefits: ['10%割引', '無料ドリンクアップグレード', 'Wi-Fi優先接続']
    },
    logoUrl: 'https://via.placeholder.com/100/8B4513/FFFFFF?text=CAFE',
    bannerUrl: 'https://via.placeholder.com/400x150/8B4513/FFFFFF?text=CAFE+JPYC',
    isActive: true,
  },
  3: {
    id: 3,
    name: 'Tech Store JPYC',
    category: 'エレクトロニクス',
    description: 'デジタル機器とガジェットの専門店',
    wallet: DEPLOYER_ADDRESS,
    requiredVisits: 10,
    sbtTemplate: {
      name: 'Tech Enthusiast Badge',
      description: 'テック愛好家証明SBT',
      imageUrl: 'https://via.placeholder.com/150/00CED1/FFFFFF?text=TECH+SBT',
      rank: 'gold' as const,
      benefits: ['15%割引', '新商品先行販売', 'テクニカルサポート優先']
    },
    logoUrl: 'https://via.placeholder.com/100/00CED1/FFFFFF?text=TECH',
    bannerUrl: 'https://via.placeholder.com/400x150/00CED1/FFFFFF?text=TECH+STORE',
    isActive: true,
  },
} as const;

// ネットワークタイプ
export type SBTNetworkType = keyof typeof SBT_ADDRESSES;
