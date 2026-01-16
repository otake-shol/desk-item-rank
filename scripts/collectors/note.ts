/**
 * note.com デスクツアー記事コレクター
 * デスクツアー記事から商品の言及とスキ数を収集
 */

import { chromium } from 'playwright'

export interface NoteArticle {
  title: string
  url: string
  author: string
  likes: number
  date: string
}

export interface NoteData {
  articleCount: number
  totalLikes: number
  articles: NoteArticle[]
}

// 検索対象のタグ一覧（URLエンコード済み）
const TAG_URLS = [
  // メインキーワード
  'https://note.com/interests/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%84%E3%82%A2%E3%83%BC', // デスクツアー
  'https://note.com/interests/%E3%83%87%E3%82%B9%E3%82%AF%E7%92%B0%E5%A2%83', // デスク環境
  'https://note.com/interests/%E3%82%AC%E3%82%B8%E3%82%A7%E3%83%83%E3%83%88', // ガジェット
  'https://note.com/interests/%E3%83%AA%E3%83%A2%E3%83%BC%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF', // リモートワーク
  'https://note.com/interests/%E5%9C%A8%E5%AE%85%E3%83%AF%E3%83%BC%E3%82%AF', // 在宅ワーク
  'https://note.com/interests/%E3%83%9B%E3%83%BC%E3%83%A0%E3%82%AA%E3%83%95%E3%82%A3%E3%82%B9', // ホームオフィス
  'https://note.com/interests/%E4%BD%9C%E6%A5%AD%E7%92%B0%E5%A2%83', // 作業環境
  // 製品カテゴリ
  'https://note.com/interests/%E3%82%AD%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%89', // キーボード
  'https://note.com/interests/%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC', // モニター
  'https://note.com/interests/%E3%82%A4%E3%83%A4%E3%83%9B%E3%83%B3', // イヤホン
  'https://note.com/interests/%E3%83%98%E3%83%83%E3%83%89%E3%83%9B%E3%83%B3', // ヘッドホン
  // 職種系
  'https://note.com/interests/%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2', // エンジニア
  'https://note.com/interests/%E3%83%87%E3%82%B6%E3%82%A4%E3%83%8A%E3%83%BC', // デザイナー
]

// 検索キーワード一覧
const SEARCH_QUERIES = [
  // メインキーワード
  '買ってよかった ガジェット',
  'おすすめ デスクグッズ',
  'テレワーク 環境',
  '仕事道具 紹介',
  'デスク周り 紹介',
  '愛用ガジェット',
  'お気に入り デスク',
  // 仕事・職種系
  'エンジニア ガジェット',
  'デザイナー 仕事道具',
  'フリーランス デスク',
  'プログラマー 環境',
  'クリエイター 作業環境',
  'ライター デスク',
  // 製品カテゴリ系
  'キーボード おすすめ',
  'マウス レビュー',
  'モニター おすすめ',
  '電動昇降デスク',
  'オフィスチェア レビュー',
  'モニターアーム',
  'デスクライト おすすめ',
  'PCスピーカー',
  'ウェブカメラ おすすめ',
  'マイク 配信',
  // ライフスタイル系
  'ミニマリスト デスク',
  'おしゃれ デスク',
  'スッキリ デスク',
  '快適 作業環境',
  // 年度・まとめ系
  '2024 ベストバイ',
  '2025 ガジェット',
  'ガジェット まとめ',
  '買ってよかったもの 仕事',
]

/**
 * note.com から記事一覧を取得（単一URL）
 */
async function fetchArticlesFromUrl(page: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>['newPage']>>, url: string): Promise<NoteArticle[]> {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const articles = await page.evaluate(() => {
      const results: Array<{
        title: string
        url: string
        author: string
        likes: number
        date: string
      }> = []

      const headings = document.querySelectorAll('h3')

      headings.forEach(h3 => {
        const title = h3.textContent?.trim() || ''
        if (!title || title.length < 5) return

        const card = h3.closest('div')?.parentElement?.parentElement
        if (!card) return

        const linkEl = card.querySelector('a[href*="/n/n"]')
        const url = linkEl?.getAttribute('href') || ''
        if (!url) return

        let likes = 0
        const likeButton = card.querySelector('button[class*="suki"], button[aria-label*="スキ"]')
        if (likeButton) {
          const text = likeButton.textContent || ''
          const match = text.match(/(\d+)/)
          if (match) likes = parseInt(match[1])
        }

        const authorEl = card.querySelector('a[href^="/"][href$="リンク"] span, [class*="author"], [class*="Creator"]')
        const author = authorEl?.textContent?.trim() || ''

        const timeEl = card.querySelector('time')
        const date = timeEl?.textContent?.trim() || ''

        results.push({
          title,
          url: url.startsWith('http') ? url : `https://note.com${url}`,
          author,
          likes,
          date
        })
      })

      return results
    })

    return articles
  } catch (error) {
    console.log(`  [note.com] URL取得失敗: ${url}`)
    return []
  }
}

