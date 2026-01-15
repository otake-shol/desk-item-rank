# 検索機能強化仕様書

## ステータス: Draft

## 概要
検索機能にサジェスト（オートコンプリート）とフィルタリング機能を追加し、ユーザビリティを向上させる。

## 機能一覧

### 1. 検索サジェスト（オートコンプリート）

#### 動作仕様
- 入力文字数: 2文字以上で発火
- 遅延: 300ms（デバウンス）
- 最大表示件数: 5件
- 表示内容: アイテム名 + カテゴリ

#### UI
- 検索ボックス下にドロップダウン表示
- キーボードナビゲーション対応（上下キー、Enter）
- クリックまたはEnterで選択 → 詳細ページへ遷移

### 2. 検索フィルター

#### フィルター項目
- カテゴリ（複数選択可）
- 価格帯
  - ~10,000円
  - 10,000~30,000円
  - 30,000~50,000円
  - 50,000円~
- スコア
  - 80以上
  - 60以上
  - 全て

#### UI
- 検索結果ページのサイドバーに配置
- モバイルではフィルターボタン → モーダル表示

### 3. 検索結果のソート
- 関連度順（デフォルト）
- スコア順
- 価格順（低→高 / 高→低）
- 新着順

## API設計

### サジェストAPI
```typescript
// src/data/search.ts
export function getSuggestions(query: string, limit?: number): SuggestionItem[]

interface SuggestionItem {
  id: string
  name: string
  category: string
  type: 'item' | 'category' | 'tag'
}
```

### フィルター付き検索
```typescript
interface SearchFilters {
  categories?: CategoryId[]
  priceMin?: number
  priceMax?: number
  minScore?: number
  sortBy?: 'relevance' | 'score' | 'price_asc' | 'price_desc' | 'newest'
}

export function searchItemsWithFilters(
  query: string,
  filters: SearchFilters
): Item[]
```

## 受け入れ条件

### Given-When-Then

```gherkin
Scenario: サジェスト表示
  Given ユーザーが検索ボックスにフォーカスしている
  When 「モニ」と入力する
  Then 「モニター」を含むアイテムがサジェストされる
  And 300ms後に表示される

Scenario: サジェストからの遷移
  Given サジェストが表示されている
  When サジェスト項目をクリックする
  Then そのアイテムの詳細ページに遷移する

Scenario: フィルター適用
  Given 検索結果ページを表示している
  When 「デバイス」カテゴリでフィルターする
  Then デバイスカテゴリのアイテムのみ表示される

Scenario: 複数フィルター組み合わせ
  Given 検索結果ページを表示している
  When カテゴリ「デバイス」と価格「~30,000円」を選択する
  Then 両条件を満たすアイテムのみ表示される

Scenario: キーボードナビゲーション
  Given サジェストが表示されている
  When 下キーを押す
  Then 次のサジェスト項目がハイライトされる
  When Enterを押す
  Then ハイライト中のアイテムページに遷移する
```

## テストケース

### サジェストテスト
1. 2文字以上で `getSuggestions()` が結果を返す
2. 1文字では空配列を返す
3. 結果が5件以下である
4. クエリに部分一致するアイテムが返る

### フィルターテスト
1. カテゴリフィルターが正しく動作する
2. 価格フィルターが正しく動作する
3. 複数フィルターの組み合わせが正しく動作する
4. ソートが正しく動作する

## 実装ファイル

### 新規作成
- `src/components/ui/SearchSuggestions.tsx` - サジェストUI
- `src/components/ui/SearchFilters.tsx` - フィルターUI
- `src/hooks/useDebounce.ts` - デバウンスフック

### 更新
- `src/data/search.ts` - `getSuggestions()`, `searchItemsWithFilters()` 追加
- `src/components/ui/SearchBox.tsx` - サジェスト統合
- `src/app/search/page.tsx` - フィルター統合
