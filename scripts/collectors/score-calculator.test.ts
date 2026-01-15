/**
 * スコア算出ロジックのテスト
 * 仕様書: specs/05-data-collection.md
 */

import { describe, it, expect } from 'vitest'
import {
  normalizeFactors,
  calculateScore,
  ScoreFactors,
} from './score-calculator'

describe('Score Calculator - normalizeFactors', () => {
  it('should normalize factors to 0-1 range', () => {
    const factors: ScoreFactors = {
      twitterMentions: 500,
      twitterEngagement: 2500,
      youtubeViews: 50000,
      youtubeEngagement: 5000,
    }

    const normalized = normalizeFactors(factors)

    expect(normalized.twitterMentions).toBe(0.5)
    expect(normalized.twitterEngagement).toBe(0.5)
    expect(normalized.youtubeViews).toBe(0.5)
    expect(normalized.youtubeEngagement).toBe(0.5)
  })

  it('should cap values at 1.0', () => {
    const factors: ScoreFactors = {
      twitterMentions: 5000, // 超過
      twitterEngagement: 10000, // 超過
      youtubeViews: 500000, // 超過
      youtubeEngagement: 50000, // 超過
    }

    const normalized = normalizeFactors(factors)

    expect(normalized.twitterMentions).toBe(1)
    expect(normalized.twitterEngagement).toBe(1)
    expect(normalized.youtubeViews).toBe(1)
    expect(normalized.youtubeEngagement).toBe(1)
  })

  it('should handle zero values', () => {
    const factors: ScoreFactors = {
      twitterMentions: 0,
      twitterEngagement: 0,
      youtubeViews: 0,
      youtubeEngagement: 0,
    }

    const normalized = normalizeFactors(factors)

    expect(normalized.twitterMentions).toBe(0)
    expect(normalized.twitterEngagement).toBe(0)
    expect(normalized.youtubeViews).toBe(0)
    expect(normalized.youtubeEngagement).toBe(0)
  })
})

describe('Score Calculator - calculateScore', () => {
  it('should return 0 for all zero factors', () => {
    const factors: ScoreFactors = {
      twitterMentions: 0,
      twitterEngagement: 0,
      youtubeViews: 0,
      youtubeEngagement: 0,
    }

    expect(calculateScore(factors)).toBe(0)
  })

  it('should return 100 for all max factors', () => {
    const factors: ScoreFactors = {
      twitterMentions: 1000,
      twitterEngagement: 5000,
      youtubeViews: 100000,
      youtubeEngagement: 10000,
    }

    expect(calculateScore(factors)).toBe(100)
  })

  it('should return 50 for half of max factors', () => {
    const factors: ScoreFactors = {
      twitterMentions: 500,
      twitterEngagement: 2500,
      youtubeViews: 50000,
      youtubeEngagement: 5000,
    }

    expect(calculateScore(factors)).toBe(50)
  })

  it('should apply correct weights', () => {
    // Only twitter mentions (30% weight)
    const twitterOnly: ScoreFactors = {
      twitterMentions: 1000,
      twitterEngagement: 0,
      youtubeViews: 0,
      youtubeEngagement: 0,
    }
    expect(calculateScore(twitterOnly)).toBe(30)

    // Only twitter engagement (20% weight)
    const engagementOnly: ScoreFactors = {
      twitterMentions: 0,
      twitterEngagement: 5000,
      youtubeViews: 0,
      youtubeEngagement: 0,
    }
    expect(calculateScore(engagementOnly)).toBe(20)

    // Only youtube views (30% weight)
    const youtubeOnly: ScoreFactors = {
      twitterMentions: 0,
      twitterEngagement: 0,
      youtubeViews: 100000,
      youtubeEngagement: 0,
    }
    expect(calculateScore(youtubeOnly)).toBe(30)

    // Only youtube engagement (20% weight)
    const ytEngagementOnly: ScoreFactors = {
      twitterMentions: 0,
      twitterEngagement: 0,
      youtubeViews: 0,
      youtubeEngagement: 10000,
    }
    expect(calculateScore(ytEngagementOnly)).toBe(20)
  })

  it('should return score in 0-100 range', () => {
    // Random test with very high values
    const highFactors: ScoreFactors = {
      twitterMentions: 10000,
      twitterEngagement: 50000,
      youtubeViews: 1000000,
      youtubeEngagement: 100000,
    }

    const score = calculateScore(highFactors)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})
