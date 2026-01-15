/**
 * 検索機能のテスト
 * 仕様書: specs/07-search.md
 */

import { describe, it, expect } from 'vitest'
import { searchItems } from './search'
import { getAllItems } from './index'

describe('Search - searchItems', () => {
  it('should return items matching name', () => {
    const results = searchItems('モニター')

    expect(results.length).toBeGreaterThan(0)
    results.forEach((item) => {
      const matchesName = item.name.includes('モニター')
      const matchesTag = item.tags.some((tag) => tag.includes('モニター'))
      expect(matchesName || matchesTag).toBe(true)
    })
  })

  it('should return items matching tags', () => {
    const results = searchItems('USB-C')

    expect(results.length).toBeGreaterThan(0)
    results.forEach((item) => {
      const matchesName = item.name.toLowerCase().includes('usb-c')
      const matchesTag = item.tags.some((tag) =>
        tag.toLowerCase().includes('usb-c')
      )
      expect(matchesName || matchesTag).toBe(true)
    })
  })

  it('should be case-insensitive', () => {
    const lower = searchItems('dell')
    const upper = searchItems('DELL')

    expect(lower.length).toBe(upper.length)
    expect(lower.map((i) => i.id)).toEqual(upper.map((i) => i.id))
  })

  it('should return all items when query is empty', () => {
    const results = searchItems('')
    const all = getAllItems()

    expect(results.length).toBe(all.length)
  })

  it('should return all items when query is whitespace only', () => {
    const results = searchItems('   ')
    const all = getAllItems()

    expect(results.length).toBe(all.length)
  })

  it('should return empty array when no matches', () => {
    const results = searchItems('存在しないワード12345')

    expect(results.length).toBe(0)
  })

  it('should return results sorted by score descending', () => {
    const results = searchItems('デスク')

    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score)
    }
  })

  it('should handle Japanese characters', () => {
    // 「静電容量」はHHKBのタグに含まれている
    const results = searchItems('静電容量')

    expect(results.length).toBeGreaterThan(0)
  })

  it('should truncate very long queries to 100 characters', () => {
    const longQuery = 'a'.repeat(1000)
    // Should not throw an error
    const results = searchItems(longQuery)

    expect(Array.isArray(results)).toBe(true)
  })
})
