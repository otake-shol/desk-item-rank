/**
 * アイテム型定義
 * 仕様書: specs/04-static-data.md
 */

import { CategoryId } from './category'

export interface AmazonInfo {
  asin: string
  url: string
  affiliateUrl: string
  price?: number
  priceUpdatedAt?: string
}

export interface SocialScore {
  twitter: number
  youtube: number
  amazon: number
}

/**
 * メディア参照（YouTube動画など）
 */
export interface MediaReference {
  type: 'youtube'
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  publishedAt: string
  viewCount?: number
}

/**
 * アイテムのステータス
 * - active: 通常表示
 * - hidden: 非表示（管理者が除外）
 * - pending: 審査待ち（自動発見後の未確認状態）
 */
export type ItemStatus = 'active' | 'hidden' | 'pending'

export interface Item {
  id: string
  name: string
  nameEn?: string
  description: string
  shortDescription: string
  imageUrl: string
  images?: string[]
  category: CategoryId
  subCategory: string
  score: number
  rank?: number
  socialScore?: SocialScore
  amazon: AmazonInfo
  tags: string[]
  brand?: string
  releaseDate?: string
  featured: boolean
  createdAt: string
  updatedAt: string
  mediaReferences?: MediaReference[]
  /** アイテムの表示ステータス（デフォルト: active） */
  status?: ItemStatus
  /** 手動でスコアを上書きする場合の値（nullで自動計算） */
  scoreOverride?: number | null
  /** 管理者が確認した日付 */
  curatedAt?: string | null
}
