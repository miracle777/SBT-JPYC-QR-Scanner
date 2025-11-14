/**
 * ネットワーク検証と警告コンポーネント
 */

'use client';

import React from 'react';
import { PaymentQRData, NetworkValidationResult } from '@/src/types';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { getNetworkDisplayName, getNetworkColor } from '@/src/utils/network';

interface NetworkValidationProps {
  validation: NetworkValidationResult;
  qrData: PaymentQRData;
  onSwitchNetwork?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function NetworkValidation({
  validation,
  qrData,
  onSwitchNetwork,
  onConfirm,
  onCancel,
}: NetworkValidationProps) {
  if (validation.isValid) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-green-800">ネットワーク確認済み</h4>
            <p className="text-sm text-green-700 mt-1">{validation.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900">⚠️ ネットワークが一致しません</h4>
          <p className="text-sm text-amber-800 mt-1">{validation.message}</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded mb-4 space-y-3">
        <div>
          <p className="text-xs text-gray-600 font-semibold mb-1">現在のネットワーク</p>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: getNetworkColor(validation.currentNetwork) }}
            ></span>
            <span className="font-semibold text-sm">
              {getNetworkDisplayName(validation.currentNetwork)}
            </span>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-gray-400 mx-auto" />

        <div>
          <p className="text-xs text-gray-600 font-semibold mb-1">必要なネットワーク</p>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: getNetworkColor(validation.requiredNetwork) }}
            ></span>
            <span className="font-semibold text-sm">
              {getNetworkDisplayName(validation.requiredNetwork)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>対応方法:</strong>
          <br />
          1. MetaMask でウォレットのネットワークを{' '}
          <strong>{getNetworkDisplayName(validation.requiredNetwork)}</strong> に切り替えてください。
          <br />
          2. または、以下のボタンで自動切り替えを試みます。
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
        >
          キャンセル
        </button>

        {validation.action === 'switch-network' && onSwitchNetwork && (
          <button
            onClick={onSwitchNetwork}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            ネットワークを切り替え
          </button>
        )}

        {validation.action === 'confirm' && onConfirm && (
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
          >
            このまま続行
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-700">
        <strong>QRコード情報:</strong>
        <div className="mt-1 space-y-1 font-mono">
          <div>タイプ: {qrData.type}</div>
          <div>受取人: {qrData.address.substring(0, 10)}...</div>
          {qrData.amount && <div>金額: {qrData.amount}</div>}
          {qrData.network && <div>ネットワーク: {qrData.network}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * ネットワーク警告バナー（簡易版）
 */
interface NetworkWarningBannerProps {
  validation: NetworkValidationResult;
  compact?: boolean;
}

export function NetworkWarningBanner({
  validation,
  compact = false,
}: NetworkWarningBannerProps) {
  if (validation.isValid) return null;

  if (compact) {
    return (
      <div className="p-2 bg-amber-50 border-l-4 border-amber-400 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-amber-800 font-semibold">{validation.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 font-semibold">{validation.message}</p>
      </div>
    </div>
  );
}
