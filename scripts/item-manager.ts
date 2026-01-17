/**
 * アイテム管理CLIスクリプト
 *
 * 使用方法:
 *   npx tsx scripts/item-manager.ts hide <id>         # アイテムを非表示
 *   npx tsx scripts/item-manager.ts show <id>         # アイテムを表示
 *   npx tsx scripts/item-manager.ts score <id> <num>  # スコアを手動設定
 *   npx tsx scripts/item-manager.ts reset <id>        # スコアを自動計算に戻す
 *   npx tsx scripts/item-manager.ts curate <id>       # 確認済みにマーク
 *   npx tsx scripts/item-manager.ts list [status]     # アイテム一覧（status: all/active/hidden/pending）
 *   npx tsx scripts/item-manager.ts search <keyword>  # キーワード検索
 */

import * as fs from 'fs'
import * as path from 'path'

type ItemStatus = 'active' | 'hidden' | 'pending'

interface Item {
  id: string
  name: string
  score: number
  category: string
  subCategory: string
  status?: ItemStatus
  scoreOverride?: number | null
  curatedAt?: string | null
  amazon?: { asin: string }
  imageUrl?: string
  [key: string]: unknown
}

interface ItemsData {
  items: Item[]
}

const ITEMS_PATH = path.join(__dirname, '../src/data/items.json')

function loadItems(): ItemsData {
  return JSON.parse(fs.readFileSync(ITEMS_PATH, 'utf-8'))
}

function saveItems(data: ItemsData): void {
  fs.writeFileSync(ITEMS_PATH, JSON.stringify(data, null, 2))
}

function findItem(items: Item[], idOrKeyword: string): Item | undefined {
  // IDで完全一致
  let item = items.find((i) => i.id === idOrKeyword)
  if (item) return item

  // ASINで一致
  item = items.find((i) => i.amazon?.asin === idOrKeyword)
  if (item) return item

  // 名前に含まれる（部分一致）
  const matches = items.filter((i) =>
    i.name.toLowerCase().includes(idOrKeyword.toLowerCase())
  )
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) {
    console.log(`⚠️  複数のアイテムがマッチしました:`)
    matches.slice(0, 5).forEach((m) => {
      console.log(`   - ${m.id}: ${m.name.substring(0, 40)}`)
    })
    console.log(`\n正確なIDを指定してください。`)
    return undefined
  }

  return undefined
}

function formatStatus(status: ItemStatus | undefined): string {
  switch (status) {
    case 'hidden':
      return '🔴 hidden'
    case 'pending':
      return '🟡 pending'
    case 'active':
    default:
      return '🟢 active'
  }
}

// === コマンド実装 ===

function hideItem(id: string): void {
  const data = loadItems()
  const item = findItem(data.items, id)
  if (!item) {
    console.log(`❌ アイテムが見つかりません: ${id}`)
    return
  }

  item.status = 'hidden'
  saveItems(data)
  console.log(`✅ 非表示にしました: ${item.name.substring(0, 40)}`)
  console.log(`   ID: ${item.id}`)
}

function showItem(id: string): void {
  const data = loadItems()
  const item = findItem(data.items, id)
  if (!item) {
    console.log(`❌ アイテムが見つかりません: ${id}`)
    return
  }

  item.status = 'active'
  saveItems(data)
  console.log(`✅ 表示に戻しました: ${item.name.substring(0, 40)}`)
  console.log(`   ID: ${item.id}`)
}

function setScore(id: string, score: number): void {
  const data = loadItems()
  const item = findItem(data.items, id)
  if (!item) {
    console.log(`❌ アイテムが見つかりません: ${id}`)
    return
  }

  if (score < 0 || score > 100) {
    console.log(`❌ スコアは0-100の範囲で指定してください`)
    return
  }

  item.scoreOverride = score
  saveItems(data)
  console.log(`✅ スコアを設定しました: ${item.name.substring(0, 40)}`)
  console.log(`   ID: ${item.id}`)
  console.log(`   元のスコア: ${item.score} → 上書き: ${score}`)
}

function resetScore(id: string): void {
  const data = loadItems()
  const item = findItem(data.items, id)
  if (!item) {
    console.log(`❌ アイテムが見つかりません: ${id}`)
    return
  }

  item.scoreOverride = null
  saveItems(data)
  console.log(`✅ スコアを自動計算に戻しました: ${item.name.substring(0, 40)}`)
  console.log(`   ID: ${item.id}`)
  console.log(`   自動計算スコア: ${item.score}`)
}

function curateItem(id: string): void {
  const data = loadItems()
  const item = findItem(data.items, id)
  if (!item) {
    console.log(`❌ アイテムが見つかりません: ${id}`)
    return
  }

  item.curatedAt = new Date().toISOString().split('T')[0]
  if (item.status === 'pending') {
    item.status = 'active'
  }
  saveItems(data)
  console.log(`✅ 確認済みにしました: ${item.name.substring(0, 40)}`)
  console.log(`   ID: ${item.id}`)
  console.log(`   確認日: ${item.curatedAt}`)
}

