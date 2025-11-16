# 環境変数設定ガイド

## 必要な環境変数

このアプリケーションでは以下の環境変数が必要です：

### 1. WalletConnect Project ID
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

**取得方法：**
1. [WalletConnect Cloud](https://cloud.walletconnect.com/) にアクセス
2. 新しいプロジェクトを作成
3. Project ID をコピー

### 2. アプリケーション名
```bash
NEXT_PUBLIC_APP_NAME=SBT-JPYC-QR-Scanner
```

## 設定方法

### ローカル開発環境
1. `.env.local` ファイルを作成（Gitから除外されます）
2. 上記の環境変数を設定

### Vercelデプロイ環境
1. Vercelダッシュボードにアクセス
2. プロジェクト設定 → Environment Variables
3. 環境変数を追加

### 重要な注意事項

⚠️ **セキュリティ上の注意**
- 環境変数ファイル（`.env*`）をGitHubにコミットしないでください
- `.env.production` には機密情報を含めないでください
- Vercelの環境変数機能を使用してください

✅ **安全な方法**
- Vercelダッシュボードで環境変数を設定
- `.env.local` でローカル開発
- `.env.example` でテンプレート提供

## 環境変数の確認

開発時に環境変数が正しく読み込まれているかを確認：

```javascript
console.log('Project ID:', process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID);
console.log('App Name:', process.env.NEXT_PUBLIC_APP_NAME);
```