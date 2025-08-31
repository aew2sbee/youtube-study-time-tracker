# YouTube配信 勉強時間トラッカー

YouTube Liveのチャットコメントを監視して、視聴者の勉強時間を自動で計測・表示するOBS配信用オーバーレイアプリケーションです。

## 機能

### 📊 勉強時間計測
- **開始**: `start` コメントで勉強時間の計測開始
- **終了**: `end` コメントで勉強時間の計測終了
- **複数セッション**: 同じユーザーが複数回勉強した場合、時間が累積されます
- **リアルタイム監視**: 10分間隔でYouTube Live Chat APIを自動ポーリング

### 🎨 表示機能
- **3つの表示モード**:
  1. **個人進捗表示**: 自分の勉強時間、試験日、テスト結果を表示
  2. **ユーザー一覧表示**: 参加者の勉強時間をページネーション表示（3人ずつ）
  3. **進捗バー表示**: みんなの合計勉強時間と目標達成率を表示
- **リアルタイム表示**: 勉強中のユーザーを緑色「Studying」で表示（点滅アニメーション）
- **終了状態表示**: 勉強を終了したユーザーを青色「Finished」で表示
- **スムーズトランジション**: 1秒のフェードイン・フェードアウト効果、10秒間隔で自動切り替え

### 🎯 進捗管理機能
- **個人進捗トラッキング**: 累積勉強時間、試験日、テスト結果の管理
- **目標設定**: 目標勉強時間（デフォルト2時間）に対する進捗表示
- **追加時間設定**: 過去の勉強時間を合算（デフォルト1時間追加）
- **達成率表示**: パーセンテージでの目標達成状況

### 🎥 OBS対応
- **透明背景**: クロマキー不要の完全透明背景
- **最適化サイズ**: 配信オーバーレイに適したフルスクリーンサイズ
- **高視認性**: 32px（ユーザー名）、40px（勉強時間）大文字での表示
- **プロフィール画像**: YouTubeプロフィール画像を自動取得・表示

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の設定を追加：

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
VIDEO_ID=your_live_video_id_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

#### YouTube API キーの取得方法
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. YouTube Data API v3を有効化
4. 認証情報からAPIキーを作成

#### OAuth 2.0認証情報の設定
YouTube Live Chat APIでコメントを投稿するにはOAuth 2.0認証が必要です：

1. **OAuth同意画面の設定**（最初に必須）：
   - Google Cloud Console → 「OAuth同意画面」
   - User Type: **External** を選択
   - アプリ情報を入力：
     - アプリ名: `YouTube Study Time Tracker`
     - ユーザーサポートメール: あなたのメールアドレス
     - デベロッパーの連絡先情報: あなたのメールアドレス
   - スコープ: 今は設定不要
   - **テストユーザー**に必ずあなたのGoogleアカウントのメールアドレスを追加
   - 公開ステータス: **テスト中**のまま

2. **OAuth 2.0 クライアントIDの作成**：
   - 「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアントID」を選択
   - アプリケーションの種類：「ウェブアプリケーション」
   - 名前: `YouTube Study Time Client`
   - 承認済みのリダイレクトURI：`http://localhost:3000/api/oauth/callback`
   - クライアントIDとクライアントシークレットを取得

**よくあるエラーと対処法**：
- ❌ **「アクセスをブロック: このアプリのリクエストは無効です」**
  → OAuth同意画面が未設定、またはテストユーザーに追加されていない
- ❌ **「アクセスをブロック: youtube-study-time-tracker は Google の審査プロセスを完了していません」**
  → 「OAuth同意画面」→「テストユーザー」に使用するGoogleアカウントを追加
- ❌ **「このアプリは確認されていません」**
  → 「詳細」をクリックして「安全でないページに移動」を選択（開発用途のため安全）

2. **リフレッシュトークンの取得**：
   ```bash
   npm run get-refresh-token
   ```
   - 表示されたURLをブラウザで開く
   - Googleアカウントで認証
   - 認証コードを入力
   - 表示されたリフレッシュトークンを`.env.local`に追加

#### VIDEO IDの取得方法
YouTube Liveの配信URLから取得：
- URL例: `https://www.youtube.com/watch?v=VIDEO_ID_HERE`
- `v=` パラメータの値がVIDEO_IDです

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

### 4. 本番ビルド

```bash
npm run build
npm start
```

## マイグレーション

```bash
npx drizzle-kit generate
npx drizzle-kit push
```