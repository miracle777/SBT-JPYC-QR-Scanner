---
title: JPYC対応 SBTスタンプ型ウォレット & QRコード決済アプリ開発記録
emoji: 🪪
type: "tech"
topics: ["web3","jpyc","sbt","nextjs","polygon","avalanche","wallet","qr"]
published: ture
---

## 概要

本記事は、JPYC（日本円ステーブルコイン）による QR コード決済体験と、SBT（Soulbound Token）をスタンプカードのように"集める楽しさ"へ昇華させる Web アプリ開発過程の記録です。本アプリは MetaMask などの自己管理型ウォレットに接続して利用する形式で、ウォレット機能自体は持ちません。MetaMask 等に不慣れな人にも利用しやすい UI で、店舗来訪の履歴・コレクション性・来店ステージ可視化を目指しました。

## 開発した思い

私は本プロジェクトを、ウォレット操作に不慣れな方でも JPYC の QR コード決済を気軽に体験できる環境を用意したいという思いから始めました。
JPYC が店舗に浸透すればキャッシュレス決済のさらなる普及にも貢献できるはずです。
さらに SBT をスタンプカードのように活用して店舗ごとに個性的なトークンが増えればコレクションする楽しみが生まれ、その収集欲求が「JPYC 決済して SBT がもらえる店を選ぶ」行動につながる未来を期待しています。

## 特徴

1. **自己管理型ウォレット接続**: MetaMask などに接続する非カストディアル方式で秘密鍵はユーザー管理。
2. **位置情報付き決済履歴**: どこの店舗で支払ったか直感的に把握可能。
3. **複数 QR 規格対応**: EIP-681 標準 / masaru21QR 独自形式 / 店舗アプリ連携に対応。
4. **手動送付機能**: QR コード不要で送り先ウォレットアドレス直接入力可能。メモ機能で送付先記録を残せるため、パソコン利用時など柔軟な支払い先に対応。
5. **メモ保存機能**: QR 支払い／手動送付どちらでもメモを記録。
6. **PWA 対応**: iOS のホーム画面に追加してネイティブアプリのように利用可能。オフライン対応やプッシュ通知にも対応。
7. **マルチネットワーク**: テストネット／本番ネットワーク両対応。
8. **SBT ギャラリー**: 店舗発行 SBT をコレクション表示。
9. **来店ステージ**: 来店回数から顧客ランク（Bronze / Silver / Gold）を可視化。

## 技術スタック概要

| 分類 | 採用技術 | 目的 |
|------|----------|------|
| フロント | Next.js (App Router) + TypeScript | 迅速開発 & 型安全 |
| UI | Tailwind CSS | 軽量スタイリング |
| PWA | manifest + SW | オフライン / インストール促進 |
| 接続 | MetaMask / EIP-1193 | 署名・チェーン情報取得 |
| トークン | JPYC / tJPYC (ERC-20) | 決済 & 検証 |
| SBT | Soulbound 独自設計 | 来店スタンプ表現 |
| 解析 | Google Analytics | 利用動線計測 |
| 位置情報 | Geolocation API | 決済履歴紐付け |

```text
src/
  app/               # ページ(App Router)
  components/        # UI/機能コンポーネント
  contracts/         # コントラクト呼出ラッパ
  utils/             # 汎用ロジック
  types/             # 型定義
public/              # PWA関連 / 静的資産
```

主な責務分離:

- `PaymentProcessor.tsx` / `ManualPaymentProcessor.tsx`: 送金ロジックとUI分離
- `SBTGallery.tsx`: SBT コレクション表示
- `SBTSyncChecker.tsx`: ウォレットとローカルの同期確認
- `GoogleAnalytics.tsx`: ルーティング連動 PV 計測

## ギャラリー表示例 (SBT コレクション)

獲得した SBT をカード形式で表示し、クリックでメタデータ詳細や取得日時を確認できる UI。来店履歴の視覚化と"集める動機"強化を両立。

### 実際のギャラリー画面

実際の動作画面やスクリーンショットは以下の note 記事で紹介しています:

