/**
 * 商品カテゴリに応じたUnsplash画像URLを設定するスクリプト
 *
 * 使用方法: npx tsx scripts/set-placeholder-images.ts
 */

import fs from 'fs'
import path from 'path'

interface Item {
  id: string
  name: string
  imageUrl: string
  subCategory: string
  [key: string]: unknown
}

interface ItemsData {
  items: Item[]
}

const ITEMS_JSON_PATH = path.join(process.cwd(), 'src/data/items.json')

// サブカテゴリに応じたUnsplash画像（高品質な実際の商品画像に近いもの）
const categoryImages: Record<string, string> = {
  // デバイス
  'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
  'keyboard': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop',
  'mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
  'headphone': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
  // 家具
  'desk': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
  'chair': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop',
  'monitor-arm': 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop',
  // 照明
  'desk-light': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
  'ambient-light': 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=300&fit=crop',
  'desk-mat': 'https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?w=400&h=300&fit=crop',
}

// デフォルト画像
const defaultImage = 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop'

async function main() {
  console.log('🖼️  Unsplash画像URL設定スクリプト開始\n')

  const itemsData: ItemsData = JSON.parse(fs.readFileSync(ITEMS_JSON_PATH, 'utf-8'))
  let updatedCount = 0

  for (const item of itemsData.items) {
    // 既にAmazon/Unsplash画像URLが設定されている場合はスキップ
    if (item.imageUrl.startsWith('https://m.media-amazon.com') ||
        item.imageUrl.startsWith('https://images.unsplash.com')) {
      console.log(`✓ ${item.name}: Already has external URL`)
      continue
    }

    const imageUrl = categoryImages[item.subCategory] || defaultImage
    item.imageUrl = imageUrl
    updatedCount++
    console.log(`✓ ${item.name}: Set ${item.subCategory} image`)
  }

  if (updatedCount > 0) {
    fs.writeFileSync(ITEMS_JSON_PATH, JSON.stringify(itemsData, null, 2) + '\n')
    console.log(`\n✅ ${updatedCount}件の画像URLを更新しました`)
  } else {
    console.log('\n⚠️ 更新対象がありませんでした')
  }
}

main().catch(console.error)
