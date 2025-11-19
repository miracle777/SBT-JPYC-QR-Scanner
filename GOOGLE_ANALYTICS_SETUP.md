# Google Analytics セットアップガイド

## 概要

このアプリケーションには Google Analytics 4 (GA4) が統合されており、以下の情報を追跡できます:

- ページビュー
- ユーザーのナビゲーションパス
- セッション時間
- デバイス・ブラウザ情報
- PWAインストール率

## セットアップ手順

### 1. Google Analytics アカウント設定

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 新しいプロパティを作成
3. **データストリーム** で「ウェブ」を選択
4. サイトURL（例: `https://jpyc-pay.app`）を入力
5. 測定ID（`G-XXXXXXXXXX`形式）を取得

### 2. 環境変数の設定

#### ローカル環境

`.env.local` ファイルを作成:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Vercel デプロイ

1. Vercelプロジェクト設定を開く
2. **Settings** → **Environment Variables** に移動
3. 新しい変数を追加:
   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (取得した測定ID)
   - **Environment**: Production, Preview, Development すべてにチェック

### 3. デプロイ

環境変数を設定後、再デプロイすると Google Analytics が有効化されます。

## カスタムイベントの送信

アプリケーション内でカスタムイベントを送信できます:

```typescript
import { event } from '@/components/GoogleAnalytics';

// 例: 決済完了イベント
event({
  action: 'payment_completed',
  category: 'Payment',
  label: 'JPYC Payment',
  value: 100
});

// 例: QRスキャンイベント
event({
  action: 'qr_scanned',
  category: 'Scanner',
  label: 'Payment QR'
});
```

## プライバシー設定

Google Analytics は以下の設定でプライバシーに配慮しています:

- **IPアドレスの匿名化**: 自動的に有効
- **Cookie使用**: ユーザー追跡のみに使用
- **個人情報の非収集**: ウォレットアドレスなどは送信していません

## 確認方法

### リアルタイムレポート

1. Google Analytics ダッシュボードを開く
2. **レポート** → **リアルタイム** を選択
3. アプリにアクセスして、リアルタイムでユーザーが表示されるか確認

### イベント確認

1. **レポート** → **イベント** を選択
2. `page_view` などの標準イベントが記録されているか確認

## トラブルシューティング

### データが表示されない場合

1. **測定IDが正しいか確認**
   ```bash
   echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
   ```

2. **ブラウザの開発者ツールで確認**
   - Network タブで `gtag/js` リクエストが送信されているか
   - Console に GA 関連のエラーがないか

3. **広告ブロッカーを無効化**
   - 広告ブロッカーが Google Analytics をブロックしている可能性

4. **環境変数が読み込まれているか確認**
   - ビルド時に環境変数が正しく設定されているか
   - Vercelの場合、再デプロイが必要

### 開発環境でのテスト

開発環境でもGoogle Analyticsを有効にする場合:

```env
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

本番環境とは別の測定IDを使用することを推奨します。

## データ保持期間

Google Analytics のデフォルトデータ保持期間は14ヶ月です。
設定変更は Google Analytics ダッシュボードから可能です。

## 参考リンク

- [Google Analytics 4 公式ドキュメント](https://support.google.com/analytics/answer/10089681)
- [Next.js Google Analytics統合ガイド](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
