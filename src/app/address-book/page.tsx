'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AddressBook } from '../../components/AddressBook';
import { HamburgerMenu } from '../../components/HamburgerMenu';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddressBookPage() {
  const { isConnected, address } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HamburgerMenu />
              <Link
                href="/"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="ホームに戻る"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 text-center flex-1">
              アドレス帳
            </h1>
            <div className="w-20"></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            よく送金する相手先のウォレットアドレスを登録・管理
          </p>
        </header>

        {/* ウォレット接続状態 */}
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          {!isConnected ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                アドレス帳を使用するには、ウォレットを接続してください
              </p>
              <ConnectButton />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-800">接続済み</div>
                  <div className="text-xs text-gray-600 font-mono truncate">
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <ConnectButton />
              </div>
            </div>
          )}
        </div>

        {/* アドレス帳 */}
        {isConnected && address && (
          <>
            <AddressBook />

            {/* 使い方ガイド */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📖 アドレス帳の使い方
              </h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-semibold mb-1">アドレスを登録</div>
                    <p className="text-gray-600">
                      「追加」ボタンから、よく送金する相手の名前とウォレットアドレスを登録します。
                      店舗名や友人の名前など、分かりやすい名前を付けましょう。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-semibold mb-1">手動送金で選択</div>
                    <p className="text-gray-600">
                      ホーム画面の「手動送金」で「アドレス帳」ボタンをクリックすると、
                      登録済みのアドレスから選択できます。アドレスを入力する手間が省けます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-semibold mb-1">編集・削除</div>
                    <p className="text-gray-600">
                      登録したアドレスは、編集ボタン（鉛筆アイコン）で修正、
                      削除ボタン（ゴミ箱アイコン）で削除できます。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>💡 ヒント:</strong> アドレス帳のデータは、お客様のブラウザにローカル保存されます。
                  ブラウザのデータを削除すると、登録したアドレスも削除されますのでご注意ください。
                </p>
              </div>
            </div>
          </>
        )}

        {/* ナビゲーション */}
        {isConnected && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              🔗 関連ページ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="text-2xl">🏠</div>
                <div>
                  <div className="font-medium text-gray-800">ホーム</div>
                  <div className="text-xs text-gray-500">QRスキャン・手動送金</div>
                </div>
              </Link>

              <Link
                href="/sbt-gallery"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div className="text-2xl">🎫</div>
                <div>
                  <div className="font-medium text-gray-800">SBTコレクション</div>
                  <div className="text-xs text-gray-500">取得したSBTを表示</div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
