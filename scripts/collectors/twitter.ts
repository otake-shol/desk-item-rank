/**
 * Twitter/X API連携（将来実装用）
 * 仕様書: specs/05-data-collection.md
 */

export interface TwitterSearchResult {
  tweetCount: number
  totalLikes: number
  totalRetweets: number
  totalReplies: number
}

/**
 * Twitter APIで検索
 * 環境変数: TWITTER_BEARER_TOKEN
 */
export async function searchTwitter(
  query: string,
  maxResults: number = 100
): Promise<TwitterSearchResult | null> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN

  if (!bearerToken) {
    console.warn('TWITTER_BEARER_TOKEN is not set. Using mock data.')
    return generateMockTwitterResult()
  }

  try {
    const url = new URL('https://api.twitter.com/2/tweets/search/recent')
    url.searchParams.set('query', `${query} -is:retweet lang:ja`)
    url.searchParams.set('max_results', String(Math.min(maxResults, 100)))
    url.searchParams.set('tweet.fields', 'public_metrics')

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`)
    }

    const data = await response.json()
    const tweets = data.data || []

    let totalLikes = 0
    let totalRetweets = 0
    let totalReplies = 0

    for (const tweet of tweets) {
      const metrics = tweet.public_metrics || {}
      totalLikes += metrics.like_count || 0
      totalRetweets += metrics.retweet_count || 0
      totalReplies += metrics.reply_count || 0
    }

    return {
      tweetCount: tweets.length,
      totalLikes,
      totalRetweets,
      totalReplies,
    }
  } catch (error) {
    console.error('Twitter API error:', error)
    return null
  }
}

/**
 * モックデータ生成
 */
function generateMockTwitterResult(): TwitterSearchResult {
  return {
    tweetCount: Math.floor(Math.random() * 500) + 10,
    totalLikes: Math.floor(Math.random() * 5000) + 100,
    totalRetweets: Math.floor(Math.random() * 1000) + 20,
    totalReplies: Math.floor(Math.random() * 500) + 10,
  }
}
