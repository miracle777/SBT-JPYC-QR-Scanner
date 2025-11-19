'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { NetworkType } from '../types';
import { getNetworkInfo } from '../utils/network';
import { savePaymentHistory, updatePaymentStatus } from '../utils/paymentHistory';
import { getLocationWithAddress } from '../utils/location';

interface ManualPaymentData {
  address: `0x${string}`;
  amount: string;
  memo?: string;
  network: NetworkType;
  chainId: number;
  contractAddress: `0x${string}`;
  shopName?: string;
}

interface ManualPaymentProcessorProps {
  paymentData: ManualPaymentData;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function ManualPaymentProcessor({ paymentData, onComplete, onCancel }: ManualPaymentProcessorProps) {
  const { address: userAddress, chain } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [step, setStep] = useState<'confirm' | 'sending' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [needsNetworkSwitch, setNeedsNetworkSwitch] = useState(false);

  // トークンの残高をチェック（トークンが追加されているかの判定に使用）
  const { data: tokenBalance } = useReadContract({
    address: paymentData.contractAddress,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId: paymentData.chainId,
  });

  // トークンが追加されているかどうか（残高がundefinedでない場合は追加済みとみなす）
  const isTokenAdded = tokenBalance !== undefined;
  
  // 残高チェック
  const paymentAmountInWei = parseUnits(paymentData.amount, 18);
  const hasEnoughBalance = tokenBalance ? tokenBalance >= paymentAmountInWei : false;

  // デバッグ: paymentDataの内容をログ出力
  console.log('ManualPaymentProcessor initialized with:', {
    address: paymentData.address,
    amount: paymentData.amount,
    contractAddress: paymentData.contractAddress,
    chainId: paymentData.chainId,
    network: paymentData.network,
    tokenBalance: tokenBalance?.toString(),
    tokenBalanceInJPYC: tokenBalance ? (Number(tokenBalance) / 1e18).toString() : 'undefined',
    paymentAmountInWei: paymentAmountInWei.toString(),
    hasEnoughBalance,
    isTokenAdded,
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    pollingInterval: 1000,
  });

  useEffect(() => {
    // ネットワークチェック
    if (chain?.id !== paymentData.chainId) {
      setNeedsNetworkSwitch(true);
    } else {
      setNeedsNetworkSwitch(false);
    }
  }, [chain, paymentData.chainId]);

  useEffect(() => {
    if (isConfirmed && hash && userAddress) {
      if (paymentId) {
        updatePaymentStatus(userAddress, paymentId, 'success', hash);
      }
      setStep('success');
    }
  }, [isConfirmed, hash, userAddress, paymentId]);

  useEffect(() => {
    if (writeError) {
      setErrorMessage(writeError.message || '送金に失敗しました');
      setStep('error');
      if (paymentId && userAddress) {
        updatePaymentStatus(userAddress, paymentId, 'failed');
      }
    }
  }, [writeError, paymentId, userAddress]);

  const handleNetworkSwitch = async () => {
    if (!switchChain) return;
    
    try {
      await switchChain({ chainId: paymentData.chainId });
      setNeedsNetworkSwitch(false);
    } catch (error: any) {
      setErrorMessage(`ネットワークの切り替えに失敗しました: ${error.message}`);
      setStep('error');
    }
  };

  const handleAddToken = async () => {
    try {
      // トークン情報を決定（JPYC または tJPYC）
      let tokenSymbol = 'JPYC';
      let tokenImage = 'https://jpyc.jp/img/logo.png';
      
      // カスタムtJPYCトークンの場合
      const customTokenAddresses = [
        '0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345', // Avalanche Fuji
        '0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a', // Polygon Amoy
      ];
      
      if (customTokenAddresses.some(addr => 
        addr.toLowerCase() === paymentData.contractAddress.toLowerCase()
      )) {
        tokenSymbol = 'tJPYC';
        tokenImage = 'https://jpyc.jp/img/logo.png'; // 同じアイコンを使用
      }
      
      // @ts-ignore
      await window.ethereum?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: paymentData.contractAddress,
            symbol: tokenSymbol,
            decimals: 18,
            image: tokenImage,
          },
        },
      });
    } catch (error: any) {
      console.error('Failed to add token:', error);
    }
  };

  const handleConfirm = async () => {
    if (!userAddress) return;

    // ネットワーク確認
    if (chain?.id !== paymentData.chainId) {
      setErrorMessage('ネットワークを切り替えてから送金してください');
      return;
    }

    setStep('sending');

    // 決済履歴を保存（位置情報を含む）
    const newPaymentId = savePaymentHistory(userAddress, {
      amount: paymentData.amount,
      recipient: paymentData.address,
      network: paymentData.network,
      chainId: paymentData.chainId,
      memo: paymentData.memo,
    });
    setPaymentId(newPaymentId);

    // 位置情報を非同期で取得・更新
    getLocationWithAddress().then((location) => {
      if (location) {
        try {
          const storageKey = `payment_history_${userAddress}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const history = JSON.parse(stored);
            const updated = history.map((item: any) =>
              item.id === newPaymentId ? { ...item, location } : item
            );
            localStorage.setItem(storageKey, JSON.stringify(updated));
          }
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      }
    }).catch((error: any) => {
      console.error('Failed to get location:', error);
    });

    try {
      const amountInWei = parseUnits(paymentData.amount, 18);

      console.log('Sending payment:', {
        contractAddress: paymentData.contractAddress,
        recipient: paymentData.address,
        amount: paymentData.amount,
        amountInWei: amountInWei.toString(),
        chainId: paymentData.chainId,
        currentChainId: chain?.id,
      });

      // wagmi v2のwriteContractは非同期関数を返さないため、awaitを使わない
      writeContract({
        address: paymentData.contractAddress,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'transfer',
        args: [paymentData.address, amountInWei],
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || '送金の実行に失敗しました');
      setStep('error');
      
      if (paymentId && userAddress) {
        updatePaymentStatus(userAddress, paymentId, 'failed');
      }
    }
  };

  const networkInfo = getNetworkInfo(paymentData.network);

  // 確認画面
  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          手動送金の確認
        </h2>

        {needsNetworkSwitch && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-800 mb-2">
                  ネットワークの切り替えが必要です
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  現在のネットワーク: {chain?.name || 'Unknown'} (Chain ID: {chain?.id})<br />
                  必要なネットワーク: {networkInfo.displayName} (Chain ID: {paymentData.chainId})
                </p>
                <button
                  onClick={handleNetworkSwitch}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  ネットワークを切り替える
                </button>
              </div>
            </div>
          </div>
        )}

        {!isTokenAdded && !needsNetworkSwitch && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="font-semibold text-blue-800 mb-2">
                  💡 トークンがウォレットに表示されない場合
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  MetaMaskにトークンを追加すると、残高や送金内容が正しく表示されます
                </p>
                <button
                  onClick={handleAddToken}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  トークンをウォレットに追加
                </button>
              </div>
            </div>
          </div>
        )}

        {tokenBalance !== undefined && !hasEnoughBalance && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-red-800 mb-2">
                  ⚠️ 残高不足
                </div>
                <p className="text-sm text-red-700 mb-2">
                  現在の残高: {(Number(tokenBalance) / 1e18).toLocaleString('ja-JP')} {paymentData.contractAddress.toLowerCase() === '0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a'.toLowerCase() ? 'tJPYC' : 'JPYC'}
                  <br />
                  送金額: {parseFloat(paymentData.amount).toLocaleString('ja-JP')} {paymentData.contractAddress.toLowerCase() === '0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a'.toLowerCase() ? 'tJPYC' : 'JPYC'}
                </p>
                <p className="text-xs text-red-600">
                  送金に必要なトークンが不足しています
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {paymentData.shopName && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-sm text-blue-600 mb-1">送付先名</div>
              <div className="text-xl font-bold text-blue-800">
                {paymentData.shopName}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">送付金額</div>
            <div className="text-3xl font-bold text-gray-800">
              ¥{parseFloat(paymentData.amount).toLocaleString('ja-JP')} JPYC
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">送付先アドレス</div>
            <div className="text-sm font-mono text-gray-800 break-all">
              {paymentData.address}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">ネットワーク</div>
            <div className="text-sm font-semibold" style={{ color: networkInfo.color }}>
              {networkInfo.displayName} (Chain ID: {paymentData.chainId})
            </div>
            {chain?.id !== paymentData.chainId && (
              <div className="text-xs text-orange-600 mt-1">
                ⚠️ 現在のウォレット: {chain?.name || 'Unknown'} (Chain ID: {chain?.id})
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">ネットワーク</div>
            <div className="text-sm font-semibold" style={{ color: networkInfo.color }}>
              {networkInfo.displayName} (Chain ID: {paymentData.chainId})
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">トークンコントラクト</div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded">
                {paymentData.contractAddress}
              </div>
              {/* トークン種類の判定 */}
              {paymentData.contractAddress.toLowerCase() === '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'.toLowerCase() && (
                <div className="text-xs text-blue-600 font-semibold">
                  🏛️ Sepolia公式Faucet JPYC
                </div>
              )}
              {paymentData.contractAddress.toLowerCase() === '0xd3eF95d29A198868241FE374A999fc25F6152253'.toLowerCase() && (
                <div className="text-xs text-purple-600 font-semibold">
                  🏘️ Sepoliaコミュニティ JPYC
                </div>
              )}
              {(paymentData.contractAddress.toLowerCase() === '0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345'.toLowerCase() ||
                paymentData.contractAddress.toLowerCase() === '0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a'.toLowerCase()) && (
                <div className="text-xs text-green-600 font-semibold">
                  🎯 カスタムトークン: tJPYC
                </div>
              )}
            </div>
          </div>

          {paymentData.memo && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">メモ</div>
              <div className="text-sm text-gray-800">
                {paymentData.memo}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={needsNetworkSwitch || isPending || !hasEnoughBalance}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            title={!hasEnoughBalance ? '残高が不足しています' : ''}
          >
            <Send className="w-5 h-5" />
            送金する
          </button>
          <button
            onClick={onCancel}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          >
            キャンセル
          </button>
        </div>

        {needsNetworkSwitch && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
            <p className="text-sm text-yellow-800 font-semibold">
              ⚠️ 先に上のボタンでネットワークを切り替えてください
            </p>
          </div>
        )}
        
        {!needsNetworkSwitch && !hasEnoughBalance && tokenBalance !== undefined && (
          <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-lg text-center">
            <p className="text-sm text-red-800 font-semibold">
              ⚠️ トークン残高が不足しているため送金できません
            </p>
          </div>
        )}
      </div>
    );
  }

  // 送信中
  if (step === 'sending' || isConfirming) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            {isConfirming ? 'トランザクション確認中...' : '送金処理中...'}
          </h3>
          <p className="text-gray-600">
            {isConfirming 
              ? 'ブロックチェーンでトランザクションを確認しています'
              : 'ウォレットで送金を承認してください'}
          </p>
          {hash && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">トランザクションハッシュ</div>
              <div className="text-xs font-mono text-gray-700 break-all">
                {hash}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 成功
  if (step === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            送金完了！
          </h3>
          <p className="text-gray-600 mb-4">
            ¥{parseFloat(paymentData.amount).toLocaleString('ja-JP')} JPYC を送金しました
          </p>
          {hash && (
            <div className="mb-6">
              <a
                href={`${networkInfo.blockExplorerUrl}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                トランザクションを確認
              </a>
            </div>
          )}
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    );
  }

  // エラー
  if (step === 'error') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            送金エラー
          </h3>
          <p className="text-red-600 mb-6">
            {errorMessage}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep('confirm')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              再試行
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
