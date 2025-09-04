# 初回セットアップ

## 必要な環境

- Node.js 18 以上
- Git

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/aew2sbee/youtube-study-time-tracker.git
cd youtube-study-time-tracker
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
# .envファイルを作成
cp .env.example .env
```

### 4. データベースの初期化

```bash
npm run db:generate
npm run db:migrate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能

### 5. 開発サーバーの起動(本番)

```bash
npm run build && npm run start

```

```bash
# Google OAuth 2.0リフレッシュトークンの確認や取得
npx tsx script/validate-refresh-token.ts

```

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm test

# データベース管理画面
npm run db:studio
```
