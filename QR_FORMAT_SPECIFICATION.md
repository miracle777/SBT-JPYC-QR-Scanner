# QRコード メタ情報フォーマット仕様書

**プロジェクト**: SBT-JPYC-QR-Scanner  
**バージョン**: 1.1.0  
**更新日**: 2025年11月18日

## 📋 概要

このドキュメントは、SBT-JPYC-QR-Scannerアプリが受け取り可能なQRコードのメタ情報フォーマットを詳細に説明します。店舗側でQRコードを生成する際の参考資料としてご活用ください。

## 🎯 対応フォーマット一覧

| 形式 | 用途 | 推奨度 | 備考 |
|------|------|--------|------|
| [JSON形式 - 店舗QRコード（レガシー）](#1-json形式店舗qrコードレガシー) | 店舗決済 | ⭐⭐ | 互換性のため |
| [JSON形式 - JPYC決済（統一標準）](#2-json形式jpyc決済統一標準形式) | **全環境対応** | ⭐⭐⭐ | **推奨統一形式** |
| [URLスキーマ形式（簡易）](#3-urlスキーマ形式簡易) | 軽量決済 | ⭐ | シンプル |
| [主要ウォレット対応形式](#4-主要ウォレット対応形式) | **世界標準対応** | ⭐⭐⭐ | **MetaMask等** |

## 📊 フォーマット詳細仕様

### 1. JSON形式：店舗QRコード（レガシー）

**互換性維持のため残存**。既存の店舗QRコードとの互換性を保つための形式です。新規開発では統一標準形式（MASARU21_PAYMENT）の使用を推奨します。

```json
{
  "type": "payment",
  "shopId": "shop_12345",
  "shopName": "テスト店舗",
  "shopWallet": "0x1234567890123456789012345678901234567890",
  "amount": "1000000000000000000",
  "currency": "JPYC",
  "chainId": 11155111,
  "paymentId": "pay_20241118_001",
  "expiresAt": 1732012800,
  "contractAddress": "0xd3eF95d29A198868241FE374A999fc25F6152253",
  "description": "商品購入代金"
}
```

#### 必須フィールド

| フィールド | 型 | 説明 | 例 |
|------------|----|----- |-----|
| `type` | string | 固定値: "payment" | "payment" |
| `shopWallet` | string | 店舗のウォレットアドレス | "0x1234..." |
| `amount` | string | 決済金額（Wei単位） | "1000000000000000000" |
| `chainId` | number | ネットワークID | 11155111 |
| `contractAddress` | string | JPYCコントラクトアドレス | "0xd3eF..." |

#### オプションフィールド

| フィールド | 型 | 説明 | 例 |
|------------|----|----- |-----|
| `shopId` | string | 店舗識別子 | "shop_12345" |
| `shopName` | string | 店舗名 | "テスト店舗" |
| `currency` | string | 通貨名 | "JPYC" |
| `paymentId` | string | 決済ID | "pay_20241118_001" |
| `expiresAt` | number | 有効期限（Unix timestamp） | 1732012800 |
| `description` | string | 決済内容説明 | "商品購入代金" |

### 2. JSON形式：masaru21QR（統一標準形式）

**🔥 推奨統一形式**。テスト・本番問わず、すべてこの形式で統一します。ネットワークとコントラクトアドレスで自動判別されるため、別々のtypeは不要です。

#### Sepolia（テストネット）の例

```json
{
  "type": "MASARU21_PAYMENT",
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "100",
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0xd3eF95d29A198868241FE374A999fc25F6152253",
  "merchant": {
    "name": "テスト店舗",
    "id": "shop_12345",
    "description": "商品購入"
  },
  "timestamp": 1732012800,
  "expires": 1732099200
}
```

#### Ethereum Mainnet（本番）の例

```json
{
  "type": "MASARU21_PAYMENT",
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "100",
  "network": "ethereum",
  "chainId": 1,
  "contractAddress": "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB",
  "merchant": {
    "name": "本番店舗",
    "id": "shop_12345",
    "description": "商品購入"
  },
  "timestamp": 1732012800,
  "expires": 1732099200
}
```

#### Polygon Mainnet（本番）の例

```json
{
  "type": "MASARU21_PAYMENT",
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "100",
  "network": "polygon",
  "chainId": 137,
  "contractAddress": "0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c",
  "merchant": {
    "name": "Polygon店舗",
    "id": "shop_12345",
    "description": "Polygon決済"
  },
  "timestamp": 1732012800,
  "expires": 1732099200
}
```

#### Polygon Amoy（テストネット）の例

```json
{
  "type": "MASARU21_PAYMENT",
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "100",
  "network": "polygon-amoy",
  "chainId": 80002,
  "contractAddress": "0x...",
  "merchant": {
    "name": "Amoyテスト店舗",
    "id": "shop_12345",
    "description": "Amoy決済"
  },
  "timestamp": 1732012800,
  "expires": 1732099200
}
```

#### Avalanche Fuji（テストネット）の例

```json
{
  "type": "MASARU21_PAYMENT",
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "100",
  "network": "avalanche-fuji",
  "chainId": 43113,
  "contractAddress": "0x...",
  "merchant": {
    "name": "Fujiテスト店舗",
    "id": "shop_12345",
    "description": "Fuji決済"
  },
  "timestamp": 1732012800,
  "expires": 1732099200
}
```

#### 特徴

- **統一性**: テスト・本番で同じ`type: "MASARU21_PAYMENT"`
- **自動判別**: `network`と`contractAddress`で環境を自動判別
- **JPYC単位**: `amount`は常にJPYC単位（小数点なし）
- **構造化店舗情報**: `merchant`オブジェクトで店舗情報を管理
- **有効期限**: `timestamp`（作成時刻）と`expires`（有効期限）

### 3. URLスキーマ形式（簡易）

**📝 廃止予定**。統一標準形式（MASARU21_PAYMENT）への移行を推奨します。軽量な決済専用URL形式です。

#### payment: 形式（汎用）

```text
payment:0x1234567890123456789012345678901234567890?amount=100&network=sepolia&memo=テスト決済
```

#### jpyc: 形式（JPYC専用）

```text
jpyc:0x1234567890123456789012345678901234567890?amount=100&network=sepolia&contract=0xd3eF95d29A198868241FE374A999fc25F6152253
```

#### SBT決済形式（特殊）

```text
sbt-payment:0x1234567890123456789012345678901234567890?amount=100&network=ethereum&sbt=0xSBTAddress1,0xSBTAddress2&sbt-rank=silver
```

#### URLパラメーター

| パラメーター | 説明 | 例 | 必須 |
|-------------|------|-----|------|
| `amount` | 決済金額 | "100" | ❌ |
| `network` | ネットワーク名 | "sepolia" | ⭐ |
| `memo` | メモ | "テスト決済" | ❌ |
| `contract` | コントラクトアドレス | "0x..." | ❌ |
| `sbt` | 必要なSBTアドレス（カンマ区切り） | "0x...,0x..." | ❌ |
| `sbt-rank` | 最低SBTランク | "silver" | ❌ |

### 4. 主要ウォレット対応形式

世の中で広く使われているウォレットのQRコードフォーマットに対応しています。

#### MetaMask・Trust Wallet対応（EIP-681標準）

**✅ 完全対応済み**。Ethereum標準の決済URIで、MetaMaskやTrust Walletで広くサポートされています。

```text
ethereum:0x1234567890123456789012345678901234567890@11155111?value=100000000000000000
```

#### WalletConnect対応

**✅ 検出対応済み**。WalletConnect URIの検出には対応していますが、決済処理は未対応です。

```text
wc:00e46b69-d0cc-4b3e-b6a2-cee442f97188@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=...
```

#### Coinbase Wallet対応

**📱 追加対応**。Coinbase Walletの独自フォーマットにも対応します。

```text
https://go.cb-w.com/dapp?cb_url=ethereum%3A0x1234...%4011155111%3Fvalue%3D100000000000000000
```

#### Rainbow Wallet対応

**🌈 追加対応**。Rainbow Walletのディープリンクフォーマットに対応します。

```text
rainbow://ethereum:0x1234567890123456789012345678901234567890@11155111?value=100000000000000000
```

#### Phantom Wallet対応（Solana）

**👻 将来対応予定**。Solana系ウォレット用フォーマットです（現在はEthereumのみ対応）。

```text
solana:4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T?amount=1000000&message=Payment
```

#### 共通フォーマット

```text
ethereum:<address>[@<chain_id>][?<parameters>]
```

#### パラメーター詳細

| パラメーター | 説明 | 単位 | MetaMask | Trust Wallet | Coinbase | Rainbow |
|-------------|------|------|----------|-------------|----------|---------|
| `value` | 送金額 | Wei | ✅ | ✅ | ✅ | ✅ |
| `gas` | ガス制限 | Wei | ✅ | ✅ | ❌ | ✅ |
| `gasPrice` | ガス価格 | Wei | ✅ | ✅ | ❌ | ✅ |
| `data` | コントラクトデータ | Hex | ✅ | ✅ | ✅ | ✅ |
| `chainId` | ネットワークID | Number | ✅ | ✅ | ✅ | ✅ |

#### 使用例

```javascript
// MetaMask互換のJPYC送金QRコード生成
function generateMetaMaskJPYCQR(params: {
  recipient: string;
  amountJPYC: number;
  network: 'ethereum' | 'sepolia' | 'polygon';
}): string {
  
  const networkConfig = {
    ethereum: { chainId: 1, contract: '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB' },
    sepolia: { chainId: 11155111, contract: '0xd3eF95d29A198868241FE374A999fc25F6152253' },
    polygon: { chainId: 137, contract: '0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c' }
  };
  
  const config = networkConfig[params.network];
  const amountWei = (BigInt(params.amountJPYC) * BigInt(10 ** 18)).toString();
  
  // JPYC送金用のコントラクト呼び出しデータ生成
  const transferData = `0xa9059cbb${params.recipient.slice(2).padStart(64, '0')}${amountWei.padStart(64, '0')}`;
  
  return `ethereum:${config.contract}@${config.chainId}?data=${transferData}`;
}

// 使用例
const metamaskQR = generateMetaMaskJPYCQR({
  recipient: '0x1234567890123456789012345678901234567890',
  amountJPYC: 100,
  network: 'sepolia'
});

console.log('MetaMask対応QR:', metamaskQR);
```

## 🌐 対応ネットワーク

### ネットワーク指定値

| ネットワーク | 指定値 | ChainID | 用途 |
|-------------|--------|---------|------|
| Ethereum Mainnet | `"ethereum"` | 1 | 本番環境 |
| Sepolia Testnet | `"sepolia"` | 11155111 | **推奨テスト環境** |
| Polygon Mainnet | `"polygon"` | 137 | 本番環境 |
| Polygon Amoy | `"polygon-amoy"` | 80002 | テスト環境 |
| Avalanche C-Chain | `"avalanche"` | 43114 | 本番環境 |
| Avalanche Fuji | `"avalanche-fuji"` | 43113 | テスト環境 |

### JPYCコントラクトアドレス

| ネットワーク | コントラクトアドレス |
|-------------|---------------------|
| Sepolia | `0xd3eF95d29A198868241FE374A999fc25F6152253` |
| Polygon | （要確認） |
| Avalanche | （要確認） |

## 💡 実装のベストプラクティス

### 1. 金額の単位

#### Wei単位（18桁）

```json
{
  "amount": "1000000000000000000"  // 1 JPYC = 10^18 Wei
}
```

#### JPYC単位

```json
{
  "amount": "100"  // 100 JPYC
}
```

### 2. 有効期限の設定

```javascript
// 1時間後に期限切れ
const expiresAt = Math.floor(Date.now() / 1000) + 3600;

// JSON形式での指定
{
  "expiresAt": 1732012800
}
```

### 3. エラーハンドリング

#### 必須フィールドの確認

```javascript
// 店舗QRコードの必須チェック
const requiredFields = ['shopWallet', 'amount', 'chainId', 'contractAddress'];
const isValid = requiredFields.every(field => qrData[field]);
```

#### アドレス形式の検証

```javascript
// 0xで始まる40文字のHex文字列
const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
```

## 🔍 パース動作の詳細

### パース優先順位

1. **JSON形式の検出** → `{`で始まる文字列
2. **URLスキーマの検出** → `ethereum:`, `jpyc:`, `payment:` など
3. **単純アドレス** → `0x`で始まる40文字

### 金額変換ロジック

```typescript
// Wei → JPYC変換
const jpycAmount = (BigInt(weiAmount) / BigInt(10 ** 18)).toString();

// JPYC → Wei変換
const weiAmount = (BigInt(jpycAmount) * BigInt(10 ** 18)).toString();
```

### ネットワーク自動判定

```typescript
// chainIdからネットワーク名を逆引き
function getNetworkFromChainId(chainId: number): NetworkType {
  const networkMap = {
    1: 'ethereum',
    11155111: 'sepolia',
    137: 'polygon',
    80002: 'polygon-amoy',
    43114: 'avalanche',
    43113: 'avalanche-fuji'
  };
  return networkMap[chainId];
}
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. 金額が0になる

**原因**: Wei単位とJPYC単位の混同

```json
// ❌ 間違い
{"amount": "100"}  // Wei単位として解釈される

// ✅ 正解
{"amount": "100000000000000000000"}  // 100 JPYC in Wei
```

#### 2. ネットワークが認識されない

**原因**: chainIdとnetworkの不整合

```json
// ❌ 間違い
{
  "network": "ethereum",
  "chainId": 11155111  // Sepoliaのchain ID
}

// ✅ 正解
{
  "network": "sepolia",
  "chainId": 11155111
}
```

#### 3. QRコードがパースされない

**原因**: JSON形式の構文エラー

```json
// ❌ 間違い
{
  "amount": 100,  // 文字列でない
  "shopWallet": 0x1234...  // クォートなし
}

// ✅ 正解
{
  "amount": "100",
  "shopWallet": "0x1234567890123456789012345678901234567890"
}
```

## 📝 実装例

### JavaScript/TypeScriptでの生成例（統一形式）

```typescript
interface Masaru21PaymentQRData {
  type: 'MASARU21_PAYMENT';
  to: string;
  amount: string;  // JPYC単位
  network: string;
  chainId: number;
  contractAddress: string;
  merchant: {
    name: string;
    id: string;
    description: string;
  };
  timestamp: number;
  expires: number;
}

// 統一masaru21決済QRコード生成
function generateMasaru21PaymentQR(params: {
  shopWallet: string;
  amountJPYC: number;
  shopName: string;
  description: string;
  network: 'ethereum' | 'sepolia' | 'polygon' | 'polygon-amoy' | 'avalanche' | 'avalanche-fuji';
}): string {
  
  // ネットワーク情報の自動設定
  const networkConfig = {
    'ethereum': { chainId: 1, contract: '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB' },
    'sepolia': { chainId: 11155111, contract: '0xd3eF95d29A198868241FE374A999fc25F6152253' },
    'polygon': { chainId: 137, contract: '0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c' },
    'polygon-amoy': { chainId: 80002, contract: '0x...' }, // 要設定
    'avalanche': { chainId: 43114, contract: '0x...' }, // 要設定
    'avalanche-fuji': { chainId: 43113, contract: '0x...' }, // 要設定
  };

  const config = networkConfig[params.network];
  
  const qrData: Masaru21PaymentQRData = {
    type: 'MASARU21_PAYMENT',  // 統一形式
    to: params.shopWallet,
    amount: params.amountJPYC.toString(),
    network: params.network,
    chainId: config.chainId,
    contractAddress: config.contract,
    merchant: {
      name: params.shopName,
      id: `shop_${Date.now()}`,
      description: params.description
    },
    timestamp: Math.floor(Date.now() / 1000),
    expires: Math.floor(Date.now() / 1000) + 3600 // 1時間後
  };
  
  return JSON.stringify(qrData);
}

// 使用例（テスト環境）
const sepoliaQR = generateMasaru21PaymentQR({
  shopWallet: '0x1234567890123456789012345678901234567890',
  amountJPYC: 100,
  shopName: 'テスト店舗',
  description: 'Sepolia決済',
  network: 'sepolia'
});

// 使用例（本番環境）
const mainnetQR = generateMasaru21PaymentQR({
  shopWallet: '0x1234567890123456789012345678901234567890',
  amountJPYC: 100,
  shopName: '本番店舗',
  description: 'Ethereum決済',
  network: 'ethereum'
});

// 使用例（Polygon本番）
const polygonQR = generateMasaru21PaymentQR({
  shopWallet: '0x1234567890123456789012345678901234567890',
  amountJPYC: 100,
  shopName: 'Polygon店舗',
  description: 'Polygon決済',
  network: 'polygon'
});

console.log('Sepolia QR:', sepoliaQR);
console.log('Mainnet QR:', mainnetQR);
console.log('Polygon QR:', polygonQR);
```

### Python実装例（統一形式）

```python
import json
import time
from typing import Dict, Any, Literal

NetworkType = Literal['ethereum', 'sepolia', 'polygon', 'polygon-amoy', 'avalanche', 'avalanche-fuji']

def generate_masaru21_payment_qr(
    shop_wallet: str,
    amount_jpyc: int,
    shop_name: str,
    description: str,
    network: NetworkType = 'sepolia'
) -> str:
    """統一masaru21決済用QRコードデータを生成"""
    
    # ネットワーク設定の自動選択
    network_config = {
        'ethereum': {'chainId': 1, 'contract': '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'},
        'sepolia': {'chainId': 11155111, 'contract': '0xd3eF95d29A198868241FE374A999fc25F6152253'},
        'polygon': {'chainId': 137, 'contract': '0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c'},
        'polygon-amoy': {'chainId': 80002, 'contract': '0x...'},  # 要設定
        'avalanche': {'chainId': 43114, 'contract': '0x...'},  # 要設定
        'avalanche-fuji': {'chainId': 43113, 'contract': '0x...'},  # 要設定
    }
    
    config = network_config[network]
    
    qr_data = {
        "type": "MASARU21_PAYMENT",  # 統一形式
        "to": shop_wallet,
        "amount": str(amount_jpyc),
        "network": network,
        "chainId": config['chainId'],
        "contractAddress": config['contract'],
        "merchant": {
            "name": shop_name,
            "id": f"shop_{int(time.time())}",
            "description": description
        },
        "timestamp": int(time.time()),
        "expires": int(time.time()) + 3600  # 1時間後
    }
    
    return json.dumps(qr_data, ensure_ascii=False)

# 使用例（テスト環境）
sepolia_qr = generate_masaru21_payment_qr(
    shop_wallet="0x1234567890123456789012345678901234567890",
    amount_jpyc=100,
    shop_name="テスト店舗",
    description="Sepolia決済",
    network="sepolia"
)

# 使用例（本番環境）
mainnet_qr = generate_masaru21_payment_qr(
    shop_wallet="0x1234567890123456789012345678901234567890",
    amount_jpyc=100,
    shop_name="本番店舗", 
    description="Ethereum決済",
    network="ethereum"
)

print("Sepolia QR:", sepolia_qr)
print("Mainnet QR:", mainnet_qr)
```

## 🎯 統一フォーマットのメリット

### ✅ 解決される問題

1. **テスト・本番の一貫性**: 同じフォーマットでテスト・本番を切り替え
2. **保守性向上**: 1つのフォーマットのみメンテナンス
3. **開発効率**: フォーマット判別ロジックの簡素化
4. **バグ削減**: 複数フォーマットによる処理ミスを防止

### 📊 統一後のフォーマット比較

| 従来 | 統一後 |
|------|--------|
| `JPYC_PAYMENT` (本番) | `MASARU21_PAYMENT` (全環境) |
| `tJPYC_PAYMENT` (テスト) | `MASARU21_PAYMENT` (全環境) |
| `payment` (店舗) | `payment` (互換性維持) |

### 🚀 移行ガイド

#### 店舗側での変更例

```javascript
// ❌ 従来（環境別フォーマット）
const testQR = {type: "tJPYC_PAYMENT", network: "avalanche-fuji", ...};
const prodQR = {type: "JPYC_PAYMENT", network: "ethereum", ...};

// ✅ 統一後
const anyQR = {type: "MASARU21_PAYMENT", network: "sepolia", ...}; // テスト
const anyQR2 = {type: "MASARU21_PAYMENT", network: "ethereum", ...}; // 本番
```

---

## 📞 サポート

### 技術サポート

QRコード形式に関するご質問や問題が発生した場合：

- **GitHub Issues**: [SBT-JPYC-QR-Scanner/issues](https://github.com/miracle777/SBT-JPYC-QR-Scanner/issues)
- **X (Twitter)**: [@masaru21](https://x.com/masaru21)

### 更新履歴

| 日付 | バージョン | 変更内容 |
|------|------------|----------|
| 2025-11-18 | 1.1.0 | 初版作成、全フォーマット統合 |

---

**© 2025 SBT-JPYC-QR-Scanner Project**