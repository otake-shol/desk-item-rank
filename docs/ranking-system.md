# ランキングシステム設計書

## 現状（Phase 1: 静的ランキング）

### 仕組み

```
items.json (手動設定)
    ↓
score: 80-95 (固定値)
    ↓
rank: 1-10 (score順)
    ↓
画面表示
```

### 現在のスコア

| 順位 | 商品名 | スコア | 設定方法 |
|-----|--------|-------|---------|
| 1 | Dell U2723QE | 95 | 手動 |
| 2 | HHKB Professional | 92 | 手動 |
| 3 | FlexiSpot E7 | 91 | 手動 |
| ... | ... | ... | ... |

### 課題

- スコアが固定で変化しない
- 市場の人気度を反映できない
- 手動更新が必要

---

## 動的ランキング構想

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     データ収集層                              │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ Twitter/X   │  YouTube    │   Amazon    │   手動キュレーション    │
│  API        │   API       │   PA-API    │                     │
└──────┬──────┴──────┬──────┴──────┬──────┴──────────┬──────────┘
       │             │             │                 │
       ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    スコア算出エンジン                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 総合スコア = Twitter(30%) + YouTube(30%)            │    │
│  │            + Amazon(20%) + キュレーション(20%)       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                      データ保存層                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  Supabase  │  │   JSON     │  │  GitHub Actions    │    │
│  │  (推奨)    │  │  (静的)    │  │  (自動更新)        │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                      表示層 (Next.js)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 実装オプション

### オプションA: GitHub Actions + JSON（シンプル）

**コスト**: 無料
**難易度**: ★★☆☆☆
**リアルタイム性**: 1日1回更新

```yaml
# .github/workflows/update-ranking.yml
name: Update Ranking
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日0時
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run collect-data
      - run: npm run calculate-scores
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update ranking data"
```

**メリット**:
- インフラ不要
- Vercelで自動デプロイ

**デメリット**:
- リアルタイム更新不可
- コミット履歴が増える

---

### オプションB: Supabase（推奨）

**コスト**: 無料枠あり（500MB DB）
**難易度**: ★★★☆☆
**リアルタイム性**: 即時反映可能

```
┌────────────────┐      ┌────────────────┐
│   Supabase     │      │   Next.js      │
│  ┌──────────┐  │      │                │
│  │  items   │◄─┼──────┼── API Routes   │
│  │  scores  │  │      │                │
│  │  history │  │      │  SSR/ISR       │
│  └──────────┘  │      │                │
└────────────────┘      └────────────────┘
        ▲
        │
┌───────┴────────┐
│ Edge Functions │
│ (定期実行)      │
└────────────────┘
```

**テーブル設計**:

```sql
-- 商品マスタ
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amazon_asin TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- スコア履歴
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  item_id TEXT REFERENCES items(id),
  twitter_score FLOAT,
  youtube_score FLOAT,
  amazon_score FLOAT,
  total_score FLOAT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- 最新スコア（ビュー）
CREATE VIEW current_scores AS
SELECT DISTINCT ON (item_id)
  item_id,
  total_score,
  recorded_at
FROM score_history
ORDER BY item_id, recorded_at DESC;
```

**メリット**:
- リアルタイム更新
- スコア履歴を保存
- 管理画面構築が容易

**デメリット**:
- Supabaseの学習コスト
- 無料枠の制限

---

### オプションC: Vercel Cron + KV（モダン）

**コスト**: Vercel Pro必要（$20/月）
**難易度**: ★★★★☆
**リアルタイム性**: 設定次第

```typescript
// app/api/cron/update-scores/route.ts
import { kv } from '@vercel/kv'

export async function GET() {
  // データ収集
  const scores = await collectAllScores()

  // KVに保存
  await kv.set('ranking', scores)

  return Response.json({ success: true })
}
```

```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/cron/update-scores",
    "schedule": "0 * * * *"  // 毎時
  }]
}
```

---

## データソース別の実装状況

| ソース | 実装状況 | API費用 | 難易度 |
|--------|---------|---------|--------|
| YouTube | ✅ 実装済み | 無料（10,000クエリ/日） | ★★☆ |
| Twitter/X | ✅ 実装済み | 有料（$100/月〜） | ★★★ |
| Amazon PA-API | ❌ 未実装 | 無料（要承認） | ★★★ |
| 手動スコア | ✅ 使用中 | 無料 | ★☆☆ |

---

## 推奨ロードマップ

### Phase 2-A: YouTube連携（1週間）

1. YouTube API キー取得（Google Cloud Console）
2. 環境変数設定
3. GitHub Actionsで毎日実行
4. items.jsonを自動更新

```bash
# 必要な環境変数
YOUTUBE_API_KEY=AIzaSy...
```

### Phase 2-B: Supabase移行（2週間）

1. Supabaseプロジェクト作成
2. テーブル設計・マイグレーション
3. データ取得をAPI Routesに変更
4. スコア更新をEdge Functionsで実行

### Phase 3: Twitter連携（オプション）

- X API Basicプラン: $100/月
- 費用対効果を検討

---

## 現在のスコア算出ロジック

```typescript
// scripts/collectors/score-calculator.ts

interface ScoreFactors {
  twitterMentions: number    // 重み: 30%
  twitterEngagement: number  // 重み: 20%
  youtubeViews: number       // 重み: 30%
  youtubeEngagement: number  // 重み: 20%
}

// 正規化基準値
const NORMALIZATION_BASE = {
  twitterMentions: 1000,     // 1000ツイート = 100点
  twitterEngagement: 5000,   // 5000エンゲージメント = 100点
  youtubeViews: 100000,      // 10万再生 = 100点
  youtubeEngagement: 10000,  // 1万エンゲージメント = 100点
}

function calculateScore(factors: ScoreFactors): number {
  const normalized = normalizeFactors(factors)
  return Math.round(
    normalized.twitterMentions * 0.3 +
    normalized.twitterEngagement * 0.2 +
    normalized.youtubeViews * 0.3 +
    normalized.youtubeEngagement * 0.2
  ) * 100
}
```

---

## 次のアクション

動的ランキングを実装するには、以下から選択してください：

1. **シンプルに始める** → YouTube API + GitHub Actions
2. **本格的に構築** → Supabase + Edge Functions
3. **コストをかける** → Twitter API追加

どの方向で進めますか？
