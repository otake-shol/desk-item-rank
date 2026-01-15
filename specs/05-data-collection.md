# データ自動収集仕様書

## ステータス: Draft

## 概要
X/Twitter、YouTube、Amazon等からデスクアイテムの人気度データを自動収集し、スコアを算出するシステム。

## データソース

### 1. X/Twitter API
- 検索クエリ: アイテム名 + 関連キーワード
- 収集データ: ツイート数、いいね数、リツイート数
- 期間: 過去7日間

### 2. YouTube Data API
- 検索クエリ: アイテム名 + "レビュー"
- 収集データ: 動画数、総再生回数、高評価数
- 期間: 過去30日間

### 3. Amazon Product Advertising API（将来）
- 収集データ: レビュー数、評価、ランキング

## スコア算出ロジック

```typescript
interface ScoreFactors {
  twitterMentions: number    // 重み: 30%
  twitterEngagement: number  // 重み: 20%
  youtubeViews: number       // 重み: 30%
  youtubeEngagement: number  // 重み: 20%
}

function calculateScore(factors: ScoreFactors): number {
  const normalized = normalizeFactors(factors)
  return (
    normalized.twitterMentions * 0.3 +
    normalized.twitterEngagement * 0.2 +
    normalized.youtubeViews * 0.3 +
    normalized.youtubeEngagement * 0.2
  ) * 100
}
```

## API設計

### 収集スクリプト
```
scripts/
  collect-data.ts       # メイン収集スクリプト
  collectors/
    twitter.ts          # Twitter API連携
    youtube.ts          # YouTube API連携
  utils/
    score-calculator.ts # スコア算出
```

### 環境変数
```
TWITTER_BEARER_TOKEN=xxx
YOUTUBE_API_KEY=xxx
```

## 実行方法

### 手動実行
```bash
npm run collect-data
```

### 自動実行（GitHub Actions）
```yaml
# .github/workflows/collect-data.yml
name: Collect Data
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日0時
  workflow_dispatch: # 手動実行
```

## 受け入れ条件

### Given-When-Then

```gherkin
Scenario: Twitter データ収集
  Given Twitter API認証が設定されている
  When collect-data スクリプトを実行する
  Then 各アイテムのTwitterメンション数が取得される
  And データがJSONファイルに保存される

Scenario: YouTube データ収集
  Given YouTube API認証が設定されている
  When collect-data スクリプトを実行する
  Then 各アイテムのYouTube再生数が取得される
  And データがJSONファイルに保存される

Scenario: スコア更新
  Given 収集データが存在する
  When スコア算出を実行する
  Then 各アイテムのスコアが更新される
  And ランキングが再計算される

Scenario: API制限エラー
  Given API呼び出し制限に達した
  When 収集を実行する
  Then エラーログが出力される
  And 既存データは保持される
```

## テストケース

### ユニットテスト
1. `normalizeFactors()` が0-1の範囲に正規化する
2. `calculateScore()` が0-100の範囲のスコアを返す
3. Twitter APIレスポンスのパースが正しい
4. YouTube APIレスポンスのパースが正しい

### 統合テスト
1. モックAPIで収集フロー全体が動作する
2. エラー時にグレースフルに失敗する

## MVP実装範囲

Phase 1（MVP）:
- [ ] スコア算出ロジックのみ（モックデータ使用）
- [ ] 手動でデータ更新可能な仕組み

Phase 2:
- [ ] YouTube API連携
- [ ] GitHub Actions自動実行

Phase 3:
- [ ] Twitter API連携
- [ ] Amazon API連携
