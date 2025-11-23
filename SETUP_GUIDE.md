# SBT-JPYC-QR-Scanner セットアップ手順

## 📋 前提条件

- Node.js 18.0 以上
- npm または yarn
- MetaMask ブラウザ拡張機能（開発時）
- WalletConnect Project ID（https://dashboard.reown.com で取得）

## 🚀 ステップ1: プロジェクトのセットアップ

### 1.1 依存関係のインストール

```bash
cd SBT-JPYC-QR-Scanner
npm install
```

### 1.2 環境変数の設定

```bash
# .env.example をコピーして .env.local を作成
cp .env.example .env.local
```

### 1.3 .env.local を編集

```env
# .env.local

# WalletConnect Project ID を設定
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_actual_project_id

# その他の設定はデフォルトで OK
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia
NEXT_PUBLIC_JPYC_CONTRACT_ADDRESS=0xd3eF95d29A198868241FE374A999fc25F6152253
NEXT_PUBLIC_CHAIN_ID=11155111
```

## 💻 ステップ2: 開発環境の起動

### 2.1 PC でのテスト（HTTP）

```bash
npm run dev-http
# または
npm run dev

# ブラウザで http://localhost:3000 を開く
```

### 2.2 スマートフォンでのテスト（HTTPS）

```bash
npm run dev

# 別のターミナルで PC の IP アドレスを確認
# Windows PowerShell
ipconfig | findstr "IPv4"

# 出力例:
# IPv4 アドレス . . . . . . . . . : 192.168.1.100

# スマートフォンのブラウザで以下にアクセス
# https://192.168.1.100:3000

# 警告画面で「詳細」→「安全でないサイトにアクセス」を選択
# カメラ許可を与える
```

## ⚙️ ステップ3: ウォレットのセットアップ

### 3.1 対応ウォレット

このアプリは以下のウォレットに対応しています：

| ウォレット | 接続方法 | プラットフォーム | 推奨度 |
|-----------|---------|----------------|-------|
| **MetaMask** | ブラウザ拡張 / モバイルアプリ | PC / スマートフォン | ⭐⭐⭐ |
| **Trust Wallet** | WalletConnect | スマートフォン | ⭐⭐⭐ |
| **HashPort Wallet** | URL接続 / WalletConnect | スマートフォン | ⭐⭐ |
| **Coinbase Wallet** | WalletConnect | スマートフォン | ⭐⭐ |

### 3.2 MetaMask のセットアップ（PC）

#### Sepolia テストネットの追加

1. MetaMask を開く
2. ネットワークを切り替え
3. 「ネットワークを追加」を選択
4. 以下の情報を入力：

```
ネットワーク名: Sepolia
RPC URL: https://sepolia.infura.io/v3/
チェーン ID: 11155111
通貨記号: SepoliaETH
ブロックエクスプローラーURL: https://sepolia.etherscan.io
```

#### テスト用 ETH の取得

Chainlink Faucet でテスト用 ETH を取得：
https://faucets.chain.link/sepolia

#### JPYC トークンの追加

MetaMask でトークンをインポート：

```
トークンコントラクト: 0xd3eF95d29A198868241FE374A999fc25F6152253
シンボル: JPYC
小数点: 18
```

#### テスト用 JPYC の取得

JPYC Faucet でテスト用 JPYC を取得：
https://faucet.jpyc.jp/

### 3.3 モバイルウォレットのセットアップ

#### Trust Wallet

