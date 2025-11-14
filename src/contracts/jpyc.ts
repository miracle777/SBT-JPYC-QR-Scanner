import { getAddress } from 'viem';

// JPYC Contract Configuration
export const JPYC_CONFIG = {
  // 公式JPYC Faucet (Sepolia testnet)
  address: getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'),
  abi: [
    // ERC20 Standard Functions
    {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
} as const;

// コミュニティJPYC Configuration
export const JPYC_COMMUNITY_CONFIG = {
  address: getAddress('0xd3eF95d29A198868241FE374A999fc25F6152253'),
  abi: JPYC_CONFIG.abi,
} as const;

// JPYCの表示フォーマット関数
export function formatJPYCDisplay(balance: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const fraction = balance % divisor;
  
  // 小数点以下2桁まで表示
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
  
  return `${whole.toLocaleString('ja-JP')}.${fractionStr}`;
}
