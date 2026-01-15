# 商品画像の管理ガイド

## 現状

| 商品名 | 画像ソース | ステータス |
|--------|-----------|-----------|
| HHKB Professional HYBRID Type-S | Amazon | ✅ 正規 |
| エルゴトロン LX デスクマウントアーム | Amazon | ✅ 正規 |
| その他8件 | Unsplash | ⚠️ プレースホルダー |

---

## 方法1: 手動でAmazon画像URLを取得（推奨）

最も確実な方法です。

### 手順

1. **Amazonで商品ページを開く**
   ```
   https://www.amazon.co.jp/dp/{ASIN}
   ```

2. **商品画像を右クリック → 「画像アドレスをコピー」**

3. **`src/data/items.json` を編集**
   ```json
   {
     "id": "monitor-dell-u2723qe",
     "imageUrl": "https://m.media-amazon.com/images/I/XXXXXX.jpg",
     ...
   }
   ```

### 取得すべき商品（Unsplash使用中）

| 商品ID | ASIN | Amazonリンク |
|--------|------|--------------|
| monitor-dell-u2723qe | B09V3JGWJ7 | [リンク](https://www.amazon.co.jp/dp/B09V3JGWJ7) |
| mouse-logicool-mx-master3s | B0B19VC66B | [リンク](https://www.amazon.co.jp/dp/B0B19VC66B) |
| headphone-sony-wh1000xm5 | B0B1FDNW8L | [リンク](https://www.amazon.co.jp/dp/B0B1FDNW8L) |
| desk-flexispot-e7 | B08H1XQKW7 | [リンク](https://www.amazon.co.jp/dp/B08H1XQKW7) |
| chair-ergohuman-pro | B00B6IVSTA | [リンク](https://www.amazon.co.jp/dp/B00B6IVSTA) |
| desk-light-benq-screenbar | B07PJ1BMPL | [リンク](https://www.amazon.co.jp/dp/B07PJ1BMPL) |
| desk-mat-grovemade | B08QS64X7J | [リンク](https://www.amazon.co.jp/dp/B08QS64X7J) |
| ambient-light-philips-hue | B07GXBYYKK | [リンク](https://www.amazon.co.jp/dp/B07GXBYYKK) |

---

## 方法2: 画像をローカルにダウンロードして配置

アフィリエイト規約上最も安全な方法です。

### 手順

1. **Amazonから画像をダウンロード**
   - 商品ページで画像を右クリック → 「名前を付けて保存」

2. **`public/images/items/` に配置**
   ```
   public/images/items/
   ├── dell-u2723qe.jpg
   ├── hhkb-hybrid.jpg
   └── ...
   ```

3. **`src/data/items.json` を編集**
   ```json
   {
     "imageUrl": "/images/items/dell-u2723qe.jpg",
     ...
   }
   ```

### 画像の最適化（推奨）

```bash
# ImageMagickで一括リサイズ
for f in public/images/items/*.jpg; do
  convert "$f" -resize 400x300^ -gravity center -extent 400x300 "$f"
done
```

---

## 方法3: Amazon PA-API を使用（大規模サイト向け）

公式APIで商品情報・画像を取得します。

### 必要なもの

1. **Amazonアソシエイト アカウント**（承認済み）
2. **PA-API アクセスキー**
   - [Amazon Product Advertising API](https://affiliate.amazon.co.jp/assoc_credentials/home)

### セットアップ

```bash
npm install amazon-paapi
```

### 使用例

```typescript
import amazonPaapi from 'amazon-paapi'

const commonParameters = {
  AccessKey: process.env.AMAZON_ACCESS_KEY,
  SecretKey: process.env.AMAZON_SECRET_KEY,
  PartnerTag: 'deskitemrank-22',
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.co.jp',
}

const result = await amazonPaapi.GetItems(commonParameters, {
  ItemIds: ['B09V3JGWJ7'],
  Resources: ['Images.Primary.Large'],
})

const imageUrl = result.ItemsResult.Items[0].Images.Primary.Large.URL
```

### 注意点

- 初回売上発生後30日でAPIアクセス可能
- リクエスト制限: 1秒1リクエスト
- 画像URLは24時間で期限切れ（キャッシュ必要）

---

## 方法4: スクリプトでOGP画像を再取得

`scripts/fetch-amazon-images.ts` を再実行します。

```bash
npx tsx scripts/fetch-amazon-images.ts
```

※Amazonのボット検出により失敗する場合があります

---

## 推奨ワークフロー

### 今すぐ対応（10分）

1. 上記8商品のAmazonページを開く
2. 画像URLを手動でコピー
3. `items.json` を更新

### 将来的な自動化

1. PA-APIの承認を取得
2. 画像取得スクリプトを実装
3. 定期的に画像URLを更新するCronジョブを設定

---

## トラブルシューティング

### 画像が表示されない

1. **URLが有効か確認**
   ```bash
   curl -I "画像URL"
   ```

2. **CORSエラーの場合**
   - 画像をローカルにダウンロードして配置

3. **画像が小さい/ぼやける**
   - URLの `_SX300_` を `_SL1500_` に変更して高解像度版を取得
