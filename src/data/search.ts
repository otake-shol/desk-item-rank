/**
 * 検索機能
 * 仕様書: specs/07-search.md, specs/08-search-enhancement.md
 */

import { Item } from '@/types'
import { CategoryId } from '@/types/category'
import { getAllItems, getAllCategories } from './index'

const MAX_QUERY_LENGTH = 100
const MIN_SUGGESTION_QUERY_LENGTH = 2

/**
 * アイテムを検索する
 * - 名前とタグを対象に検索
 * - 大文字/小文字を区別しない
 * - 結果はスコア順で返す
 *
 * @param query 検索キーワード
 * @returns 検索結果（スコア順）
 */
export function searchItems(query: string): Item[] {
  // クエリを正規化（小文字化、トリム、長さ制限）
  const normalizedQuery = query
    .toLowerCase()
    .trim()
    .slice(0, MAX_QUERY_LENGTH)

  // 空のクエリは全件返す
  if (!normalizedQuery) {
    return getAllItems().sort((a, b) => b.score - a.score)
  }

  // 名前またはタグにマッチするアイテムをフィルタ
  const results = getAllItems().filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(normalizedQuery)
    const tagMatch = item.tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    )
    return nameMatch || tagMatch
  })

  // スコア順でソート
  return results.sort((a, b) => b.score - a.score)
}

/**
 * 検索結果の総数を含めて返す
 * @param query 検索キーワード
 */
export function searchItemsWithCount(query: string): {
  items: Item[]
  totalCount: number
} {
  const items = searchItems(query)
  return {
    items,
    totalCount: items.length,
  }
}

/**
 * サジェスト用アイテム型
 */
export interface SuggestionItem {
  id: string
  name: string
  category: string
  type: 'item' | 'category' | 'tag'
}

/**
 * 検索サジェストを取得
 * 2文字以上の入力で発火
 *
 * @param query 検索キーワード
 * @param limit 最大件数（デフォルト: 5）
 */
export function getSuggestions(query: string, limit: number = 5): SuggestionItem[] {
  const normalizedQuery = query.toLowerCase().trim()

  // 2文字未満は空配列を返す
  if (normalizedQuery.length < MIN_SUGGESTION_QUERY_LENGTH) {
    return []
  }

  const items = getAllItems()
  const categories = getAllCategories()

  const suggestions: SuggestionItem[] = []

  // アイテム名でマッチするものを追加
  for (const item of items) {
    if (suggestions.length >= limit) break

    const nameMatch = item.name.toLowerCase().includes(normalizedQuery)
    const tagMatch = item.tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    )

    if (nameMatch || tagMatch) {
      const category = categories.find((c) => c.id === item.category)
      suggestions.push({
        id: item.id,
        name: item.name,
        category: category?.name || item.category,
        type: 'item',
      })
    }
  }

  return suggestions
}

/**
 * フィルター付き検索オプション
 */
export interface SearchFilters {
  categories?: CategoryId[]
  priceMin?: number
  priceMax?: number
  minScore?: number
  sortBy?: 'relevance' | 'score' | 'price_asc' | 'price_desc' | 'newest'
}

/**
 * フィルター付き検索
 *
 * @param query 検索キーワード
 * @param filters フィルターオプション
 */
export function searchItemsWithFilters(
  query: string,
  filters: SearchFilters = {}
): { items: Item[]; totalCount: number } {
  const { categories, priceMin, priceMax, minScore, sortBy = 'score' } = filters

  // まず検索結果を取得
  let items = searchItems(query)

  // カテゴリフィルター
  if (categories && categories.length > 0) {
    items = items.filter((item) => categories.includes(item.category))
  }

  // 価格フィルター
  if (priceMin !== undefined) {
    items = items.filter((item) => (item.amazon.price || 0) >= priceMin)
  }
  if (priceMax !== undefined) {
    items = items.filter((item) => (item.amazon.price || 0) <= priceMax)
  }

  // スコアフィルター
  if (minScore !== undefined) {
    items = items.filter((item) => item.score >= minScore)
  }

  // ソート
  switch (sortBy) {
    case 'price_asc':
      items.sort((a, b) => (a.amazon.price || 0) - (b.amazon.price || 0))
      break
    case 'price_desc':
      items.sort((a, b) => (b.amazon.price || 0) - (a.amazon.price || 0))
      break
    case 'newest':
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      break
    case 'relevance':
    case 'score':
    default:
      // 既にスコア順でソート済み
      break
  }

  return {
    items,
    totalCount: items.length,
  }
}
