'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { parseQRCodeData, detectQRCodeFormat, describeQRCodeFormat } from '@/utils/network';

type ScanMode = 'jpyc' | 'walletconnect' | 'auto';

interface QRScannerImprovedProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QRScannerImproved({ onScan, onError }: QRScannerImprovedProps) {
  const [scanMode, setScanMode] = useState<ScanMode>('auto');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string>('');
  const [qrFormatInfo, setQrFormatInfo] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<Array<{
    data: string;
    format: string;
    timestamp: Date;
    success: boolean;
  }>>([]);
  const scanTimeoutRef = useRef<NodeJS.Timeout>();

  const handleScan = useCallback((result: any) => {
    if (result?.text && result.text !== lastScannedData) {
      console.log('QR Code scanned:', result.text);
      
      const scannedData = result.text;
      setLastScannedData(scannedData);
      
      // QR形式を検出
      const format = detectQRCodeFormat(scannedData);
      const description = describeQRCodeFormat(scannedData);
      setQrFormatInfo(`形式: ${format} - ${description}`);
      
      // パース試行
      const parsedData = parseQRCodeData(scannedData);
      const success = parsedData !== null;
      
      // 履歴に追加
      setScanHistory(prev => [{
        data: scannedData,
        format,
        timestamp: new Date(),
        success
      }, ...prev.slice(0, 4)]); // 最新5件まで保持
      
      if (success) {
        console.log('Successfully parsed QR data:', parsedData);
        onScan(scannedData);
        setIsScanning(false);
      } else {
        console.error('Failed to parse QR data:', scannedData);
        const errorMsg = `QRコード解析に失敗しました。形式: ${format}`;
        onError?.(errorMsg);
        
        // 3秒後に再開
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
        scanTimeoutRef.current = setTimeout(() => {
          console.log('Resuming scan after parse failure...');
        }, 3000);
      }
    }
  }, [lastScannedData, onScan, onError]);

  const handleError = useCallback((error: any) => {
    console.error('QR Scanner error:', error);
    const errorMessage = `スキャンエラー: ${error?.message || '不明なエラー'}`;
    onError?.(errorMessage);
  }, [onError]);

  const generateSampleQRData = useCallback(() => {
    const samples = {
      jpyc: {
        type: 'JPYC_PAYMENT',
        to: '0x742d35Cc6634C0532925a3b8D2d9cE7d5C15C84D',
        amount: '100',
        network: 'sepolia',
        contractAddress: '0x8c9Dd1B0c6bB0Fea6C0aD0b8B2cA1B2B83C4B5B6',
        merchant: {
          id: 'shop_001',
          name: 'Demo Store JPYC',
          description: 'JPYCテスト決済',
        },
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + 3600000).toISOString(), // 1時間後
      },
      walletconnect: `ethereum:0x742d35Cc6634C0532925a3b8D2d9cE7d5C15C84D@11155111?value=100000000000000000000`,
      // スクリーンショットと同じ形式のサンプルデータ
      payment: {
        "version": "1.0",
        "type": "payment",
        "shopId": "shop-001",
        "shopName": "SBT JPYC Pay Demo Store",
        "shopWallet": "0x5888578ad9a33ce8a9fa3a0ca4081665bfad8fd",
        "amount": "1000000000000000000",
        "currency": "JPYC",
        "chainId": 137,
        "paymentId": `PAY${Date.now()}`,
        "expiresAt": Date.now() + 3600000,
        "contractAddress": "0xE7C3D8C9a439feDe00D260032D5dB0Be71C3c29",
        "description": "Payment from SBT JPYC Pay Demo Store"
      }
    };

    let sampleData: string;
    switch (scanMode) {
      case 'jpyc':
        sampleData = JSON.stringify(samples.jpyc);
        break;
      case 'walletconnect':
        sampleData = samples.walletconnect;
        break;
      default: // auto
        sampleData = JSON.stringify(samples.payment);
    }

    console.log('Generated sample data for mode', scanMode, ':', sampleData);
    onScan(sampleData);
  }, [scanMode, onScan]);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
    setLastScannedData('');
    setQrFormatInfo('');
  }, []);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* モード選択 - 常に表示 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          🔧 QRコード形式選択
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setScanMode('auto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              scanMode === 'auto'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🤖 自動判別
          </button>
          <button
            onClick={() => setScanMode('jpyc')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              scanMode === 'jpyc'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 JPYC決済
          </button>
          <button
            onClick={() => setScanMode('walletconnect')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              scanMode === 'walletconnect'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔗 WalletConnect
          </button>
        </div>
        
        {/* モードの説明 */}
        <div className="text-sm text-gray-600 mb-3">
          {scanMode === 'auto' && '🤖 すべてのQRコード形式を自動で判別・解析します'}
          {scanMode === 'jpyc' && '💰 JPYC独自形式のQRコードを優先的に解析します'}
          {scanMode === 'walletconnect' && '🔗 EIP-681形式（MetaMask等）のQRコードを解析します'}
        </div>

        <button
          onClick={generateSampleQRData}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          📝 テスト用QRデータを生成
        </button>
      </div>

      {/* QRスキャナー */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            QRコードスキャナー
          </h3>
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isScanning
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isScanning ? '⏹️ 停止' : '📷 スキャン開始'}
          </button>
        </div>

        {isScanning && (
          <div className="mb-4">
            <QrReader
              constraints={{
                facingMode: 'environment'
              }}
              onResult={handleScan}
              onError={handleError}
              className="w-full max-w-sm mx-auto"
            />
          </div>
        )}

        {/* QR形式情報表示 */}
        {qrFormatInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">検出された形式:</span><br />
              {qrFormatInfo}
            </p>
          </div>
        )}
      </div>

      {/* スキャン履歴 */}
      {scanHistory.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              スキャン履歴
            </h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              🗑️ クリア
            </button>
          </div>
          <div className="space-y-2">
            {scanHistory.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border text-sm ${
                  item.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-medium ${
                    item.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {item.success ? '✅' : '❌'} {item.format}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-xs ${
                  item.success ? 'text-green-700' : 'text-red-700'
                } truncate`}>
                  {item.data.length > 50 
                    ? `${item.data.substring(0, 50)}...`
                    : item.data
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}