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
```

#### YouTube API キーの取得方法
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. YouTube Data API v3を有効化
4. 認証情報からAPIキーを作成

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

## 使用方法

### 視聴者側の操作
1. **勉強開始**: YouTube Liveチャットで `start` とコメント
2. **勉強終了**: YouTube Liveチャットで `end` とコメント
3. **再開**: 再度 `start` とコメントすると新しいセッションが開始され、時間が累積されます

### 配信者側の設定
1. アプリケーションをブラウザで開く
2. OBSで「ブラウザソース」を追加
3. URL: `http://localhost:3000`（または本番URL）
4. 幅: 672px、高さ: 適切なサイズに調整
5. 背景が透明なので、そのまま配信画面にオーバーレイ可能

## 技術スタック

- **フレームワーク**: Next.js 15.3.4
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **APIクライアント**: YouTube Data API v3
- **状態管理**: React Hooks
- **画像最適化**: Next.js Image コンポーネント

## 主要コンポーネント

### `/src/hooks/useStudyTime.ts`
- YouTube Live Chat APIからメッセージを取得
- `start`/`end` コメントを解析して勉強時間を計算
- リアルタイムでポーリング（10分間隔）
- 個人進捗データの管理
- 目標時間と追加時間の設定

### `/src/components/StudyTimeDisplay.tsx`
- 3つの表示モードの切り替え（個人進捗、ユーザー一覧、進捗バー）
- ページネーション機能（3人ずつ表示）
- フェードトランジション効果
- 進捗バーとアニメーション

### `/src/app/api/youtube/route.ts`
- YouTube Data API v3のラッパー
- Live Chat メッセージの取得
- エラーハンドリング
- ライブチャットIDの自動取得

## 設定のカスタマイズ

### 基本設定（`/src/hooks/useStudyTime.ts`）
```typescript
const API_POLLING_INTERVAL = 10 * 60 * 1000; // 10分間隔 (10 * 60 * 1000 ms)
const ADDITIONAL_STUDY_TIME = 1 * 60 * 60; // 追加の勉強時間（秒: h * m + sec）- 1時間
const TARGET_STUDY_TIME = 2 * 60 * 60; // 目標勉強時間（秒:h * m + sec ）- 2時間
const SHOW_PROGRESS_BAR = true; // 進捗バー表示の有効/無効
```

### 個人進捗データ（`/src/hooks/useStudyTime.ts`）
```typescript
const PERSONAL_STUDY_PROGRESS = {
  totalTime: 21 * 60 * 60, // 累積勉強時間（21時間）
  examDate: 'Not scheduled yet', // 試験日
  testScore: '科目A: 47%, 科目B: 95%', // テスト結果
  updateDate: '2025/07/03', // 更新日
};
```

### 表示設定（`/src/components/StudyTimeDisplay.tsx`）
```typescript
const USERS_PER_PAGE = 3; // ページあたり表示ユーザー数
const TRANSITION_DURATION = 1 * 1000; // フェードトランジション時間（1秒）
const PAGE_DISPLAY_INTERVAL = 10 * 1000; // ページ表示間隔（10秒）
```

### フェード時間の変更
CSSクラスの `duration-1000` を変更：

```typescript
className="transition-opacity duration-1000" // 1秒
```

## トラブルシューティング

### よくある問題

1. **YouTube APIエラー**
   - API キーが正しく設定されているか確認
   - VIDEO_IDが現在のライブ配信のものか確認
   - APIの使用量制限に達していないか確認

2. **画像が表示されない**
   - `next.config.ts` でYouTubeの画像ドメインが許可されているか確認

3. **文字が見切れる**
   - ブラウザのズーム設定を100%に設定
   - OBSのソースサイズを適切に調整

## ライセンス

MIT License

## 開発者向け

### コードの構成
```
src/
├── app/
│   ├── api/youtube/route.ts    # YouTube API エンドポイント
│   ├── globals.css             # グローバルスタイル
│   ├── layout.tsx              # レイアウトコンポーネント
│   └── page.tsx                # メインページ
├── components/
│   └── StudyTimeDisplay.tsx    # 表示コンポーネント
├── hooks/
│   └── useStudyTime.ts         # 勉強時間管理ロジック
└── types/
    └── youtube.ts              # 型定義
```

### 主要な型定義
```typescript
interface StudyTimeUser {
  name: string;
  studyTime: number; // 勉強時間（秒）
  profileImageUrl: string;
  startTime?: Date;
  isStudying: boolean;
}

interface YouTubeLiveChatMessage {
  id: string;
  authorDisplayName: string;
  displayMessage: string;
  publishedAt: string;
  profileImageUrl: string;
}
```

### 表示ロジック
アプリケーションは以下の順序で表示を切り替えます：
1. **個人進捗表示** → **ユーザー一覧表示**（複数ページある場合は順次表示）→ **進捗バー表示**
2. 各表示は10秒間隔で切り替わり、1秒のフェードトランジション
3. ユーザーが0人の場合は、個人進捗表示と使用方法の説明を表示


​​「Monthly Challenge」という企画でみなさんと100時間に挑戦中!!「start」「end」で誰でも参加できます！
​​「Monthly Challenge」という企画をやっています。でみなさんと100時間に挑戦中!!「start」「end」で誰でも参加できます！
