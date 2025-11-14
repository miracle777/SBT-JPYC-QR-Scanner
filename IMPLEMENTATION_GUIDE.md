# SBT-JPYC-QR-Scanner 実装ガイド

## 📖 ドキュメント概要

このドキュメントは、SBT-JPYC-QR-Scanner の実装方法と、参考リポジトリ（jpyc-payment-scanner、SBT-JPYC-Pay）の統合パターンを説明します。

## 🔗 参考リポジトリとの統合

### jpyc-payment-scanner からの継承要素

#### 1. QRスキャン機能

```typescript
// 元のコード: src/components/QRScannerSimple.tsx
import QRScanner from 'qr-scanner';

// 拡張版: ネットワーク検証を追加
import { parseQRCodeData, validatePaymentNetwork } from '@/src/utils/network';

const handleQRResult = async (result: string) => {
  // 1. QRデータをパース
  const qrData = parseQRCodeData(result);
  
  // 2. ネットワーク検証（新機能）
  const validation = validatePaymentNetwork(currentChainId, qrData);
  
  // 3. 警告表示（新UI）
  if (!validation.isValid) {
    showNetworkWarning(validation);
    return;
  }
  
  // 4. 決済画面へ（既存）
  proceedToPayment(qrData);
};
```

#### 2. MetaMask連携

```typescript
// 既存: wagmi フック
const { address, chainId } = useAccount();
const { switchNetwork } = useSwitchNetwork();

// 拡張: ネットワーク自動切り替え
const switchToNetwork = async (targetNetwork: NetworkType) => {
  const targetChainId = SUPPORTED_NETWORKS[targetNetwork].chainId;
  await switchNetwork?.({ chainId: targetChainId });
};
```

#### 3. 決済フロー

```typescript
// 既存フロー
QRスキャン → 金額確認 → MetaMask署名 → 完了

// 拡張フロー
QRスキャン → ネットワーク検証 → SBT割引確認 → 金額確認 → MetaMask署名 → 完了
```

### SBT-JPYC-Pay からの継承要素

#### 1. QRコード生成フォーマット

```typescript
// 参考: SBT-JPYC-Pay の QRコード生成ロジック
// 拡張フォーマット:

// 基本決済
createPaymentQRCode(
  '0xPaymentAddress',
  '100',    // 金額
  'sepolia', // ネットワーク指定（新）
  'テスト'   // メモ
)
// 結果: payment:0xPaymentAddress?network=sepolia&amount=100&memo=テスト

// SBT限定決済
createSBTPaymentQRCode(
  '0xPaymentAddress',
  '50',
  'ethereum',
  ['jpyc-early-adopter'],  // SBT ID
  'gold'                    // 最小ランク
)
// 結果: sbt-payment:0xPaymentAddress?network=ethereum&sbt=jpyc-early-adopter&sbt-rank=gold&amount=50
```

#### 2. SBT検証ロジック

```typescript
// SBT-JPYC-Pay の検証パターン
// 拡張: ネットワーク毎の SBT 検証

// 1. ユーザーの SBT を取得
const userSBTs = await fetchSBTsByNetwork(address, 'ethereum');

// 2. 必要な SBT を確認
const hasRequiredSBT = qrData.sbtRequired?.every(
  (sbtId) => userSBTs.some((sbt) => sbt.id === sbtId)
);

// 3. ランク確認
const userRank = await getUserHighestRank(address);
const canPayWithRank = rankOrder[userRank] >= rankOrder[minimumRank];

// 4. 割引計算
const discount = hasRequiredSBT ? SBT_PAYMENT_RULES[sbtId].discount : 0;
```

## 📋 主要な実装パターン

### 1. ネットワーク検証フロー

```typescript
// src/utils/network.ts

export function validatePaymentNetwork(
  currentChainId: number,
  qrData: PaymentQRData
): NetworkValidationResult {
  // QRデータからネットワークを取得
  const requiredNetwork = qrData.network || 'ethereum';
  
  // 現在のネットワークと比較
  return validateNetwork(currentChainId, requiredNetwork);
}

// 使用例
const validation = validatePaymentNetwork(chainId, qrData);

if (validation.mismatch) {
  // ネットワーク警告を表示
  <NetworkValidation
    validation={validation}
    qrData={qrData}
    onSwitchNetwork={() => switchToNetwork(validation.requiredNetwork)}
  />
}
```

### 2. SBTフィルタリング

```typescript
// src/utils/sbt.ts

// ネットワーク別にSBTをフィルタ
export async function fetchSBTsByNetwork(
  userAddress: `0x${string}`,
  network: NetworkType
): Promise<SBT[]> {
  const sbts = await fetchUserSBTs(userAddress);
  return sbts.filter((sbt) => sbt.network === network);
}

// 使用例
const ethereumSBTs = await fetchSBTsByNetwork(address, 'ethereum');
const sepoliaSBTs = await fetchSBTsByNetwork(address, 'sepolia');
```

### 3. 割引計算

```typescript
// 方式 1: 単一SBT
const discount = SBT_PAYMENT_RULES[sbtId].discount;
const discountedAmount = calculateDiscount(amount, discount);

// 方式 2: 複数SBT（最高割引）
const applicableRules = qrData.sbtRequired?.map(
  (id) => SBT_PAYMENT_RULES[id]
);
const maxDiscount = Math.max(...applicableRules.map((r) => r.discount));
const finalDiscountedAmount = calculateDiscount(amount, maxDiscount);
```

## 🛠 実装チェックリスト

### 必須ファイル（完了）

