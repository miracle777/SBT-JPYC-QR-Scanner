'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: string;
}

const faqData: FAQItem[] = [
  // アプリ概要
  {
    id: 'app-overview',
    question: 'このアプリは何ができますか？',
    answer: (
      <div className="space-y-3">
        <p>SBT masaru21 QR Scannerは、JPYC決済とSBT（ソウルバウンドトークン）コレクション機能を備えたデモアプリです。</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-blue-800 mb-2">主な機能：</h4>
          <ul className="text-sm text-blue-700 space-y-1 ml-4">
            <li>• QRコードスキャンによるJPYC決済</li>
            <li>• SBT（ソウルバウンドトークン）コレクション表示</li>
            <li>• 6つのブロックチェーンネットワーク対応</li>
            <li>• 決済履歴管理（ローカル保存）</li>
            <li>• PWA対応（アプリ化可能）</li>
          </ul>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">
            <strong>⚠️ 重要:</strong> このアプリは<strong>テスト・デモ用</strong>です。実際の商用利用は想定していません。
          </p>
        </div>
      </div>
    ),
    category: 'アプリ概要',
  },
  
  // ウォレット接続
  {
    id: 'wallet-support',
    question: '対応しているウォレットは何ですか？',
    answer: (
      <div className="space-y-4">
        <p>以下のウォレットに対応しています：</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-700 mb-2 flex items-center">
              🦊 MetaMask
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PC・スマートフォン両対応</li>
              <li>• ブラウザ拡張機能版</li>
              <li>• モバイルアプリ版</li>
              <li>• <strong>推奨ウォレット</strong></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
              🛡️ Trust Wallet
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• スマートフォン専用</li>
              <li>• WalletConnect対応</li>
              <li>• カスタムトークン追加必要</li>
              <li>• 安定した接続</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
              ⚡ HashPort Wallet
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• スマートフォン専用</li>
              <li>• URL接続方式推奨</li>
              <li>• WalletConnect対応</li>
              <li>• Hedera/Ethereum対応</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-700 mb-2 flex items-center">
              💼 Coinbase Wallet
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• スマートフォン専用</li>
              <li>• WalletConnect対応</li>
              <li>• 新規対応</li>
              <li>• 安定性良好</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    category: 'ウォレット接続',
  },
  
  {
    id: 'hashport-connection',
    question: 'HashPort Walletの接続方法を教えてください',
    answer: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
            🎯 URL接続方法（推奨）
          </h4>
          <div className="space-y-3 text-sm">
            <p className="text-purple-700 font-medium">この方法が最も確実に接続できます：</p>
            <ol className="text-gray-600 space-y-2 ml-4 list-decimal">
              <li><a href="https://www.hashport.network/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">HashPort Wallet</a>をダウンロード</li>
              <li>ウォレットを作成またはインポート</li>
              <li>HashPort Walletアプリの<strong>ブラウザ機能</strong>またはURL入力欄を使用</li>
              <li>現在表示中のこのアプリのURLをコピーして入力</li>
              <li>アプリ内ブラウザでサイトが開きます</li>
              <li>「ウォレット接続」ボタンをタップ</li>
              <li>HashPortアプリで接続を承認</li>
            </ol>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            🔗 WalletConnect接続方法
          </h4>
          <ol className="text-sm text-gray-600 space-y-2 ml-4 list-decimal">
            <li>このアプリの「ウォレット接続」ボタンをタップします</li>
            <li>MetaMaskなどのアプリを選ぶ画面で、<strong>WalletConnect</strong>のアイコンをタップします</li>
            <li>そのあとHashPort Walletを検索して、アイコンを見つけます</li>
            <li>アイコンをタップして、表示される画面の<strong>リンクボタン</strong>を探します</li>
            <li>リンクボタンをクリックして、<strong>表示される接続用の情報をコピー</strong>します</li>
            <li>HashPort Walletでカメラスキャン画面を開き、<strong>URL入力欄に先ほどコピーした情報を貼り付け</strong>ます</li>
            <li>接続が完了します</li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h5 className="font-semibold text-yellow-800 mb-2">トラブルシューティング：</h5>
          <ul className="text-sm text-yellow-700 space-y-1 ml-4">
            <li>• アプリが開くが接続できない → 承認ボタンが表示されるまで待機し、「Accept」をタップ</li>
            <li>• 接続が途中で切れる → アプリのバックグラウンド実行を許可し、省電力モードを無効化</li>
          </ul>
        </div>
      </div>
    ),
    category: 'ウォレット接続',
  },
  
  {
    id: 'wallet-connection-issues',
    question: 'ウォレット接続できません',
    answer: (
      <div className="space-y-4">
        <p>ウォレット接続でお困りの場合、以下を順番に確認してください：</p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-3">基本的な確認事項：</h4>
          <ul className="text-sm text-gray-600 space-y-2 ml-4">
            <li>• ウォレットアプリが最新版になっているか</li>
            <li>• ブラウザの拡張機能が有効になっているか（MetaMask）</li>
            <li>• ページを再読み込みしてから再試行</li>
            <li>• 他のウォレット拡張機能と競合していないか確認</li>
            <li>• ネットワーク接続が安定しているか</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3">Trust Wallet特有の問題：</h4>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-blue-700 mb-2">「接続中」のまま進まない場合</h5>
              <p className="text-sm text-gray-600 mb-2">
                接続は完了していますが、UI表示に問題があります。
              </p>
              <div className="bg-green-100 p-2 rounded">
                <p className="text-sm text-green-700">
                  <strong>解決方法:</strong> ページを再読み込み（F5）してください。ウォレットアドレスが正常に表示されます。
                </p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h5 className="font-medium text-blue-700 mb-2">「アカウントが無い」エラー</h5>
              <p className="text-sm text-gray-600 mb-2">
                Trust WalletにJPYCトークンのコントラクトアドレスを追加してください：
              </p>
              <div className="bg-gray-100 p-2 rounded text-xs font-mono space-y-1">
                <div>Polygon: 0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c</div>
                <div>Sepolia: 0xd3eF95d29A198868241FE374A999fc25F6152253</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    category: 'ウォレット接続',
  },
  
  // ネットワーク・決済
  {
    id: 'supported-networks',
    question: 'どのネットワークが使えますか？',
    answer: (
      <div className="space-y-4">
        <p>以下の6つのネットワークに対応しています：</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-700 mb-3">Ethereum系</h4>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">Ethereum Mainnet</div>
                <div className="text-xs text-gray-500">ChainID: 1</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">Sepolia Testnet（推奨）</div>
                <div className="text-xs text-gray-500">ChainID: 11155111</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-3">Polygon系</h4>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">Polygon Mainnet</div>
                <div className="text-xs text-gray-500">ChainID: 137</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">Polygon Amoy Testnet</div>
                <div className="text-xs text-gray-500">ChainID: 80002</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:col-span-2">
            <h4 className="font-semibold text-red-700 mb-3">Avalanche系</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">Avalanche C-Chain</div>
                <div className="text-xs text-gray-500">ChainID: 43114</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">Avalanche Fuji Testnet</div>
                <div className="text-xs text-gray-500">ChainID: 43113</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">推奨ネットワーク（テスト用）：</h4>
          <ul className="text-sm text-green-700 space-y-1 ml-4">
            <li>• <strong>Sepolia Testnet</strong> - 最も安定、Faucet利用可能</li>
            <li>• <strong>Polygon Amoy</strong> - 高速、低コスト</li>
          </ul>
        </div>
      </div>
    ),
    category: 'ネットワーク・決済',
  },
  
  {
    id: 'jpyc-not-showing',
    question: 'JPYCが表示されません',
    answer: (
      <div className="space-y-4">
        <p>JPYCが表示されない場合、以下を確認してください：</p>
        
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">1. ネットワーク接続の確認</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• 正しいネットワークに接続されているか</li>
              <li>• ウォレットのネットワーク表示と一致しているか</li>
              <li>• 手動でネットワーク切り替えを試す</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">2. トークン設定の確認</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• ウォレットにJPYCトークンが追加されているか</li>
              <li>• 正しいコントラクトアドレスが設定されているか</li>
              <li>• トークンの小数点設定が正しいか（18桁）</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-3">3. テストネットの場合</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Faucetからテスト用JPYCを取得済みか</li>
              <li>• 正しいテストネット用アドレスを使用しているか</li>
              <li>• テストネット用の残高があるか確認</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">それでも解決しない場合：</h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• ページを再読み込み（F5）</li>
            <li>• ウォレットを一度切断して再接続</li>
            <li>• ブラウザキャッシュをクリア</li>
            <li>• 数分待ってから再確認</li>
          </ul>
        </div>
      </div>
    ),
    category: 'ネットワーク・決済',
  },
  
  {
    id: 'test-jpyc-faucet',
    question: 'テストJPYCはどこで入手できますか？',
    answer: (
      <div className="space-y-4">
        <p>各テストネットで以下のコントラクトからテスト用JPYCを取得できます：</p>
        
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Ethereum Sepolia Testnet</h4>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-sm text-blue-700">公式SepoliaテストJPYC</div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                  0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-sm text-green-700">Faucet用JPYC</div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                  0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-3">Polygon Amoy Testnet</h4>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-sm text-purple-700">公式AmoyテストJPYC</div>
              <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-3">Avalanche Fuji Testnet</h4>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-sm text-red-700">カスタムJPYC (Fuji専用)</div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                  0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-sm text-green-700">公式FujiテストJPYC</div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                  0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 ヒント：</h4>
          <ul className="text-sm text-yellow-700 space-y-1 ml-4">
            <li>• Sepoliaテストネットが最も安定しています</li>
            <li>• 各ネットワークのFaucetサイトでETH（ガス代用）も取得してください</li>
            <li>• コントラクトアドレスはウォレットに手動で追加する必要があります</li>
          </ul>
        </div>
      </div>
    ),
    category: 'ネットワーク・決済',
  },
  
  // SBT関連
  {
    id: 'what-is-sbt',
    question: 'SBTとは何ですか？',
    answer: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-3">SBT（ソウルバウンドトークン）とは</h4>
          <p className="text-gray-700 leading-relaxed mb-3">
            SBTは<strong>譲渡不可能なデジタル証明書</strong>です。
            通常のNFTとは異なり、取得したウォレットに永続的に結び付いており、売買や譲渡ができません。
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
              ✅ SBTの特徴
            </h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5">•</span>
                <div>
                  <strong>譲渡不可能</strong><br />
                  売買や譲渡ができないため、本人の実績として確実に証明
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5">•</span>
                <div>
                  <strong>永続保存</strong><br />
                  ブロックチェーン上に永続的に記録される
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5">•</span>
                <div>
                  <strong>透明性</strong><br />
                  取得日時や条件を公開的に検証可能
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
              🎯 使用例
            </h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-0.5">•</span>
                <div>
                  <strong>店舗常連証明</strong><br />
                  特定の店舗での決済回数証明
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-0.5">•</span>
                <div>
                  <strong>イベント参加証明</strong><br />
                  参加したイベントの記録
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-0.5">•</span>
                <div>
                  <strong>スキル証明</strong><br />
                  取得した資格や技能の証明
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
    category: 'SBT',
  },
  
  {
    id: 'sbt-not-showing',
    question: 'SBTが表示されません',
    answer: (
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-3">このアプリでSBTを表示するには</h4>
          <p className="text-sm text-orange-700 mb-2">
            このアプリは<strong>SBT表示専用</strong>です。SBTの発行は別の「SBT-JPYC-Pay」アプリで行われます。
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">確認事項：</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• 対応店舗での決済を行ったか</li>
              <li>• 必要な訪問回数に達しているか</li>
              <li>• 正しいネットワーク（Sepolia、Amoy等）に接続しているか</li>
              <li>• SBTコレクションページから確認</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">対応店舗・SBT発行元：</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• <strong>SBT JPYC Pay Demo Store</strong> - デモ・実験店舗</li>
              <li>• <strong>Cafe JPYC</strong> - JPYCカフェ</li>
              <li>• <strong>Tech Store JPYC</strong> - エレクトロニクス専門店</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">技術詳細：</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>コントラクト</strong>: 0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4</div>
              <div><strong>対応ネットワーク</strong>: Sepolia テストネット・Polygon Amoy</div>
              <div><strong>標準</strong>: ERC-721準拠（譲渡不可能）</div>
            </div>
          </div>
        </div>
      </div>
    ),
    category: 'SBT',
  },
  
  // QRコード
  {
    id: 'qr-scan-issues',
    question: 'QRコードがスキャンできません',
    answer: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-3">基本的な確認事項：</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• カメラの使用許可が有効になっているか</li>
              <li>• HTTPS接続されているか（スマートフォンの場合）</li>
              <li>• QRコードがはっきりと映っているか</li>
              <li>• 照明が十分で反射していないか</li>
              <li>• カメラが正常に動作しているか</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">スマートフォンの場合：</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• ブラウザでカメラ許可を有効にしたか</li>
              <li>• PWAアプリの場合、カメラアクセス許可を確認</li>
              <li>• 画面を縦向きで使用しているか</li>
              <li>• 距離を調整してピントを合わせる</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">対応QRコードフォーマット：</h4>
            <ul className="text-sm text-gray-600 space-y-2 ml-4">
              <li>• <strong>JPYC統一形式</strong>: {"{"}"type":"JPYC_PAYMENT",...{"}"}</li>
              <li>• <strong>EIP-681形式</strong>: ethereum:0x...@chainId?value=...</li>
              <li>• <strong>独自形式</strong>: payment:address?network=...&amount=...</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 トラブルシューティング：</h4>
          <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
            <li>ページを再読み込みしてカメラを再初期化</li>
            <li>ブラウザの設定でカメラ許可を確認</li>
            <li>他のブラウザで試してみる</li>
            <li>手動送付機能を使用する</li>
          </ol>
        </div>
      </div>
    ),
    category: 'QRコード・決済',
  },
  
  {
    id: 'network-warning',
    question: 'ネットワーク警告が表示されます',
    answer: (
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-3">ネットワーク警告とは</h4>
          <p className="text-sm text-orange-700">
            QRコードに指定されたネットワークと、現在のウォレット接続先が異なっている際に表示される安全警告です。
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">推奨対応：</h4>
            <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
              <li>「ネットワーク切り替え」ボタンをクリック</li>
              <li>MetaMaskで自動切り替えを承認</li>
              <li>切り替え完了後、決済を続行</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">手動切り替えの方法：</h4>
            <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
              <li>ウォレット（MetaMask等）を開く</li>
              <li>ネットワーク選択メニューをクリック</li>
              <li>QRコードで指定されたネットワークを選択</li>
              <li>アプリに戻って決済を続行</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-3">注意事項：</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• 異なるネットワークでの決済は失敗する可能性があります</li>
              <li>• ガス代は接続中のネットワークの通貨で支払われます</li>
              <li>• 正しいネットワークでの決済を強く推奨します</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    category: 'QRコード・決済',
  },
  
  // PWA・技術
  {
    id: 'pwa-install',
    question: 'PWA（アプリ化）できますか？',
    answer: (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-3">✅ PWA対応について</h4>
          <p className="text-sm text-green-700 mb-2">
            はい、このアプリはPWA（Progressive Web App）に対応しており、スマートフォンのホーム画面に追加してネイティブアプリのように使用できます。
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">📱 iPhone/iPad (Safari):</h4>
            <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
              <li>Safariでアプリを開く</li>
              <li>画面下部の共有ボタン（□↑）をタップ</li>
              <li>「ホーム画面に追加」をタップ</li>
              <li>アプリ名を確認して「追加」をタップ</li>
            </ol>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-3">📱 Android (Chrome):</h4>
            <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
              <li>Chromeでアプリを開く</li>
              <li>右上のメニュー（⋮）をタップ</li>
              <li>「アプリをインストール」または「ホーム画面に追加」をタップ</li>
              <li>「インストール」をタップ</li>
            </ol>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-3">⚠️ ウォレット接続の注意:</h4>
          <p className="text-sm text-yellow-700">
            ウェブブラウザでウォレットを接続した後、PWA（ホーム画面に追加したアプリ）を起動すると、<strong>新規扱い</strong>になりウォレットを再接続する必要があります。
          </p>
          <div className="bg-white p-2 rounded border mt-2 text-xs text-gray-600">
            <strong>理由:</strong> PWAとウェブブラウザは異なるセッション環境のため、保存されたウォレット接続情報が共有されません。
          </div>
        </div>
      </div>
    ),
    category: 'PWA・技術',
  },
  
  {
    id: 'data-storage',
    question: 'データは保存されますか？',
    answer: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3">💾 データ保存について</h4>
          <p className="text-sm text-blue-700 mb-2">
            決済履歴や設定は<strong>ブラウザ内にローカル保存</strong>されます。
            サーバーには一切送信されず、プライバシーが保護されています。
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-800 mb-3">✅ 保存されるデータ</h5>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• 決済履歴（日時、金額、相手アドレス）</li>
              <li>• ウォレット接続設定</li>
              <li>• アプリ設定（表示設定等）</li>
              <li>• 位置情報（決済時のみ、オプション）</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-semibold text-red-800 mb-3">🚫 保存されないデータ</h5>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• ウォレットの秘密鍵</li>
              <li>• パスワード・認証情報</li>
              <li>• 個人識別情報</li>
              <li>• サーバーへの送信データ</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-3">🗑️ データ削除について</h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• ブラウザのデータを削除すると履歴も削除されます</li>
            <li>• 異なるブラウザ間でデータは共有されません</li>
            <li>• PWAとウェブブラウザでデータは別々に保存されます</li>
          </ul>
        </div>
      </div>
    ),
    category: 'PWA・技術',
  },
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全て');

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQ = selectedCategory === '全て' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              ❓ FAQ・よくある質問
            </h1>
          </div>
          <p className="text-gray-600">
            SBT masaru21 QR Scannerの使い方やトラブル解決方法をまとめています
          </p>
        </header>

        {/* カテゴリーフィルター */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">カテゴリー</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('全て')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === '全て'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全て
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ一覧 */}
        <div className="space-y-4">
          {filteredFAQ.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{item.question}</h3>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {openItems.includes(item.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {openItems.includes(item.id) && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="pt-4 text-gray-700">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* フッター */}
        <footer className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📞 さらにサポートが必要ですか？
            </h3>
            <div className="space-y-3">
              <a
                href="https://x.com/masaru21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter) でお問い合わせ
              </a>
              <div className="text-sm text-gray-500">
                @masaru21 までお気軽にメッセージください
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}