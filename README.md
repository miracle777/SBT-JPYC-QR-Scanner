# SBT-JPYC-QR-Scanner

🎖️ SBT表示とネットワーク検証機能を備えた JPYC 決済スキャナーアプリケーション

## 🌐 動作確認

**ライブデモ**: <https://jpyc-pay.app/>

実際にアプリを体験することができます。ウォレットを接続してSBT表示や決済機能をお試しください。

**ソースコード**: <https://github.com/miracle777/SBT-JPYC-QR-Scanner>

## 📜 コントラクトアドレス一覧

### 🎖️ SBT (Soulbound Token) コントラクト

#### Polygon Mainnet ✨ (推奨)
- **SBTコントラクト**: `0x26C55F745c5BF80475C2D024F9F07ce56E308039`
- **チェーンID**: 137
- **デプロイヤー**: `0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd`
- **ブロックエクスプローラ**: [Polygonscan](https://polygonscan.com/address/0x26C55F745c5BF80475C2D024F9F07ce56E308039)

#### Ethereum Sepolia Testnet
- **SBTコントラクト**: `0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4`
- **チェーンID**: 11155111
- **ブロックエクスプローラ**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x96FFdC8495742e1F0b0819dc1cB4548Bf3AD23A4)

#### Polygon Amoy Testnet
- **SBTコントラクト**: `0x6b39d1F8a9799aB3E1Ea047052e831186106DD8E`
- **チェーンID**: 80002
- **ブロックエクスプローラ**: [Polygon Amoy Explorer](https://amoy.polygonscan.com/address/0x6b39d1F8a9799aB3E1Ea047052e831186106DD8E)

### 💴 JPYC (JPY Coin) コントラクト

#### Ethereum Mainnet
- **JPYCコントラクト**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **チェーンID**: 1
- **ブロックエクスプローラ**: [Etherscan](https://etherscan.io/address/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29)

#### Polygon Mainnet
- **JPYCコントラクト**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **チェーンID**: 137
- **ブロックエクスプローラ**: [Polygonscan](https://polygonscan.com/address/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29)

#### Avalanche C-Chain
- **JPYCコントラクト**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **チェーンID**: 43114
- **ブロックエクスプローラ**: [Snowtrace](https://snowtrace.io/address/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29)

#### Ethereum Sepolia Testnet (テスト用)

- **公式SepoliaJPYC**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **JPYC公式Faucet**: `0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB` (JPYC公式のFaucetでもらえるトークン)
- **コミュニティJPYC**: `0xd3eF95d29A198868241FE374A999fc25F6152253` (コミュニティ提供)
- **チェーンID**: 11155111 (0xaa36a7)
- **ブロックエクスプローラ**: [Sepolia Etherscan](https://sepolia.etherscan.io/)

> **重要**: 公式テストJPYCの配布が無いため、以下の3種類のJPYCトークンが存在します：
> 1. **公式SepoliaJPYC** - 正規の公式アドレス（配布は限定的）
> 2. **JPYC公式Faucet** - JPYC公式が提供するFaucetトークン 
> 3. **コミュニティJPYC** - コミュニティによる提供トークン

#### Polygon Amoy Testnet (テスト用)

- **公式AmoyテストJPYC**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **tJPYC（デバッグ用）**: `0xcD54D62DF66f54AB3788CA17aD90d402eCD8D34a` ※未配布
- **チェーンID**: 80002 (0x13882)
- **ブロックエクスプローラ**: [Polygon Amoy Explorer](https://amoy.polygonscan.com/)

> **重要**: デバッグ用tJPYCは開発者専用で配布されていません。公式のFaucetで正式なJPYCテストトークンが配布されるまでは、各自でトークンのデプロイが必要かもしれません。

#### Avalanche Fuji Testnet (テスト用)

- **公式FujiテストJPYC**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **デバッグ用tJPYC (Fuji専用)**: `0xeAB2AF47cbc02CDD73d106CA15884cAB541F5345` ※未配布
- **チェーンID**: 43113 (0xa869)
- **ブロックエクスプローラ**: [Snowtrace Testnet](https://testnet.snowtrace.io/)

> **重要**: デバッグ用tJPYCは開発者専用で配布されていません。公式のFaucetで正式なJPYCテストトークンが配布されるまでは、各自でトークンのデプロイが必要かもしれません。

> ⚠️ **重要**: Sepolia と Polygon Amoy はテストネット用のコントラクトです。本番環境では Polygon Mainnet をご利用ください。

## ⚠️ JPYCの偽物トークンにご注意ください

**必ず公式のJPYCコントラクトアドレスを確認してください:**

### 🔒 公式JPYCコントラクトアドレス（全ネットワーク共通）
- **正規アドレス**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **対応ネットワーク**: 
  - Ethereum Mainnet (ChainID: 1 / 0x1)
  - Polygon Mainnet (ChainID: 137 / 0x89) 
  - Avalanche C-Chain (ChainID: 43114 / 0xa86a)
- **テストネットワーク**:
  - Ethereum Sepolia (ChainID: 11155111 / 0xaa36a7)
  - Polygon Amoy (ChainID: 80002 / 0x13882)
  - Avalanche Fuji (ChainID: 43113 / 0xa869)

> ⚠️ **注意**: 上記以外のコントラクトアドレスは**偽物の可能性があります**。必ず[JPYC公式FAQ](https://faq.jpyc.co.jp/s/article/fake-jpyc-warning)で最新の正規アドレスを確認してください。

### 🛡️ 偽物トークンの見分け方
- ✅ **正規**: コントラクトアドレスが`0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- ❌ **偽物**: 上記以外のアドレス、または類似した名前のトークン
- 📍 **確認方法**: [JPYC公式サイト](https://jpyc.co.jp/)または[公式FAQ](https://faq.jpyc.co.jp/s/ex)で最新情報を確認

### 📋 このアプリで使用している情報
- **SBTコントラクト**: 独自にデプロイしたSoulbound Token（あなたのデプロイ）
- **JPYCコントラクト**: JPYC公式の正規コントラクトアドレスのみ使用

> ⚠️ **注意**: Sepolia と Polygon Amoy はテストネット用のコントラクトです。本番環境では Polygon Mainnet をご利用ください。

## ✨ プロジェクト概要

このプロジェクトは、`jpyc-payment-scanner` を拡張して、以下の機能を追加します：

### 🎯 主要な新機能

#### 1. **SBT (Soulbound Token) の表示と管理**
- ✅ ウォレットに接続されたSBTの一覧表示
- ✅ SBT（バッジ）のランク表示（Bronze/Silver/Gold/Platinum）
- ✅ SBT発行者情報の表示
- ✅ ネットワークごとのSBT分類

#### 2. **決済ネットワーク情報のQRコード埋め込み**
- ✅ QRコード内にネットワーク情報を含める
- ✅ マルチネットワーク対応（本番 + テストネット）
  - Ethereum / Sepolia
  - **Polygon Mainnet / Amoy Testnet**（新）
  - **Avalanche C-Chain / Fuji Testnet**（新）
- ✅ QRコードフォーマット拡張:
  - `payment:address?network=sepolia&amount=100`

#### 3. **ネットワーク間違い防止UI**
- ✅ QRスキャン時にネットワーク自動検証
- ✅ ネットワーク不一致時の詳細な警告表示
- ✅ ワンクリックでのネットワーク自動切り替え
- ✅ 明確な色分け表示（Ethereum=Purple、Sepolia=Orange など）

## 🏗 プロジェクト構造

```
src/
├── app/                    # Next.js アプリケーション
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ
│   ├── providers.tsx      # RainbowKit設定
│   └── globals.css        # グローバルスタイル
├── components/            # React コンポーネント
│   ├── SBTDisplay.tsx     # SBT表示コンポーネント
│   ├── NetworkValidation.tsx # ネットワーク検証UI
│   ├── QRScanner.tsx      # QRスキャナー
│   └── PaymentConfirm.tsx # 決済確認画面
├── types/                 # TypeScript型定義
│   └── index.ts          # SBT, Network, Payment型
├── utils/                 # ユーティリティ関数
│   ├── network.ts        # ネットワーク検証・QRパース
│   ├── sbt.ts            # SBT取得・ランク管理
│   └── payment.ts        # 決済ロジック
└── public/                # 静的ファイル
    └── manifest.json     # PWA設定
```

## 🛠 技術スタック

### フロントエンド
- **Next.js 16** - React フレームワーク
- **TypeScript 5.0** - 型安全性
- **Tailwind CSS 3.0** - ユーティリティCSS
- **Framer Motion** - アニメーション

### Web3 / ブロックチェーン
- **RainbowKit 2.2** - ウォレット接続UI
- **wagmi 2.0** - React向けEthereumライブラリ
- **viem 2.0** - 軽量なEthereumクライアント

### 機能ライブラリ
- **qr-scanner 1.4** - QRコード読み込み
- **qrcode.react 1.0** - QRコード生成
- **lucide-react** - アイコン
- **next-pwa 5.6** - PWA機能

## 📋 実装詳細

### ネットワーク設定

```typescript
// src/utils/network.ts で定義
SUPPORTED_NETWORKS: {
  ethereum: { chainId: 1, ... },
  sepolia: { chainId: 11155111, ... },
  polygon: { chainId: 137, ... },
  avalanche: { chainId: 43114, ... },
  'avalanche-fuji': { chainId: 43113, ... }
}
```

### SBT データ構造

```typescript
interface SBT {
  id: string;
  name: string;
  symbol: string;
  address: `0x${string}`;
  issuer: string;
  description: string;
  network: NetworkType;
  chainId: number;
  rank?: 'bronze' | 'silver' | 'gold' | 'platinum';
  imageUrl?: string;
  metadata?: Record<string, any>;
}
```

### QRコードフォーマット

#### 基本的な支払い

```text
payment:0x1234...?network=ethereum&amount=100&memo=テスト
```

### ネットワーク検証フロー

```
QRコードスキャン
    ↓
QRデータ抽出 → ネットワーク情報取得
    ↓
現在のウォレットネットワークと比較
    ↓
┌─ ネットワークが一致 → 決済画面へ
│
└─ ネットワークが異なる → 警告表示
        ↓
     自動切り替え / キャンセル
```

## 🚀 セットアップ

### 1. プロジェクトのクローン

```bash
git clone https://github.com/miracle777/SBT-JPYC-QR-Scanner.git
cd SBT-JPYC-QR-Scanner
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` に以下を設定：

```env
# WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Google Analytics Measurement ID (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ネットワーク設定
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia
# 利用可能な値: ethereum | sepolia | polygon | polygon-amoy | avalanche | avalanche-fuji

# JPYC コントラクトアドレス
NEXT_PUBLIC_JPYC_CONTRACT_SEPOLIA=0xd3eF95d29A198868241FE374A999fc25F6152253  # 必須
NEXT_PUBLIC_JPYC_CONTRACT_POLYGON=0x...  # オプション(Polygon Mainnet)
NEXT_PUBLIC_JPYC_CONTRACT_AVALANCHE=0x...  # オプション(Avalanche C-Chain)

# アプリ設定
NEXT_PUBLIC_APP_NAME=SBT-JPYC-QR-Scanner
```

#### WalletConnect Project IDの取得とドメイン登録

1. **WalletConnect Cloud** にアクセス: [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. **新規プロジェクトを作成**してProject IDを取得
3. **重要**: Project IDを取得した後、必ず**ドメイン登録**を行ってください
   - プロジェクト設定画面で「Allowed Domains」を設定
   - 例: `jpyc-pay.app`, `localhost:3000`
   - ドメイン登録を行わないと、本番環境でWalletConnect接続エラーが発生します

> ⚠️ **よくあるエラー**: ドメイン未登録の場合、`Invalid Project ID`や接続失敗のエラーが発生します。必ずドメイン登録を完了させてください。

### 4. 開発サーバー起動

```bash
# HTTPS対応版（スマートフォンのカメラアクセス対応）
npm run dev

# HTTP版（PC開発用）
npm run dev-http

# 本番ビルド
npm run build && npm run start
```

## 🔗 ウォレット接続ガイド

このアプリは複数のウォレットに対応しており、それぞれ異なる接続方法があります。

### 対応ウォレット一覧

| ウォレット | 接続方法 | プラットフォーム | 推奨度 |
|-----------|---------|----------------|-------|
| **MetaMask** | ブラウザ拡張 / モバイルアプリ | PC / スマートフォン | ⭐⭐⭐ |
| **Trust Wallet** | WalletConnect | スマートフォン | ⭐⭐⭐ |
| **HashPort Wallet** | URL接続 / WalletConnect | スマートフォン | ⭐⭐ |
| **Coinbase Wallet** | WalletConnect | スマートフォン | ⭐⭐ |

### 🦊 MetaMask

**推奨環境**: PC（ブラウザ拡張）、スマートフォン（MetaMaskアプリ）

#### PC での接続

1. [MetaMask拡張機能](https://metamask.io/download/)をインストール
2. ウォレットを作成またはインポート
3. アプリで「ウォレット接続」→「MetaMask」を選択
4. MetaMask拡張機能で「接続」を承認

#### スマートフォンでの接続

1. MetaMaskアプリをダウンロード
2. ウォレットを作成またはインポート
3. アプリで「ウォレット接続」を選択
4. MetaMaskアプリが自動で開き、接続を承認

### 🛡️ Trust Wallet

**推奨環境**: スマートフォン（Trust Walletアプリ）

#### 接続手順

1. [Trust Wallet](https://trustwallet.com/)をダウンロード
2. **重要**: ウォレット（アカウント）を必ず作成
   - シードフレーズを安全に保存
   - アカウント作成を完了させる
3. **必須**: JPYCトークンをTrust Walletに追加
   - 設定 → 「トークンを管理」
   - 「カスタムトークンを追加」を選択
   - Polygonネットワーク: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
   - Sepoliaテストネット（Faucet用）: `0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB`
   - Sepoliaテストネット（コミュニティ用）: `0xd3eF95d29A198868241FE374A999fc25F6152253`
4. アプリで「ウォレット接続」を選択
5. Trust Walletアプリが開くので「接続」を承認
6. **接続完了後**: ページを再読み込みして正常表示を確認

#### Trust Walletのトラブルシューティング

- **「アカウントが無い」エラー**: **重要** - Trust WalletにJPYCトークンのコントラクトアドレスを追加してください
  - Polygonネットワーク: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
  - Sepoliaテストネット: `0xd3eF95d29A198868241FE374A999fc25F6152253`
- **「接続中」のまま進まない**: 接続は完了していますが、UI表示に問題があります
  - **解決方法**: ページを再読み込み（F5）してください
  - ウォレットアドレスが正常に表示されます

### ⚡ HashPort Wallet

**推奨環境**: スマートフォン（HashPort Walletアプリ）

#### 🎯 URL接続方法（推奨）

**この方法が最も確実に接続できます:**

1. [HashPort Wallet](https://www.hashport.network/)をダウンロード
2. ウォレットを作成またはインポート
3. アプリのURL欄に以下を入力:

   ```url
   https://jpyc-pay.app
   ```

4. アプリ内ブラウザでサイトが開きます
5. 「ウォレット接続」ボタンをタップ
6. HashPortアプリで接続を承認

#### WalletConnect接続方法

1. PC/スマートフォンでアプリを開く
2. 「ウォレット接続」を選択
3. QRコードまたはディープリンクでHashPortアプリが開く
4. アプリ内で「Accept」または「承認」をタップ
5. **重要**: 承認ボタンが表示されるまで数秒待機

#### HashPortのトラブルシューティング

- **アプリが開くが接続できない**: 承認ボタンが表示されるまで待機し、「Accept」をタップ
- **接続が途中で切れる**: アプリのバックグラウンド実行を許可し、省電力モードを無効化

### 💼 Coinbase Wallet

**推奨環境**: スマートフォン（Coinbase Walletアプリ）

#### Coinbase Walletの接続手順

1. Coinbase Walletアプリをダウンロード
2. ウォレットを作成またはインポート
3. アプリで「ウォレット接続」を選択
4. Coinbase Walletアプリが開き、接続を承認

### 🚨 共通のトラブルシューティング

#### 接続に失敗する場合

1. **ウォレットアプリを最新版に更新**
2. **デバイスの再起動**
3. **ブラウザキャッシュをクリア**
4. **ネットワーク接続を確認**（WiFi ↔ モバイルデータ）
5. **時間を置いて再試行**（WalletConnectサーバーの負荷軽減）

#### 接続タイムアウトの場合

- 接続タイムアウトは60秒に設定されています
- タイムアウト後、「再試行」ボタンで再度接続を試してください
- 3回失敗した場合は、ページを更新してください

#### ネットワーク設定

接続後、以下のネットワークに対応しています：

- **Ethereum Mainnet** (ChainID: 1)
- **Sepolia Testnet** (ChainID: 11155111) - 推奨
- **Polygon Mainnet** (ChainID: 137)
- **Polygon Amoy Testnet** (ChainID: 80002)
- **Avalanche C-Chain** (ChainID: 43114)
- **Avalanche Fuji Testnet** (ChainID: 43113)

### 📱 モバイル使用時の注意点

1. **HTTPS接続**: モバイルでカメラ機能を使用するには、HTTPS接続が必要です
2. **カメラ権限**: QRスキャンにはカメラアクセス許可が必要です
3. **アプリ切り替え**: ウォレットアプリとブラウザ間の切り替えがスムーズに行えるよう、両方のアプリを最新版に保ってください

## 🔧 詳細なトラブルシューティング

アプリ内の「ウォレット接続のトラブルシューティング」ボタンから、各ウォレット固有の問題と解決策を確認できます。

## 📱 使用方法

### 1. ウォレット接続

```
1. アプリを開く
2. 「ウォレット接続」ボタンをクリック
3. MetaMask を選択
4. ネットワークを選択（推奨: Sepolia）
```

### 2. SBT の確認

```
1. 「SBT」タブを開く
2. 保有しているSBT一覧を表示
3. SBTのランク、発行者、説明を確認
4. ネットワーク別に分類表示
```

### 3. QRコードスキャン

```
1. 「スキャン」タブを選択
2. カメラ許可を付与
3. QRコードをスキャン
4. ネットワーク検証が自動実行
```

### 4. ネットワーク不一致時の対応

```
警告画面が表示 →
  ├─ [ネットワーク切り替え] → MetaMask自動切り替え
  ├─ [このまま続行] → 決済画面へ（自己責任）
  └─ [キャンセル] → スキャン画面に戻る
```

### 5. 決済実行

```
1. 金額を確認
2. 「決済実行」をクリック
3. MetaMask で署名
4. 完了画面でトランザクションを確認
```

## 🧪 テストシナリオ

### SBT 機能テスト

```typescript
// src/utils/sbt.ts で実装
1. ✅ SBT取得: fetchUserSBTs(address)
2. ✅ ネットワークフィルター: fetchSBTsByNetwork(address, network)
3. ✅ SBT保有確認: hasSBT(address, sbtId)
4. ✅ ランク取得: getUserHighestRank(address)
```

### ネットワーク検証テスト

```typescript
// src/utils/network.ts で実装
1. ✅ QRパース: parseQRCodeData(qrString)
2. ✅ ネットワーク検証: validateNetwork(chainId, network)
3. ✅ 決済ネットワーク検証: validatePaymentNetwork(chainId, qrData)
4. ✅ QRコード生成: createPaymentQRCode(...)
```

## 📊 対応ネットワーク（6チェーン - JPYC対応）

### Ethereum 系

| ネットワーク | ChainID | 環境 | RPC URL | 色コード |
|------------|---------|------|---------|---------|
| Ethereum | 1 | **本番** | `https://eth.public.rpc...` | 🟣 #627EEA |
| Sepolia | 11155111 | テスト | `https://1rpc.io/sepolia` | 🟠 #FF8C00 |

### Polygon 系

| ネットワーク | ChainID | 環境 | RPC URL | 色コード |
|------------|---------|------|---------|---------|
| Polygon Mainnet | 137 | **本番** | `https://polygon-rpc.com` | 🟣 #8247E5 |
| Amoy Testnet | 80002 | テスト | `https://rpc-amoy.polygon.technology` | 🟤 #A29EE3 |

### Avalanche 系

| ネットワーク | ChainID | 環境 | RPC URL | 色コード |
|------------|---------|------|---------|---------|
| Avalanche C-Chain | 43114 | **本番** | `https://api.avax.network/ext/bc/C/rpc` | 🔴 #E84142 |
| Avalanche Fuji Testnet | 43113 | テスト | `https://api.avax-test.network/ext/bc/C/rpc` | 🟠 #FF6B6B |

## 🎓 主要な実装ポイント

### 1. QRコード拡張フォーマット

```typescript
// payment: で始まる決済用QR
payment:0xAddress?network=sepolia&amount=100&memo=note
```

### 2. ネットワーク自動検証

```typescript
// QRスキャン時に自動実行
const validation = validatePaymentNetwork(currentChainId, qrData);
if (!validation.isValid) {
  // ネットワーク警告を表示
  // ユーザーに切り替え選択肢を提示
}
```

### 3. SBT ランク管理

```typescript
// ユーザーの最高ランクを取得
const rank = await getUserHighestRank(address);

// ランクに応じた割引を適用
const discount = RANK_INFO[rank].discount;
const discountedAmount = calculateDiscount(amount, discount);
```

## 📚 参考リポジトリ

- **jpyc-payment-scanner** - 顧客側決済スキャナー
  - QRコード読み込み実装
  - MetaMask連携パターン
  - PWA対応実装

- **SBT-JPYC-Pay** - 支払い受け取りアプリ
  - QRコード生成ロジック
  - SBT検証パターン
  - ネットワーク設定情報

## 🔗 関連リンク・リソース

### ⛽ JPYC ガス代支援サービス

ブロックチェーン決済でガス代（手数料）が不足している場合は、以下の無料ガス代支援サービスをご利用ください：

#### 🔴 Avalanche C-Chain 対応
- **JPYC Gas Faucet (Avalanche)**
- **URL**: <https://jpyc-gas.vercel.app/>
- **対応ネットワーク**: Avalanche Mainnet (C-Chain)
- **提供内容**: AVAXトークンの無料配布（ガス代用）
- **利用条件**: JPYCホルダー向け

#### 🟣 Polygon 対応
- **JPYC Volunteer Gas Support (Polygon)**
- **URL**: <https://jpyc-volunteer.vercel.app/>
- **対応ネットワーク**: Polygon Mainnet
- **提供内容**: POLトークンの無料配布（ガス代用）
- **利用条件**: JPYCホルダー向け

> 💡 **ガス代支援について**: これらのサービスは、JPYC決済を行う際に必要なガス代（ネットワーク手数料）を無料で提供してくれます。JPYCを保有していても、ガス代となるネイティブトークン（AVAX、POL等）がないと取引ができないため、このようなサービスが提供されています。

> ⚠️ **注意**: ガス代支援サービスは外部サービスです。利用前に各サイトの利用規約をご確認ください。

## 🔄 開発フロー

```
初期化 → 型定義 → ユーティリティ → コンポーネント → 統合 → テスト
```

## 📈 拡張性

### 将来の拡張予定

1. **マルチシグウォレット対応**
   - 複数署名者による承認フロー

2. **解析・統計機能**
   - 決済フロー分析
   - ネットワーク別決済統計

4. **国際化**
   - 多言語サポート
   - 地域別ネットワーク推奨設定

## 🐛 トラブルシューティング

### QRコードが読み込めない

```
1. HTTPS接続を確認（スマートフォン）
2. カメラ権限が許可されているか確認
3. QRコードが正しく生成されているか確認
```

### ネットワーク検証が失敗する

```
1. MetaMask のネットワークが正しいか確認
2. QRコードにネットワーク情報が含まれているか確認
3. ブラウザキャッシュをクリア
```

### SBT が表示されない

```
1. ウォレットアドレスが正しいか確認
2. SBTコントラクトアドレスが正しいか確認
3. ネットワークが一致しているか確認
4. 環境変数が正しく設定されているか確認
```

## 📝 ライセンス

**カスタムライセンス** - 個人利用（支払い目的含む）は無料、商用利用は許可制

### 利用許可

- ✅ **個人の支払い利用**: 無償で利用可能（お店での決済・送金など）
- ✅ **教育・研究目的**: 無償で利用可能
- ✅ **個人的学習・実験**: 無償で利用可能  
- ✅ **オープンソース貢献**: 無償で利用可能
- ⚠️ **事業化・商用利用**: 事前に著作権者の許可が必要

### 商用利用について

**個人利用は完全無料です。** 事業化や商用目的での利用をご希望の場合は、事前にご連絡ください。適切なライセンス条件をご提案いたします。

詳細は `LICENSE` ファイルをご確認ください。

## 🙏 謝辞

このプロジェクトは以下のプロジェクトと技術を参考にしています：

- **jpyc-payment-scanner** - QRスキャン実装パターン
- **RainbowKit** - ウォレット接続UI
- **wagmi** - Web3ライブラリ
- **Ethereum Foundation** - テストネット提供

## 📮 開発者連絡先

技術的な質問やライセンスに関するお問い合わせはこちら：

- **X (Twitter)**: <https://x.com/masaru21>
- **リンクイット**: <https://lit.link/itsapotamk>

---

**バージョン**: 1.1.0  
**最終更新**: 2025年11月24日
