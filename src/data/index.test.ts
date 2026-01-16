/**
 * データ取得関数のテスト
 * 仕様書: specs/04-static-data.md
 *
 * このテストは実装より先に書かれています（テストファースト）
 */

import { describe, it, expect } from 'vitest'
import {
  getAllItems,
  getTopRanking,
  getTopByCategory,
  getFeaturedItems,
  getAllCategories,
  getItemById,
  getCategoryById,
  getItemsByCategory,
  getRelatedItems,
} from './index'
import { CategoryId } from '@/types/category'

describe('Static Data - getAllItems', () => {
  it('should return all items from JSON', () => {
    const items = getAllItems()
    expect(items.length).toBeGreaterThan(0)
  })

  it('should return items with required properties', () => {
    const items = getAllItems()
    const item = items[0]

    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('name')
    expect(item).toHaveProperty('category')
    expect(item).toHaveProperty('score')
    expect(item).toHaveProperty('amazon')
    expect(item.amazon).toHaveProperty('asin')
    expect(item.amazon).toHaveProperty('affiliateUrl')
  })
})

describe('Static Data - getTopRanking', () => {
  it('should return items sorted by score descending', () => {
    const ranking = getTopRanking(10)

    for (let i = 0; i < ranking.length - 1; i++) {
      expect(ranking[i].score).toBeGreaterThanOrEqual(ranking[i + 1].score)
    }
  })

  it('should assign correct rank numbers starting from 1', () => {
    const ranking = getTopRanking(10)

    ranking.forEach((item, index) => {
      expect(item.rank).toBe(index + 1)
    })
  })

  it('should respect the limit parameter', () => {
    const top5 = getTopRanking(5)
    const top3 = getTopRanking(3)

    expect(top5.length).toBeLessThanOrEqual(5)
    expect(top3.length).toBeLessThanOrEqual(3)
  })

  it('should default to 10 items when no limit is provided', () => {
    const ranking = getTopRanking()

    expect(ranking.length).toBeLessThanOrEqual(10)
  })
})

describe('Static Data - getTopByCategory', () => {
  it('should return only items from specified category', () => {
    const devices = getTopByCategory('device', 5)

    devices.forEach((item) => {
      expect(item.category).toBe('device')
    })
  })

  it('should sort items by score within category', () => {
    const furniture = getTopByCategory('furniture', 5)

    for (let i = 0; i < furniture.length - 1; i++) {
      expect(furniture[i].score).toBeGreaterThanOrEqual(furniture[i + 1].score)
    }
  })

  it('should assign rank numbers within category', () => {
    const lighting = getTopByCategory('lighting', 3)

    lighting.forEach((item, index) => {
      expect(item.rank).toBe(index + 1)
    })
  })
})

describe('Static Data - getFeaturedItems', () => {
  it('should return only featured items', () => {
    const featured = getFeaturedItems()

    featured.forEach((item) => {
      expect(item.featured).toBe(true)
    })
  })
})

describe('Static Data - getAllCategories', () => {
  it('should return all categories', () => {
    const categories = getAllCategories()

    expect(categories.length).toBe(3) // device, furniture, lighting
  })

  it('should have required category properties', () => {
    const categories = getAllCategories()
    const category = categories[0]

    expect(category).toHaveProperty('id')
    expect(category).toHaveProperty('name')
    expect(category).toHaveProperty('subCategories')
    expect(Array.isArray(category.subCategories)).toBe(true)
  })
})

describe('Static Data - getItemById', () => {
  it('should return item by id', () => {
    const items = getAllItems()
    const firstItem = items[0]
    const found = getItemById(firstItem.id)

    expect(found).toBeDefined()
    expect(found?.id).toBe(firstItem.id)
  })

  it('should return undefined for non-existent id', () => {
    const found = getItemById('non-existent-id')

    expect(found).toBeUndefined()
  })
})

describe('Static Data - getCategoryById', () => {
  it('should return category by id', () => {
    const found = getCategoryById('device')

    expect(found).toBeDefined()
    expect(found?.id).toBe('device')
    expect(found?.name).toBe('デバイス')
  })

  it('should return undefined for non-existent id', () => {
    const found = getCategoryById('invalid' as CategoryId)

    expect(found).toBeUndefined()
  })
})

describe('Static Data - getItemsByCategory', () => {
  it('should return all items in category', () => {
    const result = getItemsByCategory('device')

    expect(result.items.length).toBeGreaterThan(0)
    result.items.forEach((item) => {
      expect(item.category).toBe('device')
    })
  })

  it('should include category info and subCategories', () => {
    const result = getItemsByCategory('device')

    expect(result.category).toBeDefined()
    expect(result.category?.id).toBe('device')
    expect(result.subCategories.length).toBeGreaterThan(0)
    expect(result.totalCount).toBe(result.items.length)
  })

  it('should filter by subCategory', () => {
    const result = getItemsByCategory('device', { subCategory: 'モニター' })

    result.items.forEach((item) => {
      expect(item.subCategory).toBe('モニター')
    })
  })

  it('should sort by score by default', () => {
    const result = getItemsByCategory('device')

    for (let i = 0; i < result.items.length - 1; i++) {
      expect(result.items[i].score).toBeGreaterThanOrEqual(result.items[i + 1].score)
    }
  })

  it('should sort by newest when specified', () => {
    const result = getItemsByCategory('device', { sortBy: 'newest' })

    for (let i = 0; i < result.items.length - 1; i++) {
      const current = new Date(result.items[i].createdAt).getTime()
      const next = new Date(result.items[i + 1].createdAt).getTime()
      expect(current).toBeGreaterThanOrEqual(next)
    }
  })

  it('should return empty for invalid category', () => {
    const result = getItemsByCategory('invalid' as CategoryId)

    expect(result.items.length).toBe(0)
    expect(result.category).toBeUndefined()
  })
})

describe('Static Data - getRelatedItems', () => {
  it('should return items from same category excluding current item', () => {
    const items = getAllItems()
    const currentItem = items[0]
    const related = getRelatedItems(currentItem.id, 3)

    expect(related.length).toBeLessThanOrEqual(3)
    related.forEach((item) => {
      expect(item.id).not.toBe(currentItem.id)
      expect(item.category).toBe(currentItem.category)
    })
  })

  it('should return empty array for invalid item', () => {
    const related = getRelatedItems('invalid-id', 3)

    expect(related.length).toBe(0)
  })

  it('should sort by score', () => {
    const items = getAllItems()
    const related = getRelatedItems(items[0].id, 5)

    for (let i = 0; i < related.length - 1; i++) {
      expect(related[i].score).toBeGreaterThanOrEqual(related[i + 1].score)
    }
  })
})