- ✅ `src/types/index.ts` - 型定義
- ✅ `src/utils/network.ts` - ネットワーク検証
- ✅ `src/utils/sbt.ts` - SBT管理
- ✅ `src/components/SBTDisplay.tsx` - SBT表示UI
- ✅ `src/components/NetworkValidation.tsx` - ネットワーク検証UI
- ✅ `package.json` - 依存関係
- ✅ `tsconfig.json` - TypeScript設定
- ✅ `tailwind.config.ts` - Tailwind設定
- ✅ `.env.example` - 環境変数テンプレート

### 次のステップ

- ⏳ `src/app/layout.tsx` - メインレイアウト（PWA設定）
- ⏳ `src/app/page.tsx` - メインページ（タブナビゲーション）
- ⏳ `src/app/providers.tsx` - RainbowKit設定
- ⏳ `src/components/QRScanner.tsx` - QRスキャナー（ネットワーク検証統合）
- ⏳ `src/components/PaymentConfirm.tsx` - 決済確認画面（SBT割引表示）
- ⏳ `src/utils/payment.ts` - 決済ロジック
- ⏳ `public/manifest.json` - PWA設定

## 📚 参考実装パターン

### パターン1: QRスキャン完全フロー

```typescript
// 1. QRスキャン
const handleScan = (qrString: string) => {
  // 2. パース
  const qrData = parseQRCodeData(qrString);
  
  // 3. ネットワーク検証
  const validation = validatePaymentNetwork(chainId, qrData);
  
  if (!validation.isValid) {
    // 警告表示
    setShowNetworkWarning(true);
    setValidation(validation);
    return;
  }
  
  // 4. SBT割引確認
  const { discount, reason } = await canPayWithNetwork(
    address,
    qrData.network || 'ethereum',
    BigInt(qrData.amount || 0)
  );
  
  // 5. 決済画面へ
  navigateToPayment({ qrData, discount });
};
```

### パターン2: ネットワーク自動切り替え

```typescript
const handleAutoSwitchNetwork = async () => {
  try {
    await switchNetwork?.({
      chainId: SUPPORTED_NETWORKS[validation.requiredNetwork].chainId,
    });
    
    // 切り替え後、決済を続行
    proceedToPayment(qrData);
  } catch (error) {
    console.error('Network switch failed:', error);
    showError('ネットワーク切り替えに失敗しました');
  }
};
```

### パターン3: SBT別処理

```typescript
const processSBTPayment = async () => {
  // SBT限定決済
  if (qrData.type === 'sbt-payment') {
    // 必要なSBTを確認
    const hasSBT = qrData.sbtRequired?.every(
      (id) => userSBTs.some((sbt) => sbt.id === id)
    );
    
    if (!hasSBT) {
      showError('必要なSBTを保有していません');
      return;
    }
    
    // ランク確認
    if (qrData.minimumSBTRank) {
      const rankOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
      const userRank = await getUserHighestRank(address);
      
      if (rankOrder[userRank] < rankOrder[qrData.minimumSBTRank]) {
        showError(
          `${qrData.minimumSBTRank} ランク以上が必要です`
        );
        return;
      }
    }
  }
  
  // 決済実行
  executePayment();
};
```

## 🔍 デバッグのコツ

### ネットワーク検証デバッグ

```typescript
// 1. QRデータの確認
console.log('Parsed QR Data:', qrData);

// 2. ネットワーク設定の確認
console.log('Required Network:', SUPPORTED_NETWORKS[qrData.network]);

// 3. 現在のネットワークの確認
console.log('Current Chain ID:', chainId);
console.log('Current Network:', getNetworkFromChainId(chainId));

// 4. 検証結果の確認
console.log('Validation Result:', validation);
```

### SBT取得デバッグ

```typescript
// 1. ユーザーアドレスの確認
console.log('User Address:', address);

// 2. SBT一覧の確認
const sbts = await fetchUserSBTs(address);
console.log('User SBTs:', sbts);

// 3. ネットワーク別SBTの確認
sbts.forEach((sbt) => {
  console.log(`${sbt.name} (${sbt.network}):`, sbt);
});

// 4. ランク情報の確認
const rank = await getUserHighestRank(address);
console.log('Highest Rank:', rank, RANK_INFO[rank]);
```

## 📊 テストケース

### テスト1: 基本的なQRスキャン

```bash
QRデータ: payment:0x1234...?network=ethereum&amount=100
期待結果: ネットワーク確認 → 決済画面表示
```

### テスト2: ネットワーク不一致

```bash
QRデータ: payment:0x1234...?network=sepolia&amount=100
ウォレット: Ethereum Mainnet に接続
期待結果: ネットワーク警告 → 自動切り替え選択肢
```

### テスト3: SBT限定決済

```bash
QRデータ: sbt-payment:0x1234...?sbt=jpyc-early-adopter&sbt-rank=gold
ウォレット: Gold SBT を保有
期待結果: 10% 割引を適用して決済画面へ
```

### テスト4: SBT不足

```bash
QRデータ: sbt-payment:0x1234...?sbt=jpyc-early-adopter&sbt-rank=platinum
ウォレット: Silver SBT のみ保有
期待結果: エラーメッセージ表示
```

## 🚀 デプロイ準備

### 環境変数チェックリスト

- [ ] `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - 設定済み
- [ ] `NEXT_PUBLIC_JPYC_CONTRACT_ADDRESS` - 正しいアドレス
- [ ] `NEXT_PUBLIC_CHAIN_ID` - テストネット/メインネット確認
- [ ] `NEXT_PUBLIC_ENVIRONMENT` - 本番設定確認

### ビルド確認

```bash
# ビルドエラーチェック
npm run build

# Lint チェック
npm run lint

# 型チェック
npx tsc --noEmit
```

## 📖 参考資料

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [wagmi Documentation](https://wagmi.sh/)
- [viem Documentation](https://viem.sh/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**このドキュメント最終更新**: 2025年11月14日
