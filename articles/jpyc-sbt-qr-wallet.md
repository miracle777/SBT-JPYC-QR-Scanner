---
title: JPYC対応 SBTスタンプ型ウォレット & QRコード決済アプリ開発記録
emoji: 🪪
type: "tech"
topics: ["web3","jpyc","sbt","nextjs","polygon","avalanche","wallet","qr"]
published: false
---

## 概要

本記事は、JPYC（日本円ステーブルコイン）による QR コード決済体験と、SBT（Soulbound Token）をスタンプカードのように“集める楽しさ”へ昇華させる Web アプリ開発過程の記録です。MetaMask 等に不慣れな人にも利用しやすく、店舗来訪の履歴・コレクション性・来店ステージ可視化を目指しました。

## 開発した思い

私は本プロジェクトを、ウォレット操作に不慣れな方でも JPYC の QR コード決済を気軽に体験できる環境を用意したいという思いから始めました。
JPYC が店舗に浸透すればキャッシュレス決済のさらなる普及にも貢献できるはずです。
さらに SBT をスタンプカードのように活用して店舗ごとに個性的なトークンが増えればコレクションする楽しみが生まれ、その収集欲求が「JPYC 決済して SBT がもらえる店を選ぶ」行動につながる未来を期待しています。

## 特徴

1. 決済履歴に位置情報を付与し、どこの店舗かを直感的に把握できる。
2. EIP-681 規格対応で、店頭印刷されたウォレット向け標準 QR にも対応。
3. QR 支払い／手動送付どちらでもメモ保存可能。
4. テストネット／本番ネットワーク両対応。
5. SBT ギャラリーで店舗発行 SBT をコレクション可能。
6. 来店回数（履歴）から顧客ステージ表示が可能。

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

![SBTギャラリー実装例](https://assets.st-note.com/img/1732115783-RXEVMivYeF92H7dNcT1pDKLZ.png?width=1200)

上記は実際の SBT ギャラリー画面です。店舗別に発行された様々な SBT（スタンプカード / 来店証明 / ランクバッジ）を一覧表示し、取得日時やメタデータを確認できます。来店回数に応じたステージ（Bronze / Silver / Gold）やカテゴリフィルタ機能も実装済みです。

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

## EIP-681 と QR コード

EIP-681 準拠 URI を採用しウォレット標準スキャンで送金フォーム自動生成。金額・宛先ヒューマンエラーを削減し UX 向上。独自メモや店舗 ID はアプリ側メタ管理で互換性維持。

## SBT を“スタンプ”にする設計

譲渡不可トークンを来店記録と位置付け、“所有価値”より“体験記録価値”を強調。来店ランク (Bronze → Silver → Gold 等) をUIで段階表示しゲーミフィケーションを最小コストで導入。

## Remix を使いテストトークンを作成

Polygon Amoy / Avalanche Fuji にJPYCテスト版が無かったため、ERC-20 対応の tJPYC をミント。差し替えで各自テストトークンにも対応可能。

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

