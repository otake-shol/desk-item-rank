/**
 * 検索機能
 * 仕様書: specs/07-search.md
 */

import { Item } from '@/types'
import { getAllItems } from './index'

const MAX_QUERY_LENGTH = 100

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
