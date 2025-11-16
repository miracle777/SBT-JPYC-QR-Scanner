# SBT-JPYC-QR-Scanner

🎖️ SBT表示とネットワーク検証機能を備えた JPYC 決済スキャナーアプリケーション

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
- ✅ 複数ネットワーク対応（本番 + テストネット）
  - Ethereum / Sepolia
  - **Polygon Mainnet / Mumbai Testnet**（新）
  - **Arbitrum One / Sepolia Testnet**（新）
  - Optimism Mainnet
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
  arbitrum: { chainId: 42161, ... },
  optimism: { chainId: 10, ... }
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

# ネットワーク設定
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia
# 利用可能な値: ethereum | sepolia | polygon | polygon-mumbai | arbitrum | arbitrum-sepolia | optimism

# JPYC コントラクトアドレス
NEXT_PUBLIC_JPYC_CONTRACT_SEPOLIA=0xd3eF95d29A198868241FE374A999fc25F6152253  # 必須
NEXT_PUBLIC_JPYC_CONTRACT_POLYGON=0x...  # オプション（Polygon Mainnet）
NEXT_PUBLIC_JPYC_CONTRACT_ARBITRUM=0x...  # オプション（Arbitrum One）

# アプリ設定
NEXT_PUBLIC_APP_NAME=SBT-JPYC-QR-Scanner
```

### 4. 開発サーバー起動

```bash
# HTTPS対応版（スマートフォンのカメラアクセス対応）
npm run dev

# HTTP版（PC開発用）
npm run dev-http

# 本番ビルド
npm run build && npm run start
```

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

### Arbitrum 系

| ネットワーク | ChainID | 環境 | RPC URL | 色コード |
|------------|---------|------|---------|---------|
| Arbitrum One | 42161 | **本番** | `https://arb1.arbitrum.io/rpc` | 🔵 #28A0F0 |
| Arbitrum Sepolia | 421614 | テスト | `https://sepolia-rollup.arbitrum.io/rpc` | 🟦 #12D9FF |

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

MIT License - 詳細は `LICENSE` ファイルを参照

## 🙏 謝辞

このプロジェクトは以下のプロジェクトと技術を参考にしています：

- **jpyc-payment-scanner** - QRスキャン実装パターン
- **RainbowKit** - ウォレット接続UI
- **wagmi** - Web3ライブラリ
- **Ethereum Foundation** - テストネット提供

## 📮 お仕事問い合わせ先

お仕事のご相談はこちらからお願いします：

- **X (Twitter)**: <https://x.com/masaru21>
- **リンクイット**: <https://lit.link/itsapotamk>

---

**完成予定日**: 2025年11月15日
**バージョン**: 1.0.0
