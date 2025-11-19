# Claude Code 設定

## アプリコンセプト
- [README](README.md)を参照すること

## 技術選定

- フレームワーク・ライブラリ
  - Next.js(App Router)
  - React
  - TypeScript
  - Google APIs
- データベース・ORM
  - Supabase
  - Drizzle ORM
  - postgres
- UI・スタイリング
  - Tailwind CSS
  - Framer Motion
  - Lucide React

## 実装ルール
- SEO対応は不要
- データフロー全体像に従う
- "サーバー側"でデータ取得・加工・変換処理を行う
- "クライアント側"でデータ表示だけを行う
- 画像は、`next/image`コンポーネントで最適化(自動的な画像リサイズ、遅延読み込み)を行う
- リアルタイムデータは、SSR(Server-Side Rendering)で表示する
- YouTube Data APIのquota（割り当て）の使用を最小限にする
- 関数はアロー関数で行うこと
- JSDocを必ず記載すること
- `LIVE_CHAT_ID`は、build時に初期化されるグローバル定数で`src/server/lib/constants.ts`で管理する

## ディレクトリ構造
```bash
./
├── instrumentation.ts  # Next.js Instrumentation Hook（サーバー起動時の初期化処理）
src/
├── app/          # App Router（URL構造）
├── client/       # クライアント側コード
│   ├── components/
│   ├── hooks/        # カスタムフック
│   └── lib/          # クライアント専用ヘルパー
├── server/       # サーバー側コード
│   ├── usecases/     # ビジネスロジック
│   ├── repositories/ # DB操作
│   ├── db/           # DBスキーマ・接続
│   └── lib/          # サーバー専用ヘルパー
│       ├── userStore.ts       # ユーザー状態管理（メモリストア + SSE通知）
│       ├── processorMessage.ts # メッセージ処理
│       ├── processorTime.ts   # 時間更新処理
│       └── youtubeHelper.ts   # YouTube API ヘルパー
└── types/        # 型定義
```

## データフロー

### バックグラウンド処理（サーバー側）
```bash
instrumentation.ts (Next.js起動時に自動実行)
    ├─ メッセージポーリング（API_POLLING_INTERVAL毎）
    │   ├─ YouTube Live Chat API (getLiveChatMessages)
    │   ├─ setUserByMessage (メッセージ判定・処理)
    │   ├─ Usecase (startStudy/restartStudy/endStudy/updateCategory)
    │   └─ UserStore (メモリ管理: Map<channelId, User>)
    │       └─ SSE通知 (EventEmitter)
    │
    └─ 時間更新処理（API_POLLING_INTERVAL毎）
        ├─ updateAllUsersTime
        ├─ UserStore (時間・リフレッシュ間隔を更新)
        │   └─ SSE通知 (EventEmitter)
        └─ リフレッシュ通知（1時間ごと）→ YouTube API
```

### クライアント表示（SSE）
```bash
Client Component (useUserStream)
    ↓ SSE接続
GET /api/users/stream
    ↓ リアルタイムプッシュ
UserStore (EventEmitter経由)
    ↓
表示（時間計測・ページネーション）
```

### DB保存（学習終了時のみ）
```bash
endStudy (Usecase)
    ↓
Repository (saveLog)
    ↓
Database (Supabase)
```

## Claude Code への指示

1. Claude Code との会話は"日本語"で行うこと
2. 生成する md ファイルは"日本語"で記載すること
3. 生成するプログラムのコメントとログの内容は"日本語"で記載すること
