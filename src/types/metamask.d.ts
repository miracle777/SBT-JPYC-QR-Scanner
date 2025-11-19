/**
 * MetaMask Ethereum Provider 型定義
 */

export interface MetaMaskWatchAssetParams {
  type: 'ERC721';
  options: {
    address: string;
    tokenId: string;
  };
}

export interface MetaMaskEthereumProvider {
  request(request: {
    method: 'wallet_watchAsset';
    params: MetaMaskWatchAssetParams;
  }): Promise<boolean>;
  
  request(request: {
    method: 'eth_chainId';
    params?: never;
  }): Promise<string>;
  
  request(request: {
    method: 'eth_accounts';
    params?: never;
  }): Promise<string[]>;
  
  request(request: {
    method: string;
    params?: any;
  }): Promise<any>;

  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: MetaMaskEthereumProvider;
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: {
        page_path?: string;
        [key: string]: any;
      }
    ) => void;
  }
}