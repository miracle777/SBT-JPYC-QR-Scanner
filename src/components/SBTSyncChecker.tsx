/**
 * SBT同期確認・診断コンポーネント
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';

interface SBTSyncCheckerProps {
  userAddress?: `0x${string}`;
  onClose?: () => void;
}

interface SyncStatus {
  isMetaMaskConnected: boolean;
  currentNetwork: string;
  currentAccount: string;
  deviceType: 'desktop' | 'mobile' | 'unknown';
  metaMaskVersion?: string;
  recommendations: string[];
}

export function SBTSyncChecker({ userAddress, onClose }: SBTSyncCheckerProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkSyncStatus();
  }, [userAddress]);

  const checkSyncStatus = async () => {
    setLoading(true);
    try {
      const status: SyncStatus = {
        isMetaMaskConnected: false,
        currentNetwork: 'unknown',
        currentAccount: '',
        deviceType: detectDeviceType(),
        recommendations: [],
      };

      if (typeof window.ethereum !== 'undefined') {
        status.isMetaMaskConnected = true;
        
        try {
          // 現在のネットワークを取得
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          status.currentNetwork = getNetworkName(chainId);
          
          // 現在のアカウントを取得
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            status.currentAccount = accounts[0];
          }
          
          // MetaMaskのバージョン情報を取得（可能であれば）
          if (window.ethereum.isMetaMask) {
            status.metaMaskVersion = 'MetaMask detected';
          }
        } catch (error) {
          console.error('Failed to get MetaMask info:', error);
        }
      }

      // 推奨事項を生成
      status.recommendations = generateRecommendations(status, userAddress);

      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to check sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectDeviceType = (): 'desktop' | 'mobile' | 'unknown' => {
    const userAgent = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/Windows|Mac|Linux/i.test(userAgent)) {
      return 'desktop';
    }
    return 'unknown';
  };

  const getNetworkName = (chainId: string): string => {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13882': 'Polygon Amoy Testnet',
    };
    return networks[chainId] || `Unknown (${chainId})`;
  };

  const generateRecommendations = (status: SyncStatus, address?: `0x${string}`): string[] => {
    const recommendations: string[] = [];

    if (!status.isMetaMaskConnected) {
      recommendations.push('MetaMaskをインストールして接続してください');
    }

    if (!address) {
      recommendations.push('ウォレットに接続してください');
    }

    if (status.currentNetwork && !['Sepolia Testnet', 'Polygon Amoy Testnet'].includes(status.currentNetwork)) {
      recommendations.push('SepoliaまたはPolygon Amoyテストネットに切り替えてください（Polygon Mainnetは未対応）');
    }

    if (status.deviceType === 'mobile') {
      recommendations.push('スマホ版MetaMaskでNFTタブを確認してください');
      recommendations.push('PC版と同じニーモニックフレーズを使用していることを確認してください');
    } else if (status.deviceType === 'desktop') {
      recommendations.push('PC版MetaMaskでNFTセクションを確認してください');
      recommendations.push('スマホ版MetaMaskと同期するには同じニーモニックフレーズを使用してください');
    }

    if (status.currentAccount && address && status.currentAccount.toLowerCase() !== address.toLowerCase()) {
      recommendations.push('MetaMaskのアカウントがアプリで接続しているアカウントと一致しません');
    }

    return recommendations;
  };

  const getStatusIcon = (status: SyncStatus) => {
    if (!status.isMetaMaskConnected) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (status.recommendations.length === 0) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = (status: SyncStatus) => {
    if (!status.isMetaMaskConnected) {
      return 'MetaMask未接続';
    }
    
    if (status.recommendations.length === 0) {
      return '同期状況良好';
    }
    
    return '改善が推奨されます';
  };

  const getStatusColor = (status: SyncStatus) => {
    if (!status.isMetaMaskConnected) {
      return 'border-red-200 bg-red-50';
    }
    
    if (status.recommendations.length === 0) {
      return 'border-green-200 bg-green-50';
    }
    
    return 'border-yellow-200 bg-yellow-50';
  };

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm">同期状況を確認中...</span>
        </div>
      </div>
    );
  }

  if (!syncStatus) {
    return null;
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(syncStatus)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(syncStatus)}
          <div>
            <h3 className="font-semibold text-sm">PC・スマホ同期状況</h3>
            <p className="text-xs text-gray-600">{getStatusText(syncStatus)}</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="詳細表示"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={checkSyncStatus}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="再確認"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="閉じる"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {syncStatus.deviceType === 'mobile' ? (
            <Smartphone className="w-4 h-4 text-blue-500" />
          ) : (
            <Monitor className="w-4 h-4 text-blue-500" />
          )}
          <span>デバイス: {syncStatus.deviceType === 'mobile' ? 'スマートフォン' : 'デスクトップ'}</span>
        </div>

        {syncStatus.recommendations.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-medium text-sm text-gray-700">推奨される対処法:</h4>
            <ul className="text-xs space-y-1">
              {syncStatus.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span className="text-gray-600">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <h4 className="font-medium text-sm text-gray-700 mb-2">詳細情報:</h4>
            <div className="text-xs space-y-1 text-gray-600">
              <div>ネットワーク: <span className="font-mono">{syncStatus.currentNetwork}</span></div>
              <div>アカウント: <span className="font-mono text-xs">{syncStatus.currentAccount}</span></div>
              <div>MetaMask: {syncStatus.isMetaMaskConnected ? '接続中' : '未接続'}</div>
              {userAddress && (
                <div>アプリ接続: <span className="font-mono text-xs">{userAddress}</span></div>
              )}
            </div>
            
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => window.open('https://metamask.io/', '_blank')}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                MetaMask サポート
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}