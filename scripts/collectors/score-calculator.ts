/**
 * スコア算出ロジック
 * 仕様書: specs/05-data-collection.md
 */

export interface ScoreFactors {
  twitterMentions: number
  twitterEngagement: number
  youtubeViews: number
  youtubeEngagement: number
}

export interface NormalizedFactors {
  twitterMentions: number
  twitterEngagement: number
  youtubeViews: number
  youtubeEngagement: number
}

// 正規化の基準値（これらの値が1.0に相当）
const NORMALIZATION_BASE = {
  twitterMentions: 1000, // 1000ツイートが最高
  twitterEngagement: 5000, // 5000エンゲージメントが最高
  youtubeViews: 100000, // 10万再生が最高
  youtubeEngagement: 10000, // 1万エンゲージメントが最高
}

/**
 * 各ファクターを0-1の範囲に正規化
 */
export function normalizeFactors(factors: ScoreFactors): NormalizedFactors {
  return {
    twitterMentions: Math.min(factors.twitterMentions / NORMALIZATION_BASE.twitterMentions, 1),
    twitterEngagement: Math.min(factors.twitterEngagement / NORMALIZATION_BASE.twitterEngagement, 1),
    youtubeViews: Math.min(factors.youtubeViews / NORMALIZATION_BASE.youtubeViews, 1),
    youtubeEngagement: Math.min(factors.youtubeEngagement / NORMALIZATION_BASE.youtubeEngagement, 1),
  }
}

/**
 * スコアを算出（0-100の範囲）
 *
 * 重み付け:
 * - Twitterメンション数: 30%
 * - Twitterエンゲージメント: 20%
 * - YouTube再生数: 30%
 * - YouTubeエンゲージメント: 20%
 */
export function calculateScore(factors: ScoreFactors): number {
  const normalized = normalizeFactors(factors)

  const rawScore =
    normalized.twitterMentions * 0.3 +
    normalized.twitterEngagement * 0.2 +
    normalized.youtubeViews * 0.3 +
    normalized.youtubeEngagement * 0.2

  // 0-100にスケール
  return Math.round(rawScore * 100)
}

/**
 * モックデータを生成（開発・テスト用）
 */
export function generateMockFactors(): ScoreFactors {
  return {
    twitterMentions: Math.floor(Math.random() * 2000),
    twitterEngagement: Math.floor(Math.random() * 8000),
    youtubeViews: Math.floor(Math.random() * 200000),
    youtubeEngagement: Math.floor(Math.random() * 15000),
  }
}

/**
 * SocialScoreオブジェクトからスコアファクターを生成
 */
export function socialScoreToFactors(socialScore: {
  twitter: number
  youtube: number
  amazon: number
}): ScoreFactors {
  // SocialScoreは既に0-100のスコアなので、逆算してファクターに変換
  return {
    twitterMentions: (socialScore.twitter / 100) * NORMALIZATION_BASE.twitterMentions,
    twitterEngagement: (socialScore.twitter / 100) * NORMALIZATION_BASE.twitterEngagement,
    youtubeViews: (socialScore.youtube / 100) * NORMALIZATION_BASE.youtubeViews,
    youtubeEngagement: (socialScore.youtube / 100) * NORMALIZATION_BASE.youtubeEngagement,
  }
}
