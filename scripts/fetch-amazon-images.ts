/**
 * Amazon商品ページからOGP画像URLを取得し、items.jsonを更新するスクリプト
 *
 * 使用方法: npx tsx scripts/fetch-amazon-images.ts
 */

import fs from 'fs'
import path from 'path'

interface AmazonData {
  asin: string
  url: string
  affiliateUrl: string
  price: number
}

interface Item {
  id: string
  name: string
  imageUrl: string
  amazon: AmazonData
  [key: string]: unknown
}

interface ItemsData {
  items: Item[]
}

const ITEMS_JSON_PATH = path.join(process.cwd(), 'src/data/items.json')

// User-Agentを設定してブロックを回避
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
}

// レート制限のための遅延
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Amazon商品ページからOGP画像URLを取得
 */
async function fetchAmazonImageUrl(asin: string): Promise<string | null> {
  const url = `https://www.amazon.co.jp/dp/${asin}`

  try {
    const response = await fetch(url, { headers: HEADERS })

    if (!response.ok) {
      console.error(`  Failed to fetch ${asin}: ${response.status}`)
      return null
    }

    const html = await response.text()

    // OGP画像を抽出 (og:image)
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i)

    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1]
    }

    // 代替: メイン商品画像を抽出
    const landingImageMatch = html.match(/id="landingImage"[^>]+src="([^"]+)"/i)
    if (landingImageMatch && landingImageMatch[1]) {
      return landingImageMatch[1]
    }

    // 代替: imgTagWrapperId内の画像
    const imgTagMatch = html.match(/id="imgTagWrapperId"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i)
    if (imgTagMatch && imgTagMatch[1]) {
      return imgTagMatch[1]
    }

    console.error(`  No image found for ${asin}`)
    return null
  } catch (error) {
    console.error(`  Error fetching ${asin}:`, error)
    return null
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('📦 Amazon画像URL取得スクリプト開始\n')

  // items.jsonを読み込み
  const itemsData: ItemsData = JSON.parse(fs.readFileSync(ITEMS_JSON_PATH, 'utf-8'))
  let updatedCount = 0

  for (const item of itemsData.items) {
    console.log(`🔍 ${item.name} (${item.amazon.asin})`)

    // 既にAmazon画像URLが設定されている場合はスキップ
    if (item.imageUrl.startsWith('https://')) {
      console.log('  ✓ Already has external URL, skipping')
      continue
    }

    const imageUrl = await fetchAmazonImageUrl(item.amazon.asin)

    if (imageUrl) {
      item.imageUrl = imageUrl
      updatedCount++
      console.log(`  ✓ Updated: ${imageUrl.substring(0, 60)}...`)
    } else {
      console.log('  ✗ Failed to get image')
    }

    // レート制限: 2秒待機
    await delay(2000)
  }

  // 更新があれば保存
  if (updatedCount > 0) {
    fs.writeFileSync(ITEMS_JSON_PATH, JSON.stringify(itemsData, null, 2) + '\n')
    console.log(`\n✅ ${updatedCount}件の画像URLを更新しました`)
  } else {
    console.log('\n⚠️ 更新対象がありませんでした')
  }
}

main().catch(console.error)
