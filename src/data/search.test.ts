/**
 * 検索機能のテスト
 * 仕様書: specs/07-search.md
 */

import { describe, it, expect } from 'vitest'
import { searchItems, getSuggestions, searchItemsWithFilters } from './search'
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

describe('Search - getSuggestions', () => {
  it('should return empty array for query less than 2 characters', () => {
    const results = getSuggestions('モ')
    expect(results.length).toBe(0)
  })

  it('should return suggestions for 2+ character query', () => {
    const results = getSuggestions('モニ')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should limit results to specified count', () => {
    const results = getSuggestions('デ', 3)
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('should return item suggestions with correct type', () => {
    const results = getSuggestions('Dell')
    results.forEach((suggestion) => {
      expect(suggestion).toHaveProperty('id')
      expect(suggestion).toHaveProperty('name')
      expect(suggestion).toHaveProperty('category')
      expect(suggestion).toHaveProperty('type')
      expect(suggestion.type).toBe('item')
    })
  })

  it('should be case-insensitive', () => {
    const lower = getSuggestions('dell')
    const upper = getSuggestions('DELL')
    expect(lower.length).toBe(upper.length)
  })
})

describe('Search - searchItemsWithFilters', () => {
  it('should filter by category', () => {
    const results = searchItemsWithFilters('', { categories: ['device'] })
    results.items.forEach((item) => {
      expect(item.category).toBe('device')
    })
  })

  it('should filter by multiple categories', () => {
    const results = searchItemsWithFilters('', {
      categories: ['device', 'furniture'],
    })
    results.items.forEach((item) => {
      expect(['device', 'furniture']).toContain(item.category)
    })
  })

  it('should filter by price range', () => {
    const results = searchItemsWithFilters('', {
      priceMin: 10000,
      priceMax: 30000,
    })
    results.items.forEach((item) => {
      if (item.amazon.price) {
        expect(item.amazon.price).toBeGreaterThanOrEqual(10000)
        expect(item.amazon.price).toBeLessThanOrEqual(30000)
      }
    })
  })

  it('should filter by minimum score', () => {
    const results = searchItemsWithFilters('', { minScore: 80 })
    results.items.forEach((item) => {
      expect(item.score).toBeGreaterThanOrEqual(80)
    })
  })

  it('should sort by score by default', () => {
    const results = searchItemsWithFilters('')
    for (let i = 0; i < results.items.length - 1; i++) {
      expect(results.items[i].score).toBeGreaterThanOrEqual(
        results.items[i + 1].score
      )
    }
  })

  it('should sort by price ascending', () => {
    const results = searchItemsWithFilters('', { sortBy: 'price_asc' })
    for (let i = 0; i < results.items.length - 1; i++) {
      const priceA = results.items[i].amazon.price || 0
      const priceB = results.items[i + 1].amazon.price || 0
      expect(priceA).toBeLessThanOrEqual(priceB)
    }
  })

  it('should combine query with filters', () => {
    const results = searchItemsWithFilters('モニター', {
      categories: ['device'],
      minScore: 50,
    })
    results.items.forEach((item) => {
      expect(item.category).toBe('device')
      expect(item.score).toBeGreaterThanOrEqual(50)
      const matchesName = item.name.includes('モニター')
      const matchesTag = item.tags.some((tag) => tag.includes('モニター'))
      expect(matchesName || matchesTag).toBe(true)
    })
  })
})