/**
 * note.com から複数タグ・検索クエリで記事一覧を取得
 */
export async function fetchNoteArticles(): Promise<NoteArticle[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const allArticles: NoteArticle[] = []

  try {
    // タグページから収集
    console.log(`  [note.com] ${TAG_URLS.length}個のタグページを検索中...`)
    for (const url of TAG_URLS) {
      const articles = await fetchArticlesFromUrl(page, url)
      allArticles.push(...articles)
      console.log(`    タグ: ${articles.length}件`)
      await page.waitForTimeout(1000) // レート制限対策
    }

    // 検索クエリから収集
    console.log(`  [note.com] ${SEARCH_QUERIES.length}個の検索クエリを実行中...`)
    for (const query of SEARCH_QUERIES) {
      const searchUrl = `https://note.com/search?q=${encodeURIComponent(query)}&context=note`
      const articles = await fetchArticlesFromUrl(page, searchUrl)
      allArticles.push(...articles)
      console.log(`    検索「${query}」: ${articles.length}件`)
      await page.waitForTimeout(1000)
    }

    // 重複を除去
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.url === article.url)
    )

    console.log(`  [note.com] 合計: ${uniqueArticles.length}件（重複除去後）`)
    return uniqueArticles
  } finally {
    await browser.close()
  }
}

/**
 * 商品名が記事タイトルに含まれているかチェック
 */
export function matchProductInArticles(
  productName: string,
  articles: NoteArticle[]
): NoteData {
  // 商品名からキーワードを抽出
  const keywords = extractKeywords(productName)

  // マッチする記事を抽出
  const matchedArticles = articles.filter(article => {
    const titleLower = article.title.toLowerCase()
    return keywords.some(keyword =>
      titleLower.includes(keyword.toLowerCase())
    )
  })

  const totalLikes = matchedArticles.reduce((sum, a) => sum + a.likes, 0)

  return {
    articleCount: matchedArticles.length,
    totalLikes,
    articles: matchedArticles
  }
}

/**
 * 商品名からマッチング用キーワードを抽出
 */
function extractKeywords(productName: string): string[] {
  const keywords: string[] = []

  // 商品名マッピング（商品名 → 検索キーワード）
  const keywordMap: Record<string, string[]> = {
    'Dell U2723QE': ['Dell', 'U2723', '4K', 'USB-C モニター'],
    'HHKB': ['HHKB', 'Happy Hacking', 'ハッピーハッキング'],
    'MX Master': ['MX Master', 'MXマスター', 'ロジクール マウス', 'Logicool マウス'],
    'WH-1000XM5': ['WH-1000XM5', 'XM5', 'ソニー ヘッドホン', 'Sony ノイキャン'],
    'FlexiSpot': ['FlexiSpot', 'フレキシスポット', '電動昇降', 'スタンディングデスク'],
    'エルゴヒューマン': ['エルゴヒューマン', 'Ergohuman', 'オフィスチェア'],
    'エルゴトロン': ['エルゴトロン', 'Ergotron', 'モニターアーム', 'LX'],
    'BenQ ScreenBar': ['BenQ', 'ScreenBar', 'スクリーンバー', 'モニターライト'],
    'Grovemade': ['Grovemade', 'デスクマット', '本革'],
    'Philips Hue': ['Philips Hue', 'フィリップス', 'Hue Play', 'ライトバー', '間接照明'],
  }

  // マッピングからキーワードを取得
  for (const [key, values] of Object.entries(keywordMap)) {
    if (productName.includes(key) || key.includes(productName.split(' ')[0])) {
      keywords.push(...values)
    }
  }

  // マッピングにない場合は商品名を分割
  if (keywords.length === 0) {
    // ブランド名や型番を抽出
    const words = productName.split(/[\s　]+/)
    keywords.push(...words.filter(w => w.length >= 2))
  }

  return Array.from(new Set(keywords)) // 重複除去
}

/**
 * モックデータを生成（テスト用）
 */
export function generateMockNoteData(): NoteData {
  return {
    articleCount: Math.floor(Math.random() * 5),
    totalLikes: Math.floor(Math.random() * 100),
    articles: []
  }
}