function listItems(statusFilter: string = 'all'): void {
  const data = loadItems()
  let items = data.items

  // フィルタリング
  if (statusFilter !== 'all') {
    items = items.filter((i) => {
      const status = i.status || 'active'
      return status === statusFilter
    })
  }

  // スコア順にソート
  items.sort((a, b) => {
    const scoreA = a.scoreOverride ?? a.score
    const scoreB = b.scoreOverride ?? b.score
    return scoreB - scoreA
  })

  console.log(`\n📋 アイテム一覧 (${statusFilter}): ${items.length}件\n`)
  console.log('─'.repeat(80))

  items.forEach((item, index) => {
    const effectiveScore = item.scoreOverride ?? item.score
    const scoreStr = item.scoreOverride
      ? `${effectiveScore} (override)`
      : `${effectiveScore}`
    const statusStr = formatStatus(item.status)
    const curatedStr = item.curatedAt ? `✓${item.curatedAt}` : ''

    console.log(
      `${String(index + 1).padStart(3)}. [${scoreStr.padStart(12)}] ${statusStr} ${curatedStr}`
    )
    console.log(`     ${item.name.substring(0, 60)}`)
    console.log(`     ID: ${item.id} | ${item.category}/${item.subCategory}`)
    console.log('')
  })

  // サマリー
  const summary = {
    total: data.items.length,
    active: data.items.filter((i) => (i.status || 'active') === 'active').length,
    hidden: data.items.filter((i) => i.status === 'hidden').length,
    pending: data.items.filter((i) => i.status === 'pending').length,
    curated: data.items.filter((i) => i.curatedAt).length,
    overridden: data.items.filter((i) => i.scoreOverride != null).length,
  }

  console.log('─'.repeat(80))
  console.log(`\n📊 サマリー:`)
  console.log(`   総数: ${summary.total} | 表示中: ${summary.active} | 非表示: ${summary.hidden} | 審査待ち: ${summary.pending}`)
  console.log(`   確認済み: ${summary.curated} | スコア上書き: ${summary.overridden}`)
}

function searchItems(keyword: string): void {
  const data = loadItems()
  const items = data.items.filter(
    (i) =>
      i.name.toLowerCase().includes(keyword.toLowerCase()) ||
      i.id.toLowerCase().includes(keyword.toLowerCase()) ||
      i.amazon?.asin?.toLowerCase().includes(keyword.toLowerCase())
  )

  if (items.length === 0) {
    console.log(`❌ 「${keyword}」に一致するアイテムはありません`)
    return
  }

  console.log(`\n🔍 「${keyword}」の検索結果: ${items.length}件\n`)

  items.forEach((item) => {
    const effectiveScore = item.scoreOverride ?? item.score
    const statusStr = formatStatus(item.status)
    console.log(`${statusStr} [${effectiveScore}] ${item.name.substring(0, 50)}`)
    console.log(`   ID: ${item.id} | ASIN: ${item.amazon?.asin}`)
    console.log('')
  })
}

// === メイン ===

function main(): void {
  const [, , command, ...args] = process.argv

  console.log('\n🔧 アイテム管理CLI\n')

  switch (command) {
    case 'hide':
      if (!args[0]) {
        console.log('使用法: hide <id>')
        return
      }
      hideItem(args[0])
      break

    case 'show':
      if (!args[0]) {
        console.log('使用法: show <id>')
        return
      }
      showItem(args[0])
      break

    case 'score':
      if (!args[0] || !args[1]) {
        console.log('使用法: score <id> <score>')
        return
      }
      setScore(args[0], parseInt(args[1], 10))
      break

    case 'reset':
      if (!args[0]) {
        console.log('使用法: reset <id>')
        return
      }
      resetScore(args[0])
      break

    case 'curate':
      if (!args[0]) {
        console.log('使用法: curate <id>')
        return
      }
      curateItem(args[0])
      break

    case 'list':
      listItems(args[0] || 'all')
      break

    case 'search':
      if (!args[0]) {
        console.log('使用法: search <keyword>')
        return
      }
      searchItems(args[0])
      break

    default:
      console.log(`
使用方法:
  npx tsx scripts/item-manager.ts <command> [args]

コマンド:
  hide <id>          アイテムを非表示にする
  show <id>          アイテムを表示に戻す
  score <id> <num>   スコアを手動設定（0-100）
  reset <id>         スコアを自動計算に戻す
  curate <id>        確認済みにマーク
  list [status]      アイテム一覧（all/active/hidden/pending）
  search <keyword>   キーワード検索

例:
  npx tsx scripts/item-manager.ts hide keyboard-xxx
  npx tsx scripts/item-manager.ts score keyboard-hhkb-hybrid 95
  npx tsx scripts/item-manager.ts list hidden
  npx tsx scripts/item-manager.ts search HHKB
`)
  }
}

main()
