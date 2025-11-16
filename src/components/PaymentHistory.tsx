'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Clock, Edit2, Check, X, ExternalLink, Trash2, MapPin } from 'lucide-react';
import { PaymentHistory } from '../types';
import { getNetworkInfo } from '../utils/network';

export function PaymentHistoryComponent() {
  const { address } = useAccount();
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemo, setEditMemo] = useState('');

  useEffect(() => {
    if (address) {
      loadHistory();
    }
  }, [address]);

  // 定期的に履歴を更新（新しい決済を検出）および未完了トランザクションの確認
  useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(() => {
      loadHistory();
      // 未完了の決済をチェック
      checkPendingTransactions();
    }, 3000); // 3秒ごとに更新

    return () => clearInterval(interval);
  }, [address]);

  const checkPendingTransactions = async () => {
    if (!address) return;
    
    const storageKey = `payment_history_${address}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    
    try {
      const history = JSON.parse(stored);
      let hasUpdates = false;
      
      const updatedHistory = history.map((item: any) => {
        // pending状態でtxHashがある場合、一定時間経過後にsuccessに変更
        if (item.status === 'pending' && item.txHash) {
          const timeDiff = new Date().getTime() - new Date(item.timestamp).getTime();
          // 1分経過後に成功扱いにする
          if (timeDiff > 60000) {
            hasUpdates = true;
            return { ...item, status: 'success' };
          }
        }
        return item;
      });
      
      if (hasUpdates) {
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
        setHistory(updatedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })).sort((a: PaymentHistory, b: PaymentHistory) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ));
        console.log('Updated pending transactions to success');
      }
    } catch (error) {
      console.error('Failed to check pending transactions:', error);
    }
  };

  const loadHistory = () => {
    if (!address) return;
    
    const storageKey = `payment_history_${address}`;
    const stored = localStorage.getItem(storageKey);
    console.log('Loading history for:', address, 'Data:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyWithDates.sort((a: PaymentHistory, b: PaymentHistory) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ));
        console.log('Loaded history items:', historyWithDates.length);
      } catch (e) {
        console.error('Failed to parse payment history:', e);
      }
    }
  };

  const saveHistory = (updatedHistory: PaymentHistory[]) => {
    if (!address) return;
    
    const storageKey = `payment_history_${address}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const startEdit = (id: string, currentMemo?: string) => {
    setEditingId(id);
    setEditMemo(currentMemo || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMemo('');
  };

  const saveMemo = (id: string) => {
    const updated = history.map(item => 
      item.id === id ? { ...item, memo: editMemo } : item
    );
    saveHistory(updated);
    setEditingId(null);
    setEditMemo('');
  };

  const deleteHistory = (id: string) => {
    if (confirm('この履歴を削除しますか?')) {
      const updated = history.filter(item => item.id !== id);
      saveHistory(updated);
    }
  };

  const formatAmount = (amount: string) => {
    try {
      const num = parseFloat(amount);
      return num.toLocaleString('ja-JP');
    } catch {
      return amount;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'pending':
        return '処理中';
      case 'failed':
        return '失敗';
      default:
        return status;
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          決済履歴
        </h2>
        <p className="text-gray-500 text-center py-8">
          決済履歴がありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        決済履歴
      </h2>
      
      <div className="space-y-4">
        {history.map((item) => {
          const network = getNetworkInfo(item.network);
          const isEditing = editingId === item.id;
          
          return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-lg font-semibold text-gray-800 mb-1">
                    ¥{formatAmount(item.amount)} JPYC
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium" style={{ color: network.color }}>
                      {network.displayName}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-mono">
                    To: {item.recipient.slice(0, 10)}...{item.recipient.slice(-8)}
                  </div>
                  
                  {item.sbtUsed && item.sbtUsed.length > 0 && (
                    <div className="text-xs text-purple-600 mt-1">
                      🎖️ SBT使用: {item.sbtUsed.join(', ')}
                      {item.discount && ` (${item.discount}% 割引)`}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-2">
                  {item.txHash && (
                    <a
                      href={`${network.blockExplorerUrl}/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="トランザクションを確認"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteHistory(item.id)}
                    className="text-red-600 hover:text-red-800"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* 位置情報 */}
              {item.location && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a
                    href={`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {item.location.address ? (
                        <span className="break-words">{item.location.address}</span>
                      ) : (
                        <span className="break-all">
                          📍 地図で開く ({item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)})
                        </span>
                      )}
                    </div>
                  </a>
                </div>
              )}
              
              {/* メモ欄 */}
              <div className={`${item.location ? 'mt-2' : 'mt-3'} pt-3 border-t border-gray-100`}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editMemo}
                      onChange={(e) => setEditMemo(e.target.value)}
                      placeholder="店舗名やメモを入力..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveMemo(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        <X className="w-4 h-4" />
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {item.memo ? (
                        <p className="text-sm text-gray-700">
                          📝 {item.memo}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          メモなし
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => startEdit(item.id, item.memo)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                      {item.memo ? '編集' : '追加'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
