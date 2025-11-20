'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { AlertCircle, CheckCircle2, Loader2, Send, Award } from 'lucide-react';
import { PaymentQRData, NetworkType } from '../types';
import { parseQRCodeData, validateNetwork, getNetworkInfo, detectQRCodeFormat, describeQRCodeFormat } from '../utils/network';
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
  const [qrFormat, setQrFormat] = useState<string>('');
  const [qrDescription, setQrDescription] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [step, setStep] = useState<'parse' | 'validate' | 'confirm' | 'sending' | 'success' | 'error'>('parse');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [sbtProgress, setSbtProgress] = useState<{ shopId: number; visits: number; hasSBT: boolean } | null>(null);
  // 手動入力可能な金額の状態を追加
  const [editableAmount, setEditableAmount] = useState<string>('');
  const [isEditingAmount, setIsEditingAmount] = useState<boolean>(false);
  const [canEditAmount, setCanEditAmount] = useState<boolean>(false);
  const [editableContractAddress, setEditableContractAddress] = useState<string>('');
  const [isEditingContract, setIsEditingContract] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1, // 1ブロック確認で完了とする
    pollingInterval: 1000, // 1秒ごとにポーリング（スマホ対応）
  });

  useEffect(() => {
    if (!qrData || !address) return;

    console.log('Processing QR data:', qrData);
    
    // QR形式の検出
    const format = detectQRCodeFormat(qrData);
    const description = describeQRCodeFormat(qrData);
    setQrFormat(format);
    setQrDescription(description);

    const parsed = parseQRCodeData(qrData);
    console.log('Parsed payment data:', parsed);
    
    if (!parsed) {
      setErrorMessage(`QRコード解析に失敗しました。\n形式: ${format}\n説明: ${description}`);
      setStep('error');
      return;
    }

    setParsedData(parsed);
    
    // QRコード形式に応じて金額編集可能かを判定
    // MetaMask等の標準形式（ethereum:）の場合は編集可能、JPYC形式は編集不可
    const isStandardEthereumFormat = qrData.startsWith('ethereum:');
    const isJSONFormat = format.includes('JPYC') || format.includes('JSON');
    const allowEdit = isStandardEthereumFormat || (!isJSONFormat && (!parsed.amount || parsed.amount === '0'));
    setCanEditAmount(allowEdit);
    
    // ✅ 修正: 金額の変換処理
    let initialAmount = parsed.amount || '0';
    
    // EIP-681形式（ethereum:で始まる）またはtype=ethereumの場合のみWei→JPYC変換
    // JPYC_PAYMENT形式（type=jpyc）は既にJPYC単位なので変換不要
    const needsConversion = (isStandardEthereumFormat && parsed.type === 'ethereum') || parsed.type === 'ethereum';
    
    if (needsConversion && parsed.amount) {
      try {
        // Wei単位（18桁）からJPYC単位に変換
        const amountInJPYC = (BigInt(parsed.amount) / BigInt(10 ** 18)).toString();
        initialAmount = amountInJPYC;
        console.log('EIP-681 amount converted:', parsed.amount, 'Wei ->', amountInJPYC, 'JPYC');
      } catch (error) {
        console.error('Failed to convert Wei to JPYC:', error);
        initialAmount = parsed.amount; // フォールバック
      }
    } else if (parsed.type === 'jpyc' || parsed.type === 'tjpyc') {
      // JPYC形式は既にJPYC単位なのでそのまま使用
      console.log('JPYC format - amount already in JPYC units:', parsed.amount);
      initialAmount = parsed.amount || '0';
    }
    
    // 手動編集可能な金額を初期化
    setEditableAmount(initialAmount);
    
    // ネットワークを初期化
    const detectedNetwork = (parsed.network as NetworkType) || 'sepolia';
    setSelectedNetwork(detectedNetwork);
    
    // ネットワークに応じた正しいコントラクトアドレスを設定
    const getDefaultContractAddress = (network: NetworkType): string => {
      switch (network) {
        case 'ethereum':
        case 'polygon':
        case 'avalanche':
          return '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'; // 本番環境
        case 'sepolia':
          return '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'; // Sepoliaテスト
        case 'polygon-amoy':
        case 'avalanche-fuji':
          return '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'; // テスト環境
        default:
          return '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB';
      }
    };
    
    // コントラクトアドレスを初期化（QRコードに含まれていない場合はネットワークに応じたデフォルト値）
    setEditableContractAddress(parsed.contractAddress || getDefaultContractAddress(detectedNetwork));
    
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

    // editableAmountを使用（手動入力された金額）
    const amount = editableAmount || '0';
    const numericAmount = parseFloat(amount);
    
    // 金額の検証
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('有効な金額を入力してください（0より大きい値）');
      setStep('error');
      return;
    }
    
    if (numericAmount > 1000000) {
      setErrorMessage('金額が大きすぎます（1,000,000以下で入力してください）');
      setStep('error');
      return;
    }
    
    // コントラクトアドレスの検証
    if (!editableContractAddress || !editableContractAddress.startsWith('0x') || editableContractAddress.length !== 42) {
      setErrorMessage('有効なコントラクトアドレスを入力してください（0xで始まる42文字）');
      setStep('error');
      return;
    }
    
    const network = selectedNetwork || 'sepolia';
    
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
      // 編集されたcontractAddressを使用
      const jpycAddress = editableContractAddress || '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB';
      const amountInWei = parseUnits(amount, 18);

      console.log('Payment details:', {
        contractAddress: jpycAddress,
        originalContractAddress: parsedData.contractAddress,
        selectedNetwork: selectedNetwork,
        originalNetwork: parsedData.network,
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
    const networkInfo = selectedNetwork ? getNetworkInfo(selectedNetwork) : null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          決済内容の確認
        </h2>
        
        {/* QR形式情報表示 */}
        {qrFormat && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">QRコード形式</div>
            <div className="text-sm font-medium text-gray-800">
              {qrFormat}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {qrDescription}
            </div>
            
            {/* デバッグ情報（開発時のみ表示） */}
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">📊 詳細情報（デバッグ用）</summary>
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono break-all">
                <div className="mb-2">
                  <div className="font-semibold text-gray-700">元のQRデータ:</div>
                  <div className="text-gray-600">{qrData?.substring(0, 200)}{qrData && qrData.length > 200 ? '...' : ''}</div>
                </div>
                <div className="mb-2">
                  <div className="font-semibold text-gray-700">パース結果:</div>
                  <div className="text-gray-600">
                    type: {parsedData.type}<br/>
                    amount: {parsedData.amount || '未設定'}<br/>
                    network: {parsedData.network || '未設定'}<br/>
                    contract: {parsedData.contractAddress?.substring(0, 10)}...
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">表示金額:</div>
                  <div className="text-gray-600">{editableAmount} JPYC</div>
                </div>
              </div>
            </details>
            
            {!canEditAmount && (
              <div className="mt-2 px-2 py-1 bg-blue-100 border border-blue-200 rounded text-xs text-blue-700">
                💰 この形式では金額は決済QR作成時に固定されています
              </div>
            )}
            {canEditAmount && (
              <div className="mt-2 px-2 py-1 bg-green-100 border border-green-200 rounded text-xs text-green-700">
                ✏️ この形式では金額を手動で設定できます
              </div>
            )}
          </div>
        )}
        
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
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">支払い金額</div>
              {canEditAmount ? (
                <button
                  onClick={() => setIsEditingAmount(!isEditingAmount)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isEditingAmount ? 'キャンセル' : '金額を編集'}
                </button>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  金額固定
                </div>
              )}
            </div>
            
            {canEditAmount && isEditingAmount ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-600">¥</div>
                  <input
                    type="number"
                    value={editableAmount}
                    onChange={(e) => setEditableAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="金額を入力"
                    min="0"
                    step="1"
                  />
                  <div className="text-sm text-gray-600">{parsedData.tokenSymbol || 'JPYC'}</div>
                </div>
                
                {/* 便利な金額ボタン */}
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((presetAmount) => (
                    <button
                      key={presetAmount}
                      onClick={() => setEditableAmount(presetAmount.toString())}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                      ¥{presetAmount}
                    </button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditingAmount(false);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    確定
                  </button>
                  <button
                    onClick={() => {
                      setEditableAmount(parsedData.amount || '0');
                      setIsEditingAmount(false);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    リセット
                  </button>
                </div>
                {parsedData.amount && editableAmount !== parsedData.amount && (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                    💡 元の金額: ¥{parsedData.amount} {parsedData.tokenSymbol || 'JPYC'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-800">
                ¥{editableAmount || '0'} {parsedData.tokenSymbol || 'JPYC'}
                {canEditAmount && parsedData.amount && editableAmount !== parsedData.amount && (
                  <div className="text-sm font-normal text-amber-600 mt-1">
                    元の金額から変更されています（元: ¥{parsedData.amount}）
                  </div>
                )}
                {!canEditAmount && (
                  <div className="text-sm font-normal text-gray-500 mt-1">
                    💡 JPYC決済QRコードのため金額は固定です
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">送信先（店舗ウォレット）</div>
            <div className="text-sm font-mono text-gray-800 break-all">
              {parsedData.address}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">{parsedData.tokenSymbol || 'JPYC'}コントラクト</div>
              {canEditAmount ? (
                <button
                  onClick={() => setIsEditingContract(!isEditingContract)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isEditingContract ? 'キャンセル' : 'アドレスを編集'}
                </button>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  アドレス固定
                </div>
              )}
            </div>
            
            {canEditAmount && isEditingContract ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">コントラクトアドレス</label>
                  <input
                    type="text"
                    value={editableContractAddress}
                    onChange={(e) => setEditableContractAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-mono"
                    placeholder="0x..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">ネットワーク</label>
                  <select
                    value={selectedNetwork || 'sepolia'}
                    onChange={(e) => setSelectedNetwork(e.target.value as NetworkType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  >
                    <option value="ethereum">Ethereum Mainnet</option>
                    <option value="sepolia">Sepolia Testnet</option>
                    <option value="polygon">Polygon Mainnet</option>
                    <option value="polygon-amoy">Polygon Amoy Testnet</option>
                    <option value="avalanche">Avalanche C-Chain</option>
                    <option value="avalanche-fuji">Avalanche Fuji Testnet</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsEditingContract(false)}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    確定
                  </button>
                  <button
                    onClick={() => {
                      // ネットワークに応じたデフォルトアドレスを設定
                      const network = (parsedData.network as NetworkType) || 'sepolia';
                      let defaultAddress = '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'; // Sepolia
                      if (network === 'ethereum' || network === 'polygon' || network === 'avalanche') {
                        defaultAddress = '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'; // 本番
                      } else if (network === 'polygon-amoy' || network === 'avalanche-fuji') {
                        defaultAddress = '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'; // テスト
                      }
                      setEditableContractAddress(parsedData.contractAddress || defaultAddress);
                      setSelectedNetwork(network);
                      setIsEditingContract(false);
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    リセット
                  </button>
                </div>
                
                {/* よく使うコントラクトアドレスのプリセット */}
                <div>
                  <div className="text-xs text-gray-600 mb-2">よく使うアドレス:</div>
                  <div className="space-y-1">
                    <button
                      onClick={() => setEditableContractAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB')}
                      className="w-full text-left text-xs bg-gray-50 border border-gray-200 rounded p-2 hover:bg-gray-100 transition"
                    >
                      <div className="font-medium">公式JPYC (Sepolia)</div>
                      <div className="text-gray-500 font-mono">0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB</div>
                    </button>
                    <button
                      onClick={() => setEditableContractAddress('0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29')}
                      className="w-full text-left text-xs bg-gray-50 border border-gray-200 rounded p-2 hover:bg-gray-100 transition"
                    >
                      <div className="font-medium">公式JPYC (Mainnet/Polygon/Avalanche)</div>
                      <div className="text-gray-500 font-mono">0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-mono text-gray-700 break-all mb-2">
                  {editableContractAddress}
                </div>
                {canEditAmount && (() => {
                  // ネットワークに応じたデフォルトアドレスを計算
                  const network = (parsedData.network as NetworkType) || 'sepolia';
                  let defaultAddress = '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB';
                  if (network === 'ethereum' || network === 'polygon' || network === 'avalanche') {
                    defaultAddress = '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29';
                  } else if (network === 'polygon-amoy' || network === 'avalanche-fuji') {
                    defaultAddress = '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29';
                  }
                  const originalAddress = parsedData.contractAddress || defaultAddress;
                  return editableContractAddress !== originalAddress;
                })() && (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-1">
                    ⚠️ 元のアドレスから変更されています
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">ネットワーク</div>
            <div className="font-semibold" style={{ color: getNetworkInfo(selectedNetwork || 'sepolia')?.color }}>
              {getNetworkInfo(selectedNetwork || 'sepolia')?.displayName}
            </div>
            {canEditAmount && selectedNetwork !== (parsedData.network as NetworkType) && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-1 mt-2">
                ⚠️ 元のネットワーク「{getNetworkInfo(parsedData.network as NetworkType)?.displayName}」から変更されています
              </div>
            )}
          </div>
          
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
            disabled={
              isPending || 
              !editableAmount || 
              parseFloat(editableAmount || '0') <= 0 ||
              !editableContractAddress ||
              !editableContractAddress.startsWith('0x') ||
              editableContractAddress.length !== 42
            }
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
            ¥{editableAmount} JPYC の送金が完了しました
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
