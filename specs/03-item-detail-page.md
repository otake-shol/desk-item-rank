# アイテム詳細ページ仕様書

## ステータス: Draft

## 概要
個別アイテムの詳細情報を表示するページ。商品情報、スコア、Amazonリンク等を表示。

## URL
`/item/[itemId]`

例: `/item/dell-u2723qe`

## ページ構成

### 1. ヘッダー（共通）

### 2. パンくずリスト
`ホーム > カテゴリ名 > アイテム名`

### 3. アイテム詳細セクション

#### 左カラム（画像）
- メイン画像
- プレースホルダー対応

#### 右カラム（情報）
- アイテム名
- ランキング順位
- スコア（スター表示）
- カテゴリ / サブカテゴリ
- タグ一覧
- 価格
- **Amazonで見るボタン**（アフィリエイトリンク）

### 4. 詳細情報タブ
- 概要（将来的に追加）
- スペック（将来的に追加）

### 5. 関連アイテム
- 同じカテゴリの人気アイテム（3-4件）

### 6. フッター（共通）

## データ取得

### 入力
- `itemId`: string - アイテムID

### 出力
```typescript
interface ItemDetailPageData {
  item: Item
  relatedItems: Item[]
  category: Category
}
```

## 受け入れ条件

### Given-When-Then

```gherkin
Scenario: アイテム詳細表示
  Given ユーザーが /item/dell-u2723qe にアクセスする
  When ページが読み込まれる
  Then アイテム「Dell U2723QE」の詳細が表示される
  And Amazonリンクがアフィリエイトリンクになっている
  And 関連アイテムが表示される

Scenario: 存在しないアイテム
  Given ユーザーが /item/invalid-item にアクセスする
  When ページが読み込まれる
  Then 404ページが表示される

Scenario: Amazonリンククリック
  Given ユーザーがアイテム詳細ページにいる
  When 「Amazonで見る」ボタンをクリックする
  Then アフィリエイトリンク付きでAmazonに遷移する
```

## テストケース

### データ取得テスト
1. `getItemById('dell-u2723qe')` が正しいアイテムを返す
2. `getItemById('invalid')` が null を返す
3. `getRelatedItems(item)` が同カテゴリのアイテムを返す

### ページテスト
1. アイテム名が正しく表示される
2. アフィリエイトリンクが正しく生成される
3. 404ページが正しく表示される（無効なアイテム）
4. パンくずリストが正しく表示される

## 実装ファイル

- `src/app/item/[id]/page.tsx` - 詳細ページ
- `src/data/index.ts` - `getItemById()`, `getRelatedItems()` 追加
- `src/components/ui/Breadcrumb.tsx` - パンくずリスト
- `src/components/ui/StarRating.tsx` - スター評価
- `src/components/sections/RelatedItems.tsx` - 関連アイテム
