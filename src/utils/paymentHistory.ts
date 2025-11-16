import { PaymentHistory, NetworkType } from '../types';

/**
 * 決済履歴をローカルストレージに保存
 */
export function savePaymentHistory(
  address: `0x${string}`,
  payment: {
    amount: string;
    recipient: `0x${string}`;
    network: NetworkType;
    chainId: number;
    txHash?: string;
    memo?: string;
    sbtUsed?: string[];
    discount?: number;
  }
): string {
  const storageKey = `payment_history_${address}`;
  
  const paymentId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newEntry: PaymentHistory = {
    id: paymentId,
    amount: payment.amount,
    recipient: payment.recipient,
    network: payment.network,
    chainId: payment.chainId,
    txHash: payment.txHash,
    timestamp: new Date(),
    memo: payment.memo,
    sbtUsed: payment.sbtUsed,
    discount: payment.discount,
    status: 'pending', // 常にpendingで開始
  };

  console.log('Saving payment history:', { storageKey, newEntry, address });

  try {
    const existing = localStorage.getItem(storageKey);
    const history: PaymentHistory[] = existing ? JSON.parse(existing) : [];
    
    console.log('Existing history count:', history.length);
    
    history.unshift(newEntry);
    
    // 最新100件のみ保持
    const trimmed = history.slice(0, 100);
    
    localStorage.setItem(storageKey, JSON.stringify(trimmed));
    console.log('Payment history saved successfully. New count:', trimmed.length);
    
    return paymentId;
  } catch (error) {
    console.error('Failed to save payment history:', error);
    return paymentId;
  }
}

/**
 * 決済履歴を取得
 */
export function getPaymentHistory(address: `0x${string}`): PaymentHistory[] {
  const storageKey = `payment_history_${address}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    return history.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load payment history:', error);
    return [];
  }
}

/**
 * 決済履歴のステータスを更新
 */
export function updatePaymentStatus(
  address: `0x${string}`,
  paymentId: string,
  status: 'pending' | 'success' | 'failed',
  txHash?: string
): void {
  const storageKey = `payment_history_${address}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    
    const history: PaymentHistory[] = JSON.parse(stored);
    const updated = history.map(item => 
      item.id === paymentId 
        ? { ...item, status, txHash: txHash || item.txHash }
        : item
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update payment status:', error);
  }
}

/**
 * メモを更新
 */
export function updatePaymentMemo(
  address: `0x${string}`,
  paymentId: string,
  memo: string
): void {
  const storageKey = `payment_history_${address}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    
    const history: PaymentHistory[] = JSON.parse(stored);
    const updated = history.map(item => 
      item.id === paymentId ? { ...item, memo } : item
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update payment memo:', error);
  }
}

/**
 * 決済履歴を削除
 */
export function deletePaymentHistory(
  address: `0x${string}`,
  paymentId: string
): void {
  const storageKey = `payment_history_${address}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    
    const history: PaymentHistory[] = JSON.parse(stored);
    const filtered = history.filter(item => item.id !== paymentId);
    
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete payment history:', error);
  }
}

/**
 * 全ての決済履歴を削除
 */
export function clearAllPaymentHistory(address: `0x${string}`): void {
  const storageKey = `payment_history_${address}`;
  localStorage.removeItem(storageKey);
}
