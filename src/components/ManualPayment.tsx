'use client';

import { useState } from 'react';
import { Wallet, Send } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';

interface ManualPaymentProps {
  onSubmit: (data: { address: string; amount: string; memo?: string }) => void;
}

export function ManualPayment({ onSubmit }: ManualPaymentProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
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
    onSubmit({
      address: address as `0x${string}`,
      amount,
      memo: memo || undefined,
    });

    // フォームをクリア
    setAddress('');
    setAmount('');
    setMemo('');
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">手動送金</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            min="0"
            step="0.01"
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

      {/* 現在のネットワーク表示 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 現在のネットワーク: Chain ID {chainId}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          送金はSepoliaネットワークで実行されます
        </p>
      </div>
    </div>
  );
}