[JPYC専用QRコード決済できるように - note](https://note.com/masaru21/n/n92d9459b948a)

店舗別に発行された様々な SBT（スタンプカード / 来店証明 / ランクバッジ）を一覧表示し、取得日時やメタデータを確認できます。来店回数に応じたステージ（Bronze / Silver / Gold）やカテゴリフィルタ機能も実装済みです。

### コード例

```tsx:src/components/SBTGallery.tsx（一部簡略）
import { useEffect, useState } from 'react';
import { fetchUserSBTs } from '@/utils/sbt';

type SBTMeta = {
  tokenId: string;
  name: string;
  image: string;
  description?: string;
  acquiredAt?: string; // ローカル保存 or 取得時刻
};

export function SBTGallery() {
  const [items, setItems] = useState<SBTMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<SBTMeta | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchUserSBTs();
      setItems(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading SBTs...</p>;
  if (!items.length) return <p className="text-sm">まだSBTがありません。来店で獲得しましょう。</p>;

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map(sbt => (
          <button
            key={sbt.tokenId}
            className="rounded border p-2 shadow hover:shadow-md bg-white/70 backdrop-blur"
            onClick={() => setActive(sbt)}
          >
            <img src={sbt.image} alt={sbt.name} className="aspect-square object-cover rounded" />
            <div className="mt-1 text-xs font-semibold truncate">{sbt.name}</div>
            <div className="text-[10px] text-gray-500">ID #{sbt.tokenId}</div>
          </button>
        ))}
      </div>
      {active && (
        <div className="mt-4 border rounded p-4 bg-gray-50">
          <h3 className="font-bold mb-2">{active.name}</h3>
          <img src={active.image} alt={active.name} className="mb-2 rounded" />
          <p className="text-sm whitespace-pre-line">{active.description || 'No description'}</p>
          <p className="text-xs text-gray-500 mt-2">Acquired: {active.acquiredAt || 'Unknown'}</p>
          <button className="mt-2 text-xs underline" onClick={() => setActive(null)}>閉じる</button>
        </div>
      )}
    </div>
  );
}
```

## 手動送付機能で柔軟な支払い対応

QR コードスキャンに加えて、送り先ウォレットアドレスを直接入力する手動送付機能を実装しています。この機能により以下のメリットがあります:

- **QR コード非対応の相手にも送金可能**: 店舗以外の個人間送金やオンライン決済など幅広い用途に対応
- **パソコンでの利便性向上**: デスクトップブラウザでアドレスをコピー＆ペーストして素早く送金
- **メモ機能で記録管理**: 「〇〇さんへの支払い」「△△購入代金」など送付先や用途をメモとして残せる
- **位置情報も記録可能**: 手動送付でも決済履歴に位置情報を付与し後から振り返りやすい

送金フローは QR スキャンと同等にシンプルで、金額・送り先アドレス・メモを入力して MetaMask で署名するだけです。

## PWA 対応でアプリライクな体験

Progressive Web App (PWA) として実装しているため、以下の利点があります:

- **iOS / Android ホーム画面に追加**: Safari や Chrome から「ホーム画面に追加」でネイティブアプリのように起動可能
- **オフライン対応**: Service Worker により一部機能はオフラインでも動作（履歴閲覧など）
- **インストール不要**: App Store / Google Play を経由せず即座に利用開始
- **自動アップデート**: ブラウザキャッシュ更新で常に最新版を利用

iOS では特に、ホーム画面アイコンからフルスクリーン表示で起動するため通常のアプリと遜色ない UX を実現しています。

## EIP-681 と QR コード対応

本アプリは複数の QR コード形式に対応しています:

### 1. EIP-681 標準規格

Ethereum Improvement Proposal 681 に準拠した標準 URI 形式 (`ethereum:<address>@<chainId>/transfer?...`) に対応。MetaMask などの主要ウォレットアプリで読み取り可能な汎用 QR コードを生成・読取できます。これにより金額・宛先のヒューマンエラーを削減し UX が向上します。

### 2. masaru21QR 独自規格

店舗情報やメモなど拡張データを含む独自形式 `masaru21QR` にも対応。本アプリ専用ですが、決済履歴への詳細情報保存やオフライン対応など柔軟な運用が可能です。

### 3. 店舗アプリ連携 (SBT-JPYC-Pay)

別途公開している店舗側アプリ [SBT-JPYC-Pay](https://github.com/miracle777/SBT-JPYC-Pay)（デモ: [https://shop.jpyc-pay.app/](https://shop.jpyc-pay.app/)）が生成する QR コードにも対応しており、店舗名や SBT 発行情報を自動取得できます。これにより店舗とユーザー間でシームレスな決済体験を実現しています。

## SBT を“スタンプ”にする設計

譲渡不可トークンを来店記録と位置付け、“所有価値”より“体験記録価値”を強調。来店ランク (Bronze → Silver → Gold 等) をUIで段階表示しゲーミフィケーションを最小コストで導入。

## Remix を使いテストトークンを作成

Polygon Amoy / Avalanche Fuji にJPYCテスト版が無かったため、ERC-20 対応の tJPYC をミントしました。
こちらは、私の未使用可能なトークンです。
そのため、各自でトークンを作成した場合は、差し替えで対応可能です。

## データ保存と将来構想

現状 LocalStorage。将来は認証付きバックエンド + DB (PostgreSQL + Prisma 等) / Indexer 活用で来店集計高速化・不正検知・行動分析を実現予定。

## 学び / 知見ハイライト

1. UX 摩擦低減: 初回接続ガイド + QR 自動解析で“押すだけ感”。
2. 標準規格優先: EIP-681 ベースで学習コスト削減。
3. SBT = 体験記録: ランク表示が継続動機に寄与。
4. マルチテストネット: 早期挙動差検証で本番トラブル回避。
5. Lean 段階化: まずフロント中心で価値確認 → 後にバックエンド拡張。

## 課題と対応（抜粋）

| 課題 | アプローチ | 結果/狙い |
|------|------------|-----------|
| ウォレット操作学習 | ステップ化 UI / ツールチップ | 離脱率低下予測 |
| QR 多様形式 | 標準 + 内部拡張二層 | 複雑度抑制 |
| 同期不可(LocalStorage) | 初期は割り切り | 工数最小化 |
| 位置情報許可失敗 | フォールバック未記録扱い | UX破綻回避 |
| SBT表示遅延 | キャッシュ & 取得順序調整 | 体感改善 |

## セキュリティ / 信頼性メモ

- 送金は必ずユーザー署名（意図しない送金防止）
- QR 内容は確認 UI を挟みサイレント送金防止
- LocalStorage 改ざん耐性は低いため“参考値”扱い
- SBT は譲渡不可で不正二次流通を抑止

## 今後の拡張アイデア

- バックエンド導入 / 集計 API 化
- 店舗別ダッシュボード
- 動的 SBT メタ更新（来店回数連動）
- ソーシャル共有カード生成
- ENS / 他 Web3 ID 連携
- 位置情報プライバシー保護（丸め / 離散化処理）

## 将来の夢

事業化段階で堅牢な DB + 分析基盤を整備し、安定運用と不正検知を実現する。オンチェーン + オフチェーンのハイブリッド指標で顧客価値最大化を図りたい。

## セットアップ（抜粋）

```bash
pnpm install
pnpm dev

# .env.local 例
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
NEXT_PUBLIC_DEFAULT_CHAIN_ID=80002
```



記事ファイル名 (= slug) は `jpyc-sbt-qr-wallet`。公開時 URL 例: `https://zenn.dev/<your_username>/articles/jpyc-sbt-qr-wallet`。

## 参考ドキュメント

- `QR_FORMAT_SPECIFICATION.md` : QR 仕様詳細
- `WALLET_CONNECTOR_CODE.md` : ウォレット接続ロジック
- `IMPLEMENTATION_GUIDE.md` : 実装ガイド

## おわりに

“支払う”行為にコレクション体験を重ね合わせることで、継続来店インセンティブを自然に設計できる可能性を感じました。ステーブルコイン決済 UX 改善と SBT 活用事例の一助になれば幸いです。フィードバック歓迎します。

---

