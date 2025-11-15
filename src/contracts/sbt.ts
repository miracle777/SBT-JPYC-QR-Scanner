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
  
  // 他のネットワークは未デプロイ
  ethereum: undefined,
  polygon: undefined,
  'polygon-amoy': undefined,
  arbitrum: undefined,
  'arbitrum-sepolia': undefined,
  avalanche: undefined,
  'avalanche-fuji': undefined,
} as const;

// デプロイアカウント
export const DEPLOYER_ADDRESS = getAddress('0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd');

// 登録済みショップ情報
export const REGISTERED_SHOPS = {
  1: {
    id: 1,
    name: 'SBT JPYC Pay Demo Store',
    wallet: DEPLOYER_ADDRESS,
  },
} as const;

// ネットワークタイプ
export type SBTNetworkType = keyof typeof SBT_ADDRESSES;
