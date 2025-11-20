'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { AlertCircle, CheckCircle2, Loader2, Send, Award } from 'lucide-react';
import { PaymentQRData, NetworkType } from '../types';
import { parseQRCodeData, validateNetwork, getNetworkInfo, detectQRCodeFormat, describeQRCodeFormat, getNetworkFromChainId } from '../utils/network';
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
    
    if (!parsed) {
      setErrorMessage(`QRコード解析に失敗しました。\n形式: ${format}\n説明: ${description}`);
      setStep('error');
      return;
    }

    setParsedData(parsed);
    
    // QRコード決済では金額とコントラクトアドレスの変更を禁止（店舗決済のセキュリティ）
    // 店舗が設定した金額を顧客が変更できてしまうのは危険
    setCanEditAmount(false);
    
    // parseQRCodeData が既にJPYC単位に変換済みなのでそのまま使用
    setEditableAmount(parsed.amount || '0');
    
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
    
    // ネットワーク検証を実行（parsed を使用）
    const paymentNetwork = (parsed.network as NetworkType) || 'sepolia';
    const paymentNetworkInfo = getNetworkInfo(paymentNetwork);
    const paymentChainId = paymentNetworkInfo.chainId;
    
    // 現在のウォレットのネットワークと比較
    const currentChainId = chain?.id || 1;
    const isNetworkMatch = currentChainId === paymentChainId;
    
    if (isNetworkMatch) {
      // ネットワークが一致している場合は確認画面へ
      console.log('✅ Network matches. Proceeding to confirm.');
      setValidationResult({
        isValid: true,
        currentNetwork: getNetworkFromChainId(currentChainId) || 'ethereum',
        requiredNetwork: paymentNetwork,
        mismatch: false,
        message: `ネットワークが正しく設定されています (${paymentNetworkInfo.displayName})`,
      });
      setStep('confirm');
    } else {
      // ネットワークが不一致の場合は検証画面へ
      console.log('⚠️ Network mismatch detected. Showing validation screen.');
      const currentNetwork = getNetworkFromChainId(currentChainId) || 'ethereum';
      setValidationResult({
        isValid: false,
        currentNetwork,
        requiredNetwork: paymentNetwork,
        mismatch: true,
        message: `ネットワークが異なります。現在: ${getNetworkInfo(currentNetwork).displayName}, 必要: ${paymentNetworkInfo.displayName}`,
        action: 'switch-network',
      });
      setStep('validate');
    }
  }, [qrData, address, chain]);

  useEffect(() => {
    if (isConfirmed && hash && parsedData && address) {
      // 決済成功時に履歴を更新（ステータスとtxHashのみ更新、networkとchainIdは保存時の値を維持）
      if (paymentId) {
        updatePaymentStatus(address, paymentId, 'success', hash);
        
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
      console.log('🔄 Switching network to', parsedData.chainId);
      await switchChain({ chainId: parsedData.chainId });
      console.log('✅ Network switched successfully');
      
      // ネットワーク切り替え後、ウォレットの状態が安定するまで待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 検証結果を更新して確認画面へ
      setValidationResult({
        isValid: true,
        currentNetwork: parsedData.network as NetworkType,
        requiredNetwork: parsedData.network as NetworkType,
        mismatch: false,
        message: 'ネットワークが正しく切り替わりました',
      });
      setStep('confirm');
    } catch (error: any) {
      console.error('❌ Network switch failed:', error);
      setErrorMessage(`ネットワークの切り替えに失敗しました: ${error.message || '不明なエラー'}`);
      setStep('error');
    }
  };

  // トークンをMetaMaskに追加する関数
  const handleAddTokenToWallet = async (contractAddress: string, tokenSymbol?: string) => {
    try {
      // トークン情報を決定
      let symbol = tokenSymbol || 'JPYC';
      let tokenImage = 'https://jpyc.jp/img/logo.png';
      
      // カスタムtJPYCトークンの場合
      const customTokenAddresses = [
        '0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345', // Avalanche Fuji
        '0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a', // Polygon Amoy
      ];
      
      if (customTokenAddresses.some(addr => 
        addr.toLowerCase() === contractAddress.toLowerCase()
      )) {
        symbol = 'tJPYC';
      }
      
      console.log('🪙 Adding token to MetaMask:', { contractAddress, symbol });
      
      // @ts-ignore
      const wasAdded = await window.ethereum?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractAddress,
            symbol: symbol,
            decimals: 18,
            image: tokenImage,
          },
        },
      });
      
      if (wasAdded) {
        console.log('✅ Token added to MetaMask successfully');
      }
      
      return wasAdded;
    } catch (error: any) {
      console.error('Failed to add token:', error);
      return false;
    }
  };

  const handleConfirmPayment = async () => {
    if (!parsedData || !address || !chain) return;

    // QRコードまたは手動選択されたネットワーク情報を取得
    const paymentNetwork = selectedNetwork || (parsedData.network as NetworkType) || 'sepolia';
    const paymentNetworkInfo = getNetworkInfo(paymentNetwork);
    const paymentChainId = paymentNetworkInfo.chainId;

    // ネットワーク不一致の再確認（念のため）
    if (chain.id !== paymentChainId) {
      setErrorMessage(`ネットワークを${paymentNetworkInfo.displayName}に切り替えてから送金してください（現在: Chain ID ${chain.id}）`);
      setStep('error');
      return;
    }

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
    
    // SBT検証
    if (parsedData.sbtRequired && parsedData.sbtRequired.length > 0) {
      const canPay = await canPayWithNetwork(address, paymentNetwork, BigInt(parseFloat(amount) * 10 ** 18));
      
      if (!canPay.canPay) {
        setErrorMessage(canPay.reason || 'この決済を実行する権限がありません');
        setStep('error');
        return;
      }
    }
    
    console.log('Saving payment with network:', paymentNetwork, 'chainId:', paymentChainId, 'currentWalletChainId:', chain.id);

    // ✅ ネットワーク不一致チェック - トランザクション実行前にウォレットを正しいネットワークに切り替え
    if (chain.id !== paymentChainId) {
      console.log('⚠️ Network mismatch detected. Switching from', chain.id, 'to', paymentChainId);
      
      if (!switchChain) {
        setErrorMessage(`ネットワークを${paymentNetworkInfo.displayName}に切り替えてください（現在: Chain ID ${chain.id}）`);
        setStep('error');
        return;
      }

      try {
        setStep('sending');
        await switchChain({ chainId: paymentChainId });
        console.log('✅ Network switched successfully to', paymentChainId);
        // ネットワーク切り替え後、ウォレットの状態が安定するまで待機
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (switchError: any) {
        console.error('❌ Network switch failed:', switchError);
        setErrorMessage(`ネットワークの切り替えに失敗しました: ${switchError.message || '不明なエラー'}`);
        setStep('error');
        return;
      }
    }

    // ネットワーク切り替え後、現在のチェーンIDを再確認
    // Note: chain.idは反応的に更新されるため、ここで再度確認する必要がある
    console.log('Current wallet chain after switch attempt:', chain?.id, 'Expected:', paymentChainId);

    // 履歴に保存（決済実行前に保存）- QRコードのネットワーク情報を使用
    const newPaymentId = savePaymentHistory(address, {
      amount,
      recipient: parsedData.address,
      network: paymentNetwork,
      chainId: paymentChainId,
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

    // トークンをMetaMaskに追加（MetaMaskで正しい金額を表示するため）
    const jpycAddress = editableContractAddress || '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB';
    try {
      await handleAddTokenToWallet(jpycAddress, parsedData.tokenSymbol);
      // トークン追加後、少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (tokenError) {
      console.warn('Token add failed, but continuing with transaction:', tokenError);
      // トークン追加失敗しても決済は続行
    }

    try {
      // JPYC ERC20トークン転送
      // parseQRCodeDataが既にJPYC単位に変換しているので、ここでWei単位に変換
      const amountInWei = parseUnits(amount, 18);

      // QRコードまたは手動選択されたネットワーク情報を使用
      const paymentNetwork = selectedNetwork || (parsedData.network as NetworkType) || 'sepolia';
      const networkInfo = getNetworkInfo(paymentNetwork);
      const paymentChainId = networkInfo.chainId;

      // 最終的なネットワーク確認
      if (chain?.id !== paymentChainId) {
        throw new Error(`ネットワークが一致しません。現在: ${chain?.id}, 必要: ${paymentChainId} (${networkInfo.displayName})`);
      }

      console.log('Payment details:', {
        contractAddress: jpycAddress,
        originalContractAddress: parsedData.contractAddress,
        selectedNetwork: selectedNetwork,
        originalNetwork: parsedData.network,
        recipient: parsedData.address,
        amount: amount,
        amountInWei: amountInWei.toString(),
        qrCodeChainId: parsedData.chainId,
        paymentChainId: paymentChainId,
        currentWalletChainId: chain?.id,
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
        chainId: paymentChainId,
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
          ⚠️ ネットワーク確認が必要です
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
    const paymentNetwork = selectedNetwork || (parsedData.network as NetworkType) || 'sepolia';
    const paymentNetworkInfo = getNetworkInfo(paymentNetwork);
    const paymentChainId = paymentNetworkInfo.chainId;
    const isNetworkMismatch = chain?.id !== paymentChainId;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          決済内容の確認
        </h2>
        
        {/* ネットワーク不一致警告 */}
        {isNetworkMismatch && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-800 mb-2">
                  ⚠️ ネットワークの切り替えが必要です
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  現在のネットワーク: <strong>{chain?.name || 'Unknown'}</strong> (Chain ID: {chain?.id})<br />
                  必要なネットワーク: <strong>{paymentNetworkInfo.displayName}</strong> (Chain ID: {paymentChainId})
                </p>
                <button
                  onClick={async () => {
                    if (!switchChain) {
                      setErrorMessage('ネットワークの切り替えができません');
                      setStep('error');
                      return;
                    }
                    try {
                      await switchChain({ chainId: paymentChainId });
                      await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error: any) {
                      setErrorMessage(`ネットワークの切り替えに失敗しました: ${error.message}`);
                      setStep('error');
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  ネットワークを切り替える
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* トークン追加推奨メッセージ */}
        {!isNetworkMismatch && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="font-semibold text-blue-800 mb-2">
                  💡 MetaMaskで正しい金額を表示するために
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  トークンをMetaMaskに追加すると、送金画面で正しい金額が表示されます。<br/>
                  追加しない場合、MetaMaskで異常に大きな数値が表示されることがありますが、実際の送金額は正しく処理されます。
                </p>
                <button
                  onClick={async () => {
                    await handleAddTokenToWallet(editableContractAddress, parsedData.tokenSymbol);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  🪙 トークンをMetaMaskに追加
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* デバッグ情報表示 - スマホでも見える */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
          <div className="text-sm font-semibold text-blue-800 mb-2">🔍 決済情報デバッグ</div>
          <div className="space-y-2 text-xs">
            <div className="bg-white p-2 rounded border border-blue-200">
              <div className="font-semibold text-blue-700">QR形式:</div>
              <div className="text-gray-700">{qrFormat}</div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-200">
              <div className="font-semibold text-blue-700">パース結果 type:</div>
              <div className="text-gray-700">{parsedData.type}</div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-200">
              <div className="font-semibold text-blue-700">QRの金額データ:</div>
              <div className="text-gray-700 font-mono break-all">{parsedData.amount || '未設定'}</div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-200">
              <div className="font-semibold text-blue-700">表示用金額 (editableAmount):</div>
              <div className="text-gray-700 font-mono text-lg">{editableAmount} JPYC</div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-200">
              <div className="font-semibold text-blue-700">送信される金額 (Wei):</div>
              <div className="text-gray-700 font-mono break-all">
                {editableAmount ? (BigInt(parseFloat(editableAmount) * 10 ** 18)).toString() : '0'}
              </div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-200">
              <div className="font-semibold text-blue-700">コントラクト:</div>
              <div className="text-gray-700 font-mono text-xs break-all">{editableContractAddress}</div>
            </div>
          </div>
        </div>
        
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
              <div className="text-xs text-gray-500 italic flex items-center gap-1">
                🔒 店舗設定金額（変更不可）
              </div>
            </div>
            
            <div className="text-3xl font-bold text-gray-800">
              ¥{editableAmount || '0'} {parsedData.tokenSymbol || 'JPYC'}
            </div>
            <div className="text-sm font-normal text-blue-600 mt-2 bg-blue-50 border border-blue-200 rounded p-2">
              💡 この金額は店舗が設定したものです。セキュリティのため変更できません。
            </div>
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
              <div className="text-xs text-gray-500 italic flex items-center gap-1">
                🔒 店舗指定（変更不可）
              </div>
            </div>
            
            <div className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded border border-gray-200">
              {editableContractAddress}
            </div>
            
            {/* トークン種類の判定表示 */}
            <div className="mt-2">
              {editableContractAddress.toLowerCase() === '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'.toLowerCase() && (
                <div className="text-xs text-blue-600 font-semibold bg-blue-50 p-2 rounded border border-blue-200">
                  🏛️ Sepolia公式Faucet JPYC
                </div>
              )}
              {editableContractAddress.toLowerCase() === '0xd3eF95d29A198868241FE374A999fc25F6152253'.toLowerCase() && (
                <div className="text-xs text-purple-600 font-semibold bg-purple-50 p-2 rounded border border-purple-200">
                  🏘️ Sepoliaコミュニティ JPYC
                </div>
              )}
              {(editableContractAddress.toLowerCase() === '0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345'.toLowerCase() ||
                editableContractAddress.toLowerCase() === '0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a'.toLowerCase()) && (
                <div className="text-xs text-green-600 font-semibold bg-green-50 p-2 rounded border border-green-200">
                  🎯 カスタムトークン: tJPYC
                </div>
              )}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">ネットワーク</div>
              <div className="text-xs text-gray-500 italic">🔒 固定</div>
            </div>
            <div className="font-semibold text-lg" style={{ color: getNetworkInfo(selectedNetwork || 'sepolia')?.color }}>
              {getNetworkInfo(selectedNetwork || 'sepolia')?.displayName}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Chain ID: {getNetworkInfo(selectedNetwork || 'sepolia')?.chainId}
            </div>
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
        
        {/* ⚠️ ネットワーク不一致警告 - 送金ボタンの直前に配置 */}
        {isNetworkMismatch && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-red-900 mb-2 text-base">
                  ⚠️ ネットワークが違います！
                </div>
                <div className="text-sm text-red-800 mb-3 space-y-1">
                  <div>今: <strong>{chain?.name || 'Unknown'}</strong></div>
                  <div>必要: <strong className="text-red-900">{paymentNetworkInfo.displayName}</strong></div>
                </div>
                <button
                  onClick={async () => {
                    if (!switchChain) {
                      setErrorMessage('ネットワークの切り替えができません');
                      setStep('error');
                      return;
                    }
                    try {
                      await switchChain({ chainId: paymentChainId });
                      await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error: any) {
                      setErrorMessage(`ネットワークの切り替えに失敗しました: ${error.message}`);
                      setStep('error');
                    }
                  }}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-base"
                >
                  ⚡ {paymentNetworkInfo.displayName}に切り替える
                </button>
              </div>
            </div>
          </div>
        )}
        
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
              isNetworkMismatch ||
              !editableAmount || 
              parseFloat(editableAmount || '0') <= 0 ||
              !editableContractAddress ||
              !editableContractAddress.startsWith('0x') ||
              editableContractAddress.length !== 42
            }
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={isNetworkMismatch ? 'ネットワークを切り替えてください' : ''}
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
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <h4 className="font-semibold text-purple-800">SBT獲得進捗</h4>
              </div>
              {sbtProgress.hasSBT ? (
                <p className="text-sm text-purple-700">
                  ✅ このショップのSBTは既に獲得済みです!
                </p>
              ) : (
                <div>
                  <p className="text-sm text-purple-700 mb-2 break-words">
                    店舗ID: {sbtProgress.shopId}
                  </p>
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
                    <p className="text-sm font-semibold text-purple-800 break-words">
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
          
          {/* 閉じるボタン */}
          <button
            onClick={onComplete}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            閉じる
          </button>
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
