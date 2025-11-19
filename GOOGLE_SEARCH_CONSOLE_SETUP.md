# Google Search Console セットアップガイド

## 概要

Google Search Console (GSC) を使用すると、以下の情報を確認できます:

- 検索パフォーマンス（クリック数、表示回数、CTR、掲載順位）
- インデックス登録状況
- モバイルユーザビリティ
- Core Web Vitals
- サイトマップ送信状況
- 検索エラーやペナルティ

## セットアップ手順

### 1. Google Search Console への登録

1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. **プロパティを追加** をクリック
3. **URLプレフィックス** を選択
4. サイトURL（`https://jpyc-pay.app`）を入力

### 2. 所有権の確認

#### 方法A: HTMLファイルアップロード（推奨）

1. GSCから提供されるHTMLファイルをダウンロード
2. `public/` フォルダに配置
3. コミット&デプロイ
4. GSCで「確認」をクリック

#### 方法B: HTMLタグ

1. GSCから提供される`<meta>`タグをコピー
2. `src/app/layout.tsx` の `metadata` に追加:

```typescript
export const metadata: Metadata = {
  // ... 既存の設定
  verification: {
    google: 'your-verification-code-here',
  },
};
```

#### 方法C: Google Analytics

既にGoogle Analyticsが設定されている場合、自動的に確認できます。

### 3. サイトマップの送信

1. GSCダッシュボードで **サイトマップ** を選択
2. 以下のURLを入力して送信:
   ```
   https://jpyc-pay.app/sitemap.xml
   ```
3. ステータスが「成功しました」になるのを待つ

### 4. robots.txt の確認

GSCで robots.txt が正しく認識されているか確認:

1. **設定** → **robots.txt テスター** を開く
2. `https://jpyc-pay.app/robots.txt` が正しく読み込まれるか確認

## 実装内容

### ✅ robots.txt
- `public/robots.txt` に配置済み
- サイトマップのURLを指定
- クローラーに適切な指示

### ✅ sitemap.xml (動的生成)
- `src/app/sitemap.ts` で自動生成
- 全ページを含む
- 更新頻度と優先度を設定

### ✅ メタデータ最適化
- タイトル、説明文の最適化
- Open Graph (OGP) 設定
- Twitter Card 設定
- キーワード設定
- robots メタタグ

### ✅ 構造化データ (JSON-LD)
- WebApplication スキーマ
- 作者情報
- 機能リスト
- 評価情報

## SEO最適化のポイント

### 1. タイトルタグ
- 各ページで適切なタイトルを設定
- 50-60文字程度
- キーワードを含める

### 2. メタディスクリプション
- 155-160文字程度
- ユーザーのクリックを促す内容
- キーワードを自然に含める

### 3. 構造化データ
- Schema.org のマークアップ
- リッチリザルト対象
- Google が理解しやすい形式

### 4. モバイルフレンドリー
- レスポンシブデザイン
- PWA対応
- 高速な読み込み

## 確認方法

### URL検査ツール

1. GSCで **URL検査** を選択
2. 確認したいURLを入力
3. インデックス状況を確認
4. 必要に応じて「インデックス登録をリクエスト」

### パフォーマンスレポート

1. **検索パフォーマンス** を選択
2. クリック数、表示回数、CTR、掲載順位を確認
3. クエリ、ページ、国、デバイス別に分析

### カバレッジレポート

1. **カバレッジ** を選択
2. インデックス登録されたページ数を確認
3. エラーや警告があれば対応

## トラブルシューティング

### サイトマップが読み込めない

```bash
# サイトマップのURLを直接確認
curl https://jpyc-pay.app/sitemap.xml
```

### インデックス登録されない

1. robots.txt でブロックされていないか確認
2. noindex タグが設定されていないか確認
3. 手動でインデックス登録をリクエスト

### 構造化データエラー

[構造化データテストツール](https://search.google.com/test/rich-results) で確認:
```
https://jpyc-pay.app
```

## モニタリング推奨項目

### 週次確認
- [ ] 検索パフォーマンス（クリック数、表示回数）
- [ ] 新規インデックス登録ページ
- [ ] エラーや警告

### 月次確認
- [ ] Core Web Vitals
- [ ] モバイルユーザビリティ
- [ ] 検索クエリのトレンド
- [ ] 掲載順位の変動

### 随時
- [ ] 手動対策の通知
- [ ] セキュリティの問題
- [ ] インデックス カバレッジの問題

## 参考リンク

- [Google Search Console ヘルプ](https://support.google.com/webmasters/)
- [検索エンジン最適化（SEO）スターター ガイド](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [構造化データ テストツール](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
