# カテゴリページ仕様書

## ステータス: Draft

## 概要
カテゴリ別のアイテム一覧ページ。各カテゴリ（デバイス、家具、照明・インテリア）ごとにアイテムをランキング表示する。

## URL
`/category/[categoryId]`

例:
- `/category/device` - デバイスカテゴリ
- `/category/furniture` - 家具カテゴリ
- `/category/lighting` - 照明・インテリアカテゴリ

## ページ構成

### 1. ヘッダー（共通）
- 検索ボックス付きヘッダー

### 2. カテゴリヘッダー
- カテゴリ名（大見出し）
- カテゴリ説明文
- アイテム総数

### 3. サブカテゴリフィルター
- サブカテゴリでフィルタリング可能
- 例: デバイス → モニター / キーボード / マウス / その他

### 4. ソートオプション
- スコア順（デフォルト）
- 新着順
- 価格順（低→高）
- 価格順（高→低）

### 5. アイテム一覧
- グリッドレイアウト（4列）
- RankingCardコンポーネント使用
- ランキング番号を表示

### 6. フッター（共通）

## データ取得

### 入力
- `categoryId`: string - カテゴリID

### 出力
```typescript
interface CategoryPageData {
  category: Category
  items: Item[]
  subCategories: string[]
  totalCount: number
}
```

## 受け入れ条件

### Given-When-Then

```gherkin
Scenario: カテゴリページ表示
  Given ユーザーが /category/device にアクセスする
  When ページが読み込まれる
  Then デバイスカテゴリのアイテムがスコア順で表示される
  And カテゴリ名「デバイス」が表示される
  And アイテム総数が表示される

Scenario: 存在しないカテゴリ
  Given ユーザーが /category/invalid にアクセスする
  When ページが読み込まれる
  Then 404ページが表示される

Scenario: サブカテゴリフィルター
  Given ユーザーがデバイスカテゴリページにいる
  When 「モニター」サブカテゴリを選択する
  Then モニターのみが表示される

Scenario: ソート切り替え
  Given ユーザーがカテゴリページにいる
  When 「新着順」を選択する
  Then アイテムが作成日の新しい順で並び替わる
```

## テストケース

### データ取得テスト
1. `getItemsByCategory('device')` が正しいアイテムを返す
2. `getItemsByCategory('invalid')` が空配列を返す
3. サブカテゴリフィルターが正しく動作する
4. ソートが正しく動作する

### ページテスト
1. カテゴリ名が正しく表示される
2. アイテム数が正しく表示される
3. 404ページが正しく表示される（無効なカテゴリ）

## 実装ファイル

- `src/app/category/[id]/page.tsx` - カテゴリページ
- `src/data/index.ts` - `getItemsByCategory()` 追加
- `src/components/ui/SortSelect.tsx` - ソートセレクト
- `src/components/ui/SubCategoryFilter.tsx` - サブカテゴリフィルター
