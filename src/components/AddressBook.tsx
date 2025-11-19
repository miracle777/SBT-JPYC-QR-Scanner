'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BookOpen, Plus, Edit2, Trash2, Save, X, Download, Upload } from 'lucide-react';
import { NetworkType } from '../types';
import { SUPPORTED_NETWORKS } from '../utils/network';
import { JPYC_ADDRESSES, JPYCNetworkType } from '../contracts/jpyc';

export interface AddressBookEntry {
  id: string;
  name: string;
  address: string;
  memo?: string;
  network?: string;
  contractAddress?: string;
  tokenSymbol?: string;
  createdAt: Date;
}

interface AddressBookProps {
  onSelectAddress?: (entry: AddressBookEntry) => void;
  compact?: boolean;
}

export function AddressBook({ onSelectAddress, compact = false }: AddressBookProps) {
  const { address: userAddress } = useAccount();
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    memo: '',
    network: 'sepolia' as NetworkType,
    contractAddress: JPYC_ADDRESSES.sepolia as string,
    tokenSymbol: 'JPYC',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAddressBook();
  }, [userAddress]);

  const loadAddressBook = () => {
    if (!userAddress) return;
    
    const storageKey = `address_book_${userAddress}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const entriesWithDates = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
        setEntries(entriesWithDates);
      } catch (error) {
        console.error('Failed to load address book:', error);
      }
    }
  };

  const saveAddressBook = (newEntries: AddressBookEntry[]) => {
    if (!userAddress) return;
    
    const storageKey = `address_book_${userAddress}`;
    localStorage.setItem(storageKey, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleExport = () => {
    if (entries.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `address-book_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (!Array.isArray(imported)) {
          alert('無効なファイル形式です');
          return;
        }

        const validEntries = imported.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));

        if (confirm(`${validEntries.length}件のアドレスをインポートしますか？\n既存のデータは上書きされます。`)) {
          saveAddressBook(validEntries);
        }
      } catch (error) {
        alert('ファイルの読み込みに失敗しました');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAdd = () => {
    setError('');

    if (!formData.name.trim()) {
      setError('名前を入力してください');
      return;
    }

    if (!validateAddress(formData.address)) {
      setError('有効なウォレットアドレスを入力してください (0x...)');
      return;
    }

    // 重複チェック: アドレス、ネットワーク、コントラクトアドレスの組み合わせで判定
    const isDuplicate = entries.some(
      (entry) => 
        entry.address.toLowerCase() === formData.address.toLowerCase() &&
        entry.network === formData.network &&
        entry.contractAddress?.toLowerCase() === formData.contractAddress.toLowerCase()
    );

    if (isDuplicate) {
      setError('このアドレスは同じネットワーク・トークンで既に登録されています');
      return;
    }

    const newEntry: AddressBookEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      address: formData.address,
      memo: formData.memo.trim() || undefined,
      network: formData.network,
      contractAddress: formData.contractAddress,
      tokenSymbol: formData.tokenSymbol,
      createdAt: new Date(),
    };

    const newEntries = [...entries, newEntry];
    saveAddressBook(newEntries);

    // フォームをリセット
    setFormData({ 
      name: '', 
      address: '', 
      memo: '',
      network: 'sepolia' as NetworkType,
      contractAddress: JPYC_ADDRESSES.sepolia as string,
      tokenSymbol: 'JPYC',
    });
    setIsAdding(false);
  };

  const handleEdit = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setFormData({
        name: entry.name,
        address: entry.address,
        memo: entry.memo || '',
        network: (entry.network as NetworkType) || 'sepolia',
        contractAddress: (entry.contractAddress as string) || (JPYC_ADDRESSES.sepolia as string),
        tokenSymbol: entry.tokenSymbol || 'JPYC',
      });
      setEditingId(id);
    }
  };

  const handleUpdate = () => {
    setError('');

    if (!formData.name.trim()) {
      setError('名前を入力してください');
      return;
    }

    if (!validateAddress(formData.address)) {
      setError('有効なウォレットアドレスを入力してください (0x...)');
      return;
    }

    const newEntries = entries.map((entry) =>
      entry.id === editingId
        ? {
            ...entry,
            name: formData.name.trim(),
            address: formData.address,
            memo: formData.memo.trim() || undefined,
            network: formData.network,
            contractAddress: formData.contractAddress,
            tokenSymbol: formData.tokenSymbol,
          }
        : entry
    );

    saveAddressBook(newEntries);
    setFormData({ 
      name: '', 
      address: '', 
      memo: '',
      network: 'sepolia' as NetworkType,
      contractAddress: JPYC_ADDRESSES.sepolia as string,
      tokenSymbol: 'JPYC',
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('このアドレスを削除しますか？')) {
      const newEntries = entries.filter((entry) => entry.id !== id);
      saveAddressBook(newEntries);
    }
  };

  const handleCancel = () => {
    setFormData({ 
      name: '', 
      address: '', 
      memo: '',
      network: 'sepolia' as NetworkType,
      contractAddress: JPYC_ADDRESSES.sepolia as string,
      tokenSymbol: 'JPYC',
    });
    setIsAdding(false);
    setEditingId(null);
    setError('');
  };

  const handleSelect = (entry: AddressBookEntry) => {
    if (onSelectAddress) {
      onSelectAddress(entry);
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          アドレス帳から選択（任意）
        </label>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 italic">アドレス帳が空です</p>
        ) : (
          <select
            onChange={(e) => {
              const entry = entries.find((ent) => ent.id === e.target.value);
              if (entry) handleSelect(entry);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            defaultValue=""
          >
            <option value="">-- 選択してください --</option>
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} - {entry.network ? SUPPORTED_NETWORKS[entry.network as NetworkType]?.displayName : 'Network不明'} ({entry.address.slice(0, 6)}...{entry.address.slice(-4)})
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">アドレス帳</h2>
        </div>
        {!isAdding && !editingId && (
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              title="エクスポート"
            >
              <Download className="w-4 h-4" />
            </button>
            <label className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm cursor-pointer"
              title="インポート"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>
        )}
      </div>

      {/* 追加・編集フォーム */}
      {(isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            {editingId ? 'アドレスを編集' : '新しいアドレスを追加'}
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 田中商店、友人の太郎さん"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ウォレットアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ（任意）
              </label>
              <input
                type="text"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="補足情報など"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ネットワーク
              </label>
              <select
                value={formData.network}
                onChange={(e) => {
                  const network = e.target.value as NetworkType;
                  const networkKey = network as JPYCNetworkType;
                  setFormData({ 
                    ...formData, 
                    network,
                    contractAddress: (JPYC_ADDRESSES[networkKey] as string) || formData.contractAddress,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                  <option key={key} value={key}>
                    {network.displayName} (Chain ID: {network.chainId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                コントラクトアドレス
              </label>
              <input
                type="text"
                value={formData.contractAddress}
                onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                トークンシンボル
              </label>
              <input
                type="text"
                value={formData.tokenSymbol}
                onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value })}
                placeholder="JPYC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                {editingId ? '更新' : '追加'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アドレス一覧 */}
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>アドレス帳が空です</p>
          <p className="text-sm mt-1">「追加」ボタンから登録してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-gray-800">
                      {entry.name}
                    </div>
                    {entry.network && (
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ 
                        backgroundColor: SUPPORTED_NETWORKS[entry.network as NetworkType]?.color + '20',
                        color: SUPPORTED_NETWORKS[entry.network as NetworkType]?.color 
                      }}>
                        {SUPPORTED_NETWORKS[entry.network as NetworkType]?.displayName || entry.network}
                      </span>
                    )}
                    {entry.tokenSymbol && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-medium">
                        {entry.tokenSymbol}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-mono mb-1">
                    {entry.address}
                  </div>
                  {entry.contractAddress && (
                    <div className="text-xs text-gray-500 font-mono mb-1">
                      📄 コントラクト: {entry.contractAddress.slice(0, 10)}...{entry.contractAddress.slice(-8)}
                    </div>
                  )}
                  {entry.memo && (
                    <div className="text-xs text-gray-500 italic">
                      📝 {entry.memo}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-2">
                  {onSelectAddress && (
                    <button
                      onClick={() => handleSelect(entry)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      選択
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(entry.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="編集"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-800"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
