# YouTube API セットアップガイド

## 概要

このプロジェクトでは、YouTube Data API v3 を使用して商品の人気度データを収集し、ランキングスコアを動的に更新します。

## 現在の実装状況

| ファイル | 状態 | 説明 |
|---------|------|------|
| `scripts/collectors/youtube.ts` | ✅ 実装済み | YouTube API クライアント |
| `scripts/collectors/score-calculator.ts` | ✅ 実装済み | スコア算出ロジック |
| `scripts/collect-data.ts` | ✅ 実装済み | データ収集メインスクリプト |
| `.github/workflows/collect-data.yml` | ✅ 実装済み | 毎日自動実行 |

---

## Step 1: YouTube API キーの取得

### 1.1 Google Cloud Console にアクセス

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. Google アカウントでログイン

### 1.2 プロジェクトを作成

1. 上部の「プロジェクトを選択」をクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名: `desk-item-rank` など任意の名前
4. 「作成」をクリック

### 1.3 YouTube Data API v3 を有効化

1. 左メニュー → 「APIとサービス」→「ライブラリ」
2. 検索ボックスで「YouTube Data API v3」を検索
3. 「有効にする」をクリック

### 1.4 API キーを作成

1. 左メニュー → 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「APIキー」をクリック
3. API キーが生成される（`AIzaSy...` で始まる文字列）
4. 「キーを制限」をクリック（推奨）
   - アプリケーションの制限: なし（または IP アドレス制限）
   - API の制限: 「YouTube Data API v3」のみ選択
5. 「保存」

---

## Step 2: ローカルでのテスト

### 2.1 環境変数を設定

```bash
# .env.local ファイルを作成
echo "YOUTUBE_API_KEY=AIzaSy..." >> .env.local
```

または、ターミナルで直接設定:

```bash
export YOUTUBE_API_KEY="AIzaSy..."
```

### 2.2 データ収集を実行

```bash
# テスト実行（items.json は更新しない）
npm run collect-data

# items.json を更新
npm run collect-data:update
```

### 2.3 出力確認

```bash
# 収集データを確認
cat data/collected/collected-$(date +%Y-%m-%d).json

# スコアの変化を確認
git diff src/data/items.json
```

---

## Step 3: GitHub Actions の設定

### 3.1 GitHub Secrets に API キーを追加

1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. Name: `YOUTUBE_API_KEY`
4. Secret: `AIzaSy...`（取得した API キー）
5. 「Add secret」をクリック

### 3.2 ワークフローの確認

ワークフローは既に設定済み（`.github/workflows/collect-data.yml`）:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日 UTC 0:00（JST 9:00）
  workflow_dispatch:     # 手動実行も可能
```

### 3.3 手動実行でテスト

1. GitHub リポジトリ → Actions
2. 「Collect Data」ワークフローを選択
3. 「Run workflow」をクリック
4. 実行結果を確認

---

## API 使用量と制限

| 項目 | 制限 |
|------|------|
| 1日のクォータ | 10,000 ユニット |
| 検索リクエスト | 100 ユニット/回 |
| 動画情報取得 | 1 ユニット/回 |
| 推定可能リクエスト | 約100商品/日 |

### 現在の使用量（10商品 × 1日1回）

- 検索: 10商品 × 100 ユニット = 1,000 ユニット
- 動画情報: 10商品 × 10動画 × 1 ユニット = 100 ユニット
- **合計: 約 1,100 ユニット/日**（無料枠の 11%）

---

## トラブルシューティング

### API キーが無効

```
Error: YouTube API error: 403 Forbidden
```

**対処法**:
- API キーが正しくコピーされているか確認
- YouTube Data API v3 が有効化されているか確認
- API キーの制限設定を確認

### クォータ超過

```
Error: YouTube API error: 429 Too Many Requests
```

**対処法**:
- 翌日まで待つ（クォータは毎日リセット）
- [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) でクォータ使用状況を確認

### モックデータが使用される

```
YOUTUBE_API_KEY is not set. Using mock data.
```

**対処法**:
- 環境変数 `YOUTUBE_API_KEY` が設定されているか確認
- `.env.local` ファイルが存在するか確認

---

## 次のステップ

1. ✅ YouTube API キーを取得
2. ✅ ローカルでテスト実行
3. ✅ GitHub Secrets に API キーを設定
4. ✅ 自動実行を確認

API キーを設定すれば、毎日自動でランキングが更新されます。