1. [Trust Wallet](https://trustwallet.com/) をダウンロード
2. **重要**: ウォレット（アカウント）を必ず作成
   - シードフレーズを安全に保存
   - アカウント作成を完了させる
3. Sepolia ネットワークを追加（MetaMaskと同様）
4. JPYC トークンをインポート（上記のコントラクトアドレスを使用）

**接続方法**: WalletConnect経由で接続

#### HashPort Wallet

1. [HashPort Wallet](https://www.hashport.network/) をダウンロード
2. ウォレットを作成またはインポート
3. Sepolia ネットワークを追加
4. JPYC トークンをインポート

**推奨接続方法**: 
- **URL接続** - アプリのURL欄に `https://jpyc-pay.app` を入力
- **WalletConnect** - QRコード経由

#### Coinbase Wallet

1. Coinbase Walletアプリをダウンロード
2. ウォレットを作成またはインポート
3. Sepolia ネットワークを追加
4. JPYC トークンをインポート

**接続方法**: WalletConnect経由で接続

### 3.4 ウォレット接続のトラブルシューティング

#### 一般的な問題

- **接続が60秒でタイムアウトする**: 正常です。「再試行」ボタンで再接続してください
- **「アカウントが無い」エラー**: ウォレットでアカウント作成を完了させてください
- **QRコードが読み込めない**: カメラ権限とHTTPS接続を確認してください

#### Trust Wallet 固有の問題

- **「アカウントが無い」エラーの真の原因**: JPYCトークンのコントラクトアドレスが未追加
  - **必須対応**: Trust WalletにJPYCトークンを手動で追加
   - Polygonネットワーク: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
   - Sepoliaテストネット（Faucet用）: `0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB`
   - Sepoliaテストネット（コミュニティ用）: `0xd3eF95d29A198868241FE374A999fc25F6152253`
  - Sepoliaテストネット: `0xd3eF95d29A198868241FE374A999fc25F6152253`
- **UI表示の問題**: 「接続中」と表示されるが実際は接続済み
  - **解決方法**: ページを再読み込み（F5キー）
  - ウォレットアドレスが正常に表示されます
- **接続確認方法**: ブラウザの開発者ツール（F12）でコンソールを確認

#### HashPort Wallet 固有の問題

- **WalletConnectで接続できない**: URL接続方法（アプリ内ブラウザ）を試してください
- **承認ボタンが表示されない**: 数秒待機してから「Accept」ボタンをタップしてください
- **接続が途中で切れる**: アプリのバックグラウンド実行を許可し、省電力モードを無効化してください

## ⚙️ ステップ4: 機能テスト

### 4.1 ウォレット接続テスト

1. アプリを開く
2. 「ウォレット接続」ボタンをクリック
3. MetaMask で接続確認
4. アドレスと残高が表示されることを確認

### 4.2 SBT 表示テスト

1. 「SBT」タブを開く
2. 発行済み SBT 一覧が表示されることを確認
3. SBT のランク、発行者などの情報が正しく表示されることを確認

### 4.3 ネットワーク検証テスト

#### パターン A: ネットワーク一致

1. 「スキャン」タブを開く
2. 以下の QR コードをスキャン（またはサンプルを使用）：
   ```
   payment:0x1234567890123456789012345678901234567890?network=sepolia&amount=100
   ```
3. 「✅ ネットワークが正しく設定されています」と表示されることを確認

#### パターン B: ネットワーク不一致

1. MetaMask でネットワークを「Ethereum」に切り替え
2. 以下の QR コードをスキャン：
   ```
   payment:0x1234567890123456789012345678901234567890?network=sepolia&amount=100
   ```
3. 警告画面が表示されることを確認
4. 「ネットワークを切り替え」ボタンで Sepolia に自動切り替え可能なことを確認

### 4.4 SBT 割引テスト

1. サンプル SBT が読み込まれていることを確認
2. SBT のランクに応じた割引情報が表示されることを確認
3. 割引計算が正しく行われることを確認

## 📊 動作確認チェックリスト

### 基本機能

- [ ] ウォレット接続が完了する
- [ ] MetaMask からアドレスと残高が取得できる
- [ ] Sepolia ネットワークに接続できる

### SBT 機能

- [ ] SBT 一覧が表示される
- [ ] SBT のランク表示が正しい
- [ ] ネットワーク別に SBT が分類される
- [ ] SBT の詳細情報を確認できる

### ネットワーク検証

- [ ] QR コードが正しくパースされる
- [ ] ネットワーク情報が抽出される
- [ ] ネットワーク一致時は警告が表示されない
- [ ] ネットワーク不一致時は警告が表示される
- [ ] 「ネットワークを切り替え」で自動切り替えできる

### UI / UX

- [ ] すべてのボタンがクリック可能
- [ ] ローディング画面が表示される
- [ ] エラーメッセージが適切に表示される
- [ ] レスポンシブデザインが機能している（スマートフォン対応）

## 🐛 トラブルシューティング

### エラー: "モジュール 'react' が見つかりません"

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### エラー: "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set"

```bash
# .env.local にプロジェクト ID を設定
# https://dashboard.reown.com で取得
```

### QR コードが読み込めない（スマートフォン）

```
1. HTTPS 接続を確認
2. カメラ権限を許可
3. ブラウザキャッシュをクリア
4. https://IP:3000 で直接アクセス
```

### MetaMask が起動しない

```
1. MetaMask がインストールされているか確認
2. MetaMask でウォレットが作成されているか確認
3. ブラウザを再起動
```

### SBT が表示されない

```
1. ウォレットアドレスが正しいか確認
2. Sepolia ネットワークに接続しているか確認
3. ブラウザコンソールでエラーを確認
   → F12 を押して DevTools を開く
   → Console タブを確認
```

## 📱 スマートフォン開発環境のセットアップ（詳細）

### iOS（Safari）

1. **ステップ1: PC で HTTPS サーバーを起動**
   ```bash
   npm run dev
   ```

2. **ステップ2: PC の IP アドレスを確認**
   ```powershell
   ipconfig | findstr "IPv4"
   # 例: 192.168.1.100
   ```

3. **ステップ3: iOS デバイスで Safari を開く**
   ```
   URL: https://192.168.1.100:3000
   ```

4. **ステップ4: セキュリティ警告を許可**
   ```
   画面下部 → 「詳細」 → 「安全でないサイトにアクセス」
   ```

5. **ステップ5: ホーム画面に追加（オプション）**
   ```
   共有ボタン → 「ホーム画面に追加」
   ```

### Android（Chrome）

1. **ステップ1: PC で HTTPS サーバーを起動**
   ```bash
   npm run dev
   ```

2. **ステップ2: PC の IP アドレスを確認**

3. **ステップ3: Android デバイスで Chrome を開く**
   ```
   URL: https://192.168.1.100:3000
   ```

4. **ステップ4: 証明書の警告を許可**
   ```
   「続行」 を選択
   ```

## 📚 次のステップ

1. **カスタマイズ**
   - ネットワークを追加
   - SBT ルールを編集
   - UIカラースキームを変更

2. **統合**
   - 本番環境へのデプロイ
   - CI/CD パイプラインの設定

3. **テスト**
   - ユニットテストの追加
   - E2E テストの設定

## 📞 サポート

問題が発生した場合：

1. **ログを確認**
   - ブラウザのコンソール（F12）
   - 開発サーバーのログ

2. **GitHub Issues で確認**
   - 既知の問題と解決方法

3. **デバッグモード**
   ```bash
   DEBUG=* npm run dev
   ```

---

**完了したら**: `README.md` の「使用方法」に進んでください！
