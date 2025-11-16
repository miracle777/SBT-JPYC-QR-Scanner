'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { AlertCircle, CheckCircle2, Loader2, Send, Award } from 'lucide-react';
import { PaymentQRData, NetworkType } from '../types';
import { parseQRCodeData, validateNetwork, getNetworkInfo } from '../utils/network';
import { canPayWithNetwork, getUserVisitCount, checkUserHasSBT } from '../utils/sbt';
import { NetworkValidation } from './NetworkValidation';
import { savePaymentHistory, updatePaymentStatus } from '../utils/paymentHistory';
import { getLocationWithAddress } from '../utils/location';

interface PaymentProcessorProps {
  qrData: string | null;
  onComplete?: () => void;
}

export function PaymentProcessor({ qrData, onComplete }: PaymentProcessorProps) {
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [parsedData, setParsedData] = useState<PaymentQRData | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [step, setStep] = useState<'parse' | 'validate' | 'confirm' | 'sending' | 'success' | 'error'>('parse');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [sbtProgress, setSbtProgress] = useState<{ shopId: number; visits: number; hasSBT: boolean } | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!qrData || !address) return;

    const parsed = parseQRCodeData(qrData);
    if (!parsed) {
      setErrorMessage('QRコードの形式が無効です');
      setStep('error');
      return;
    }

    setParsedData(parsed);
    
    if (parsed.network) {
      const validation = validateNetwork(chain?.id || 1, parsed.network as NetworkType);
      setValidationResult(validation);
      
      if (validation.isValid) {
        setStep('confirm');
      } else {
        setStep('validate');
      }
    } else {
      setStep('confirm');
    }
  }, [qrData, address, chain]);

  useEffect(() => {
    if (isConfirmed && hash && parsedData && address) {
      // 決済成功時に履歴を更新
      if (paymentId) {
        updatePaymentStatus(address, paymentId, 'success', hash);
        
        // 正しいnetworkとchainIdで更新
        const currentChainId = chain?.id || 1;
        const chainIdToNetwork: Record<number, NetworkType> = {
          1: 'ethereum',
          11155111: 'sepolia',
          137: 'polygon',
          80002: 'polygon-amoy',
          42161: 'arbitrum',
          421614: 'arbitrum-sepolia',
          43114: 'avalanche',
          43113: 'avalanche-fuji',
        };
        const currentNetwork = chainIdToNetwork[currentChainId] || 'ethereum';
        
        // 履歴のnetworkとchainIdを更新
        const storageKey = `payment_history_${address}`;
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const history = JSON.parse(stored);
            const updated = history.map((item: any) => 
              item.id === paymentId 
                ? { ...item, network: currentNetwork, chainId: currentChainId, status: 'success', txHash: hash }
                : item
            );
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log('Updated payment history with correct network:', currentNetwork, currentChainId);
          }
        } catch (error) {
          console.error('Failed to update payment network:', error);
        }
        
        // SBT進捗を取得（shopIdがある場合）
        if (parsedData.shopId) {
          checkSBTProgress(address, Number(parsedData.shopId));
        }
      }
      setStep('success');
      
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    }
  }, [isConfirmed, hash, parsedData, address, paymentId, onComplete, chain]);
  
  const checkSBTProgress = async (userAddress: `0x${string}`, shopId: number) => {
    try {
      const visits = await getUserVisitCount(userAddress, shopId);
      const hasSBT = await checkUserHasSBT(userAddress, shopId);
      setSbtProgress({ shopId, visits, hasSBT });
      console.log(`SBT Progress - Shop ${shopId}: ${visits} visits, has SBT: ${hasSBT}`);
    } catch (error) {
      console.error('Failed to check SBT progress:', error);
    }
  };

  useEffect(() => {
    if (writeError) {
      setErrorMessage(writeError.message);
      setStep('error');
      
      // エラー時に履歴を更新
      if (paymentId && address) {
        updatePaymentStatus(address, paymentId, 'failed');
      }
    }
  }, [writeError, paymentId, address]);

  const handleSwitchNetwork = async () => {
    if (!parsedData?.chainId || !switchChain) return;
    
    try {
      await switchChain({ chainId: parsedData.chainId });
      setStep('confirm');
    } catch (error) {
      setErrorMessage('ネットワークの切り替えに失敗しました');
      setStep('error');
    }
  };

  const handleConfirmPayment = async () => {
    if (!parsedData || !address || !chain) return;

    const amount = parsedData.amount || '0';
    const network = parsedData.network as NetworkType;
    
    // SBT検証
    if (parsedData.sbtRequired && parsedData.sbtRequired.length > 0) {
      const canPay = await canPayWithNetwork(address, network, BigInt(parseFloat(amount) * 10 ** 18));
      
      if (!canPay.canPay) {
        setErrorMessage(canPay.reason || 'この決済を実行する権限がありません');
        setStep('error');
        return;
      }
    }

    // 実際のウォレットのchainIdとnetworkを使用
    const currentChainId = chain.id;
    const chainIdToNetwork: Record<number, NetworkType> = {
      1: 'ethereum',
      11155111: 'sepolia',
      137: 'polygon',
      80002: 'polygon-amoy',
      42161: 'arbitrum',
      421614: 'arbitrum-sepolia',
      43114: 'avalanche',
      43113: 'avalanche-fuji',
    };
    const currentNetwork = chainIdToNetwork[currentChainId] || 'ethereum';
    
    console.log('Saving payment with network:', currentNetwork, 'chainId:', currentChainId);

    // 履歴に保存（決済実行前に保存）
    const newPaymentId = savePaymentHistory(address, {
      amount,
      recipient: parsedData.address,
      network: currentNetwork,
      chainId: currentChainId,
      memo: parsedData.memo,
      sbtUsed: parsedData.sbtRequired,
    });
    setPaymentId(newPaymentId);

    // 位置情報を取得（バックグラウンドで）
    const locationPromise = getLocationWithAddress();

    // 位置情報が取得できたら履歴を更新
    locationPromise.then((location: any) => {
      console.log('Location acquired:', location);
      if (location) {
        const storageKey = `payment_history_${address}`;
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const history = JSON.parse(stored);
            const updated = history.map((item: any) => 
              item.id === newPaymentId ? { ...item, location } : item
            );
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log('Location updated for payment:', newPaymentId, location);
          }
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      } else {
        console.log('Location not available');
      }
    }).catch((error: any) => {
      console.error('Failed to get location:', error);
    });

    setStep('sending');

    try {
      // JPYC ERC20トークン転送
      // QRコードからcontractAddressを取得、なければデフォルト（Sepolia Official）
      const jpycAddress = parsedData.contractAddress || '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB';
      const amountInWei = parseUnits(amount, 18);

      console.log('Payment details:', {
        contractAddress: jpycAddress,
        recipient: parsedData.address,
        amount: amount,
        amountInWei: amountInWei.toString(),
        chainId: parsedData.chainId,
        shopName: parsedData.shopName,
      });

      writeContract({
        address: jpycAddress,
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
        args: [parsedData.address, amountInWei],
      });
    } catch (error: any) {
      setErrorMessage(error.message || '決済の実行に失敗しました');
      setStep('error');
      
      if (paymentId && address) {
        updatePaymentStatus(address, paymentId, 'failed');
      }
    }
  };

  if (!parsedData) {
    return null;
  }

  if (step === 'validate' && validationResult) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          ネットワーク確認
        </h2>
        <NetworkValidation
          validation={validationResult}
          qrData={parsedData}
          onSwitchNetwork={handleSwitchNetwork}
          onConfirm={() => setStep('confirm')}
          onCancel={onComplete}
        />
      </div>
    );
  }

  if (step === 'confirm') {
    const networkInfo = parsedData.network ? getNetworkInfo(parsedData.network as NetworkType) : null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          決済内容の確認
        </h2>
        
        <div className="space-y-4 mb-6">
          {parsedData.shopName && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-sm text-blue-600 mb-1">店舗名</div>
              <div className="text-xl font-bold text-blue-800">
                {parsedData.shopName}
              </div>
              {parsedData.shopId && (
                <div className="text-xs text-blue-600 mt-1">
                  店舗ID: {parsedData.shopId}
                </div>
              )}
            </div>
          )}
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">支払い金額</div>
            <div className="text-2xl font-bold text-gray-800">
              ¥{parsedData.amount || '0'} JPYC
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">送信先（店舗ウォレット）</div>
            <div className="text-sm font-mono text-gray-800 break-all">
              {parsedData.address}
            </div>
          </div>
          
          {parsedData.contractAddress && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">JPYCコントラクト</div>
              <div className="text-xs font-mono text-gray-700 break-all">
                {parsedData.contractAddress}
              </div>
            </div>
          )}
          
          {networkInfo && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">ネットワーク</div>
              <div className="font-semibold" style={{ color: networkInfo.color }}>
                {networkInfo.displayName}
              </div>
            </div>
          )}
          
          {parsedData.memo && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">メモ</div>
              <div className="text-sm text-gray-800">
                {parsedData.memo}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onComplete}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={isPending}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            <Send className="w-4 h-4" />
            送金する
          </button>
        </div>
      </div>
    );
  }

  if (step === 'sending' || isConfirming) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isPending ? '送金処理中...' : 'トランザクション確認中...'}
          </h3>
          <p className="text-sm text-gray-600">
            しばらくお待ちください
          </p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            決済完了!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            ¥{parsedData.amount} JPYC の送金が完了しました
          </p>
          {hash && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">トランザクションハッシュ</div>
              <div className="text-xs font-mono text-gray-800 break-all">
                {hash}
              </div>
            </div>
          )}
          
          {/* SBT獲得進捗 */}
          {sbtProgress && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">SBT獲得進捗</h4>
              </div>
              {sbtProgress.hasSBT ? (
                <p className="text-sm text-purple-700">
                  ✅ このショップのSBTは既に獲得済みです!
                </p>
              ) : (
                <div>
                  <p className="text-sm text-purple-700 mb-2">
                    訪問回数: {sbtProgress.visits}/3回
                  </p>
                  <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(sbtProgress.visits / 3) * 100}%` }}
                    ></div>
                  </div>
                  {sbtProgress.visits >= 3 ? (
                    <p className="text-sm font-semibold text-purple-800">
                      🎉 SBT獲得条件達成! MetaMaskでインポートして確認してください
                    </p>
                  ) : (
                    <p className="text-sm text-purple-700">
                      あと{3 - sbtProgress.visits}回の訪問でSBT獲得!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            エラーが発生しました
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {errorMessage}
          </p>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return null;
}
