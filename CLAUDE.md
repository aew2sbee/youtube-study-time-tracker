# Claude Code 設定

## アプリコンセプト
- コンセプト: [README](README.md)を参照すること

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
- `VIDEO_ID`, `LIVE_CHAT_ID`が未定義or無効な値でもErrorで落ちない

## ディレクトリ構造
```bash
src/
├── app/          # App Router（URL構造）
├── client/       # クライアント側コード
│   ├── components/
│   └── lib/      # クライアント専用ヘルパー
├── server/       # サーバー側コード
│   ├── loaders/      # データ取得
│   ├── actions/      # データ更新（"use server"）
│   ├── usecases/     # ビジネスロジック
│   ├── repositories/ # DB操作
│   ├── db/           # DBスキーマ・接続
│   └── lib/          # サーバー専用ヘルパー
└── types/        # 型定義
```

## データフロー
```bash
User Action
    ↓
Client Component ('use client')
    ↓
Server Action ('use server') ← 副作用処理
    ↓
Usecase (ビジネスロジック統合)
    ↓
Repository (DB操作)
    ↓
Database
    ↓
Loader (データ取得) ← 副作用なし
    ↓
Server Component
    ↓
Client Component (表示)
```

## Claude Code への指示

1. Claude Code との会話は"日本語"で行うこと
2. 生成する md ファイルは"日本語"で記載すること
3. 生成するプログラムのコメントとログの内容は"日本語"で記載すること
