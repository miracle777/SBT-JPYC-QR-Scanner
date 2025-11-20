'use client';

import { useState } from 'react';
import { Wallet, Send, BookOpen } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { NetworkType } from '../types';
import { SUPPORTED_NETWORKS } from '../utils/network';
import { JPYC_ADDRESSES, JPYCNetworkType } from '../contracts/jpyc';
import { AddressBook, AddressBookEntry } from './AddressBook';

interface ManualPaymentProps {
  onSubmit: (data: { 
    address: `0x${string}`; 
    amount: string; 
    memo?: string;
    network: NetworkType;
    chainId: number;
    contractAddress: `0x${string}`;
    shopName?: string;
  }) => void;
}

export function ManualPayment({ onSubmit }: ManualPaymentProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('sepolia');
  const [contractAddress, setContractAddress] = useState<string>(JPYC_ADDRESSES.sepolia);
  const [shopName, setShopName] = useState('');
  const [showAddressBook, setShowAddressBook] = useState(false);

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleNetworkChange = (network: NetworkType) => {
    setSelectedNetwork(network);
    // ネットワークに応じたデフォルトのJPYCアドレスを設定
    const networkKey = network as JPYCNetworkType;
    if (JPYC_ADDRESSES[networkKey]) {
      setContractAddress(JPYC_ADDRESSES[networkKey]);
    }
  };

  const handleAddressBookSelect = (entry: AddressBookEntry) => {
    setAddress(entry.address);
    setShopName(entry.name);
    if (entry.memo) {
      setMemo(entry.memo);
    }
    if (entry.network) {
      setSelectedNetwork(entry.network as NetworkType);
    }
    if (entry.contractAddress) {
      setContractAddress(entry.contractAddress);
    }
    setShowAddressBook(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!address) {
      setError('送信先アドレスを入力してください');
      return;
    }

    if (!validateAddress(address)) {
      setError('有効なウォレットアドレスを入力してください (0x...)');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('有効な金額を入力してください');
      return;
    }

    // データを送信
    const networkInfo = SUPPORTED_NETWORKS[selectedNetwork];
    onSubmit({
      address: address as `0x${string}`,
      amount,
      memo: memo || undefined,
      network: selectedNetwork,
      chainId: networkInfo.chainId,
      contractAddress,
      shopName: shopName || '手動送付',
    });

    // フォームをクリア
    setAddress('');
    setAmount('');
    setMemo('');
    setShopName('');
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">手動送金</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAddressBook(!showAddressBook)}
          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <BookOpen className="w-4 h-4" />
          アドレス帳
        </button>
      </div>

      {/* アドレス帳表示 */}
      {showAddressBook && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <AddressBook onSelectAddress={handleAddressBookSelect} compact={true} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ネットワーク選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ネットワーク <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedNetwork}
            onChange={(e) => handleNetworkChange(e.target.value as NetworkType)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
              <option key={key} value={key}>
                {network.displayName} (Chain ID: {network.chainId})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            送金先のネットワークを選択してください
          </p>
        </div>

        {/* コントラクトアドレス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            トークンコントラクトアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs break-all"
          />
          
          {/* クイック選択ボタン */}
          {selectedNetwork === 'polygon' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Polygon Mainnet クイック選択:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContractAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29')}
                  className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition"
                >
                  🏛️ 公式JPYC
                </button>
              </div>
            </div>
          )}
          
          {selectedNetwork === 'polygon-amoy' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Polygon Amoy クイック選択:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContractAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition"
                >
                  📄 標準
                </button>
                <button
                  type="button"
                  onClick={() => setContractAddress('0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a')}
                  className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition"
                >
                  🎯 tJPYC
                </button>
              </div>
            </div>
          )}
          
          {selectedNetwork === 'avalanche' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Avalanche C-Chain クイック選択:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContractAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29')}
                  className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition"
                >
                  🏛️ 公式JPYC
                </button>
              </div>
            </div>
          )}
          
          {selectedNetwork === 'avalanche-fuji' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Avalanche Fuji クイック選択:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContractAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition"
                >
                  📄 標準
                </button>
                <button
                  type="button"
                  onClick={() => setContractAddress('0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345')}
                  className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition"
                >
                  🎯 tJPYC
                </button>
              </div>
            </div>
          )}
          
          {selectedNetwork === 'ethereum' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Ethereum Mainnet クイック選択:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContractAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition"
                >
                  🏛️ 公式JPYC
                </button>
              </div>
            </div>
          )}
          
          {selectedNetwork === 'sepolia' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Sepolia クイック選択:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContractAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition flex-1"
                  title="公式Faucetで取得できるJPYC"
                >
                  🏛️ 公式Faucet
                </button>
                <button
                  type="button"
                  onClick={() => setContractAddress('0xd3eF95d29A198868241FE374A999fc25F6152253')}
                  className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition flex-1"
                  title="コミュニティが作成したJPYC"
                >
                  🏘️ コミュニティ
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 公式Faucet: <a href="https://faucet.sepolia.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">faucet.sepolia.dev</a>
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            送金するトークンのコントラクトアドレスを指定（クイック選択またはカスタム入力可能）
          </p>
        </div>

        {/* 送付先名前 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            送付先名前（店舗名など）
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="例: 田中商店、友人の太郎さん（未入力の場合「手動送付」と表示されます）"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            決済履歴に表示される名前です（任意）
          </p>
        </div>

        {/* 送信先アドレス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            送信先ウォレットアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ethereumウォレットアドレス (0xで始まる42文字)
          </p>
        </div>

        {/* 金額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            金額 (JPYC) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              // 整数のみを許可（JPYCは1JPYC=1円なので小数点なし）
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                setAmount(value);
              }
            }}
            placeholder="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <div className="flex gap-2 mt-2">
            {[100, 500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                ¥{preset}
              </button>
            ))}
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メモ (任意)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="店舗名やメモを入力..."
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            決済履歴に記録されます (最大100文字)
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          送金する
        </button>
      </form>

      {/* 選択中のネットワーク情報 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 選択中のネットワーク: {SUPPORTED_NETWORKS[selectedNetwork].displayName}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Chain ID: {SUPPORTED_NETWORKS[selectedNetwork].chainId}
        </p>
        {chainId !== SUPPORTED_NETWORKS[selectedNetwork].chainId && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ ウォレットのネットワークと異なります。送金時に切り替えが必要です。
          </p>
        )}
      </div>
    </div>
  );
}
