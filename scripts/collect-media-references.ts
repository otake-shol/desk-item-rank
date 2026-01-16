/**
 * メディア参照収集スクリプト
 * YouTube動画情報をアイテムに紐づけて収集
 *
 * 使用方法:
 *   YOUTUBE_API_KEY=xxx npx ts-node scripts/collect-media-references.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { searchYouTubeVideos, YouTubeVideoDetail } from './collectors/youtube'

interface MediaReference {
  type: 'youtube'
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  publishedAt: string
  viewCount?: number
}

interface Item {
  id: string
  name: string
  mediaReferences?: MediaReference[]
  [key: string]: unknown
}

interface ItemsData {
  items: Item[]
}

const ITEMS_FILE = path.join(__dirname, '../src/data/items.json')

/**
 * YouTube動画詳細をMediaReferenceに変換
 */
function toMediaReference(video: YouTubeVideoDetail): MediaReference {
  return {
    type: 'youtube',
    videoId: video.videoId,
    title: video.title,
    channelName: video.channelName,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt,
    viewCount: video.viewCount,
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== Media References Collection ===\n')

  // APIキーチェック
  if (!process.env.YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY environment variable is required')
    console.log('Usage: YOUTUBE_API_KEY=xxx npx ts-node scripts/collect-media-references.ts')
    process.exit(1)
  }

  // items.json読み込み
  const itemsData: ItemsData = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8'))
  console.log(`Loaded ${itemsData.items.length} items\n`)

  let updatedCount = 0
  let totalVideos = 0

  for (const item of itemsData.items) {
    console.log(`Processing: ${item.name}`)

    try {
      // YouTube動画を検索
      const videos = await searchYouTubeVideos(item.name, 3)

      if (videos.length > 0) {
        // MediaReferenceに変換
        const mediaRefs = videos.map(toMediaReference)

        // 既存のmediaReferencesとマージ（重複除去）
        const existingIds = new Set(
          (item.mediaReferences || []).map(ref => ref.videoId)
        )
        const newRefs = mediaRefs.filter(ref => !existingIds.has(ref.videoId))

        if (newRefs.length > 0) {
          item.mediaReferences = [
            ...(item.mediaReferences || []),
            ...newRefs,
          ]
          updatedCount++
          totalVideos += newRefs.length
          console.log(`  -> Added ${newRefs.length} videos`)
        } else {
          console.log(`  -> No new videos`)
        }
      } else {
        console.log(`  -> No videos found`)
      }

      // APIレート制限対策（1秒待機）
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`  -> Error: ${error}`)
    }
  }

  // items.json保存
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(itemsData, null, 2) + '\n', 'utf-8')

  console.log('\n=== Summary ===')
  console.log(`Updated items: ${updatedCount}`)
  console.log(`Total videos added: ${totalVideos}`)
  console.log(`Saved to: ${ITEMS_FILE}`)
}

main().catch(console.error)
