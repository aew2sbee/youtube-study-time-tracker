# YouTube配信 勉強時間トラッカー

YouTube Liveのチャットコメントを監視して、視聴者の勉強時間を自動で計測・表示するOBS配信用オーバーレイアプリケーションです。

## 機能

### 📊 勉強時間計測
- **開始**: `start` コメントで勉強時間の計測開始
- **終了**: `end` コメントで勉強時間の計測終了
- **複数セッション**: 同じユーザーが複数回勉強した場合、時間が累積されます

### 🎨 表示機能
- **リアルタイム表示**: 勉強中のユーザーを緑色「勉強中」で表示（点滅アニメーション）
- **終了状態表示**: 勉強を終了したユーザーを青色「勉強終了」で表示
- **ページネーション**: 3人ずつ表示、10秒間隔で自動切り替え
- **スムーズトランジション**: 1秒のフェードイン・フェードアウト効果

### 🎥 OBS対応
- **透明背景**: クロマキー不要の完全透明背景
- **最適化サイズ**: 配信オーバーレイに適したコンパクトサイズ
- **高視認性**: 40px大文字での名前・時間表示

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
- リアルタイムでポーリング（デフォルト5秒間隔）

### `/src/components/StudyTimeDisplay.tsx`
- ユーザーリストの表示
- ページネーション機能
- フェードトランジション効果

### `/src/app/api/youtube/route.ts`
- YouTube Data API v3のラッパー
- Live Chat メッセージの取得
- エラーハンドリング

## 設定のカスタマイズ

### 表示件数の変更
`/src/components/StudyTimeDisplay.tsx` の `usersPerPage` を変更：

```typescript
const usersPerPage = 3; // お好みの件数に変更
```

### 切り替え間隔の変更
同ファイル内のインターバル時間を変更：

```typescript
}, 10000); // ミリ秒単位（10秒）
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

### モックデータでのテスト
本番APIを使わずにテストする場合は、`/src/hooks/useStudyTime.ts` 内のAPIポーリング部分をコメントアウトし、モックデータを使用してください。

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