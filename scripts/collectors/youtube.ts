/**
 * YouTube Data API連携
 * 仕様書: specs/05-data-collection.md
 */

export interface YouTubeSearchResult {
  videoCount: number
  totalViews: number
  totalLikes: number
  totalComments: number
}

/**
 * 動画詳細情報（MediaReference用）
 */
export interface YouTubeVideoDetail {
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  publishedAt: string
  viewCount: number
}

/**
 * YouTube APIで検索
 * 環境変数: YOUTUBE_API_KEY
 */
export async function searchYouTube(
  query: string,
  maxResults: number = 10
): Promise<YouTubeSearchResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY is not set. Using mock data.')
    return generateMockYouTubeResult()
  }

  try {
    // 検索APIでビデオIDを取得
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'id')
    searchUrl.searchParams.set('q', `${query} レビュー`)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', String(maxResults))
    searchUrl.searchParams.set('order', 'viewCount')
    searchUrl.searchParams.set('publishedAfter', getDateMonthsAgo(1).toISOString())
    searchUrl.searchParams.set('key', apiKey)

    const searchResponse = await fetch(searchUrl.toString())
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.statusText}`)
    }

    const searchData = await searchResponse.json()
    const videoIds = searchData.items?.map((item: { id: { videoId: string } }) => item.id.videoId) || []

    if (videoIds.length === 0) {
      return { videoCount: 0, totalViews: 0, totalLikes: 0, totalComments: 0 }
    }

    // 動画統計を取得
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    statsUrl.searchParams.set('part', 'statistics')
    statsUrl.searchParams.set('id', videoIds.join(','))
    statsUrl.searchParams.set('key', apiKey)

    const statsResponse = await fetch(statsUrl.toString())
    if (!statsResponse.ok) {
      throw new Error(`YouTube API error: ${statsResponse.statusText}`)
    }

    const statsData = await statsResponse.json()

    let totalViews = 0
    let totalLikes = 0
    let totalComments = 0

    for (const video of statsData.items || []) {
      const stats = video.statistics
      totalViews += parseInt(stats.viewCount || '0', 10)
      totalLikes += parseInt(stats.likeCount || '0', 10)
      totalComments += parseInt(stats.commentCount || '0', 10)
    }

    return {
      videoCount: videoIds.length,
      totalViews,
      totalLikes,
      totalComments,
    }
  } catch (error) {
    console.error('YouTube API error:', error)
    return null
  }
}

/**
 * モックデータ生成
 */
function generateMockYouTubeResult(): YouTubeSearchResult {
  return {
    videoCount: Math.floor(Math.random() * 50) + 5,
    totalViews: Math.floor(Math.random() * 500000) + 10000,
    totalLikes: Math.floor(Math.random() * 20000) + 500,
    totalComments: Math.floor(Math.random() * 5000) + 100,
  }
}

function getDateMonthsAgo(months: number): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date
}

/**
 * 商品名でYouTube動画を検索し、詳細情報を取得
 * @param productName 商品名
 * @param maxResults 最大取得件数
 */
export async function searchYouTubeVideos(
  productName: string,
  maxResults: number = 5
): Promise<YouTubeVideoDetail[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY is not set. Skipping YouTube video search.')
    return []
  }

  try {
    // 検索APIでビデオIDを取得
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'id')
    searchUrl.searchParams.set('q', `${productName} レビュー`)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', String(maxResults))
    searchUrl.searchParams.set('order', 'viewCount')
    searchUrl.searchParams.set('relevanceLanguage', 'ja')
    searchUrl.searchParams.set('key', apiKey)

    const searchResponse = await fetch(searchUrl.toString())
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.statusText}`)
    }

    const searchData = await searchResponse.json()
    const videoIds = searchData.items?.map((item: { id: { videoId: string } }) => item.id.videoId) || []

    if (videoIds.length === 0) {
      return []
    }

    // 動画詳細を取得（snippet + statistics）
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    detailsUrl.searchParams.set('part', 'snippet,statistics')
    detailsUrl.searchParams.set('id', videoIds.join(','))
    detailsUrl.searchParams.set('key', apiKey)

    const detailsResponse = await fetch(detailsUrl.toString())
    if (!detailsResponse.ok) {
      throw new Error(`YouTube API error: ${detailsResponse.statusText}`)
    }

    const detailsData = await detailsResponse.json()

    const videos: YouTubeVideoDetail[] = []
    for (const video of detailsData.items || []) {
      const snippet = video.snippet
      const statistics = video.statistics

      videos.push({
        videoId: video.id,
        title: snippet.title,
        channelName: snippet.channelTitle,
        thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        publishedAt: snippet.publishedAt,
        viewCount: parseInt(statistics?.viewCount || '0', 10),
      })
    }

    return videos
  } catch (error) {
    console.error('YouTube API error:', error)
    return []
  }
}
