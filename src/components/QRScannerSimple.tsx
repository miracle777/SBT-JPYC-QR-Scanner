'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, AlertCircle, Zap, Wallet } from 'lucide-react';

type ScanMode = 'jpyc' | 'wallet-connect';

interface QRScannerComponentProps {
  onScanResult: (data: string) => void;
}

export function QRScannerComponent({ onScanResult }: QRScannerComponentProps) {
  const { address } = useAccount();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('jpyc');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const generateSampleData = useCallback(() => {
    const now = Date.now();
    const sampleAddress = address || '0x1234567890123456789012345678901234567890';
    
    if (scanMode === 'wallet-connect') {
      // WalletConnect/MetaMask形式のサンプル (EIP-681)
      return [
        `ethereum:${sampleAddress}?value=1000000000000000000`, // 1 ETH
        `ethereum:${sampleAddress}@1?value=5e17`, // 0.5 ETH on Mainnet
        `ethereum:0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB@11155111?value=1e18`, // Sepolia
      ];
    } else {
      // JPYC形式のサンプル
      return [
        JSON.stringify({
          type: 'JPYC_PAYMENT',
          version: '1.0',
          amount: '100',
          currency: 'JPYC',
          network: 'sepolia',
          contractAddress: '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB',
          contractName: '公式JPYC (Sepolia)',
          merchant: {
            name: 'テストショップ',
            id: 'JPYC_TEST123',
            description: 'サンプル店舗'
          },
          to: sampleAddress,
          timestamp: now,
          expires: now + (5 * 60 * 1000)
        }),
        `ethereum:${sampleAddress}`,
        `jpyc:amount=50&to=${sampleAddress}`
      ];
    }
  }, [address, scanMode]);

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return;

    try {
      setError(null);
      setIsScanning(true);

      // QrScannerの設定を詳細に指定
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          onScanResult(result.data);
          stopScanning();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 5,
          calculateScanRegion: (video) => {
            const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
            const scanRegionSize = Math.round(0.7 * smallerDimension);
            return {
              x: Math.round((video.videoWidth - scanRegionSize) / 2),
              y: Math.round((video.videoHeight - scanRegionSize) / 2),
              width: scanRegionSize,
              height: scanRegionSize,
            };
          },
        }
      );

      await scannerRef.current.start();
      console.log('Camera started successfully');
    } catch (err: unknown) {
      console.error('Camera start error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`カメラの起動に失敗しました: ${errorMessage}`);
      setIsScanning(false);
    }
  };

  const handleManualSubmit = () => {
    // 手動入力機能を削除
  };

  useEffect(() => {
    let mounted = true;
    
    const checkCamera = async () => {
      try {
        // カメラの利用可能性を確認
        const hasCamera = await QrScanner.hasCamera();
        console.log('Camera availability:', hasCamera);
        
        if (mounted) {
          setHasCamera(hasCamera);
          if (!hasCamera) {
            setError('カメラが利用できません。手動入力をご利用ください。');
          } else {
            console.log('Camera is available');
            // カメラリストを取得（デバッグ用）
            try {
              const cameras = await QrScanner.listCameras(true);
              console.log('Available cameras:', cameras);
            } catch (err) {
              console.warn('Could not list cameras:', err);
            }
          }
        }
      } catch (err: unknown) {
        console.error('Camera check error:', err);
        if (mounted) {
          setHasCamera(false);
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(`カメラの確認中にエラーが発生しました: ${errorMessage}`);
        }
      }
    };
    
    checkCamera();
    
    return () => {
      mounted = false;
      stopScanning();
    };
  }, []);

  if (hasCamera === null) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">カメラを確認中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* スキャンモード切り替え */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          スキャンモード
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setScanMode('jpyc')}
            disabled={isScanning}
            className={`p-4 rounded-lg border-2 transition-all ${
              scanMode === 'jpyc'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Zap className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'jpyc' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className={`font-medium text-sm ${scanMode === 'jpyc' ? 'text-blue-700' : 'text-gray-600'}`}>
              JPYCモード
            </div>
            <div className="text-xs mt-1 text-gray-500">カスタムQR形式</div>
          </button>
          <button
            onClick={() => setScanMode('wallet-connect')}
            disabled={isScanning}
            className={`p-4 rounded-lg border-2 transition-all ${
              scanMode === 'wallet-connect'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Wallet className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'wallet-connect' ? 'text-purple-600' : 'text-gray-400'}`} />
            <div className={`font-medium text-sm ${scanMode === 'wallet-connect' ? 'text-purple-700' : 'text-gray-600'}`}>
              WalletConnect
            </div>
            <div className="text-xs mt-1 text-gray-500">MetaMask等の標準形式</div>
          </button>
        </div>
      </div>

      {/* プラットフォーム情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-800 text-sm">
          <Camera className="h-4 w-4" />
          <span className="font-medium">最適な体験のために：</span>
        </div>
        <p className="text-blue-700 text-xs mt-1">
          QRスキャンはスマートフォンで最適に動作します。PCの場合は手動入力をご利用ください。
        </p>
      </div>

      {/* カメラビュー */}
      <div className="relative w-full">
        {/* カメラプレビュー */}
        <video
          ref={videoRef}
          className={`w-full h-64 sm:h-80 object-cover rounded-lg border-2 ${
            isScanning 
              ? 'border-blue-600 shadow-lg' 
              : 'border-gray-300'
          }`}
          style={{ 
            display: isScanning ? 'block' : 'none',
            backgroundColor: '#000'
          }}
          playsInline
          muted
          autoPlay
        />
        
        {/* プレースホルダー（非スキャン時） */}
        {!isScanning && (
          <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-700 font-medium mb-1">
                カメラでQRコードをスキャン
              </p>
              <p className="text-xs text-gray-500">
                「カメラを起動」ボタンを押してください
              </p>
            </div>
          </div>
        )}

        {/* スキャンオーバーレイ */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* スキャンフレーム */}
            <div className="absolute inset-4 border-2 border-white/70 rounded-lg shadow-lg">
              {/* 角の装飾 */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
              
              {/* スキャンライン */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400 shadow-lg animate-pulse"></div>
            </div>
            
            {/* ステータス表示 */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
              <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                スキャン中
              </div>
              <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs">
                QRコードを枠内に合わせてください
              </div>
            </div>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* コントロールボタン */}
      <div className="space-y-2">
        {/* カメラコントロール */}
        <div className="flex gap-2">
          {!isScanning ? (
            <button
              onClick={startScanning}
              disabled={!hasCamera}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {hasCamera ? 'カメラを起動' : 'カメラ利用不可'}
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              停止
            </button>
          )}
        </div>
      </div>

      {/* デモ用サンプルデータ */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="text-yellow-800 text-xs font-medium mb-2">
          💡 動作確認用サンプルデータ（{scanMode === 'jpyc' ? 'JPYC形式' : 'WalletConnect形式'}）：
        </div>
        <div className="space-y-1">
          {generateSampleData().map((sample, index) => (
            <button
              key={index}
              onClick={() => onScanResult(sample)}
              className="w-full text-left text-xs font-mono bg-white border border-yellow-300 rounded p-2 hover:bg-yellow-50 transition-colors text-gray-700 truncate"
              title={sample}
            >
              {scanMode === 'wallet-connect' 
                ? `WC例${index + 1}: ${sample.substring(0, 40)}...`
                : index === 0 ? '新形式JPYC決済' : index === 1 ? 'Ethereumアドレス' : 'JPYC旧形式'}
            </button>
          ))}
        </div>
      </div>

      {/* 使い方ガイド */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>📱 スマートフォン: QRコードをカメラに向けてスキャン</p>
        <p>💻 モード切替: {scanMode === 'jpyc' ? 'カスタムJPYC形式' : 'MetaMask標準形式(EIP-681)'}</p>
      </div>
    </div>
  );
}
