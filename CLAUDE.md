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
- リアルタイムデータは、SWRポーリング（1分間隔）で表示する
- YouTube Data APIのquota（割り当て）の使用を最小限にする
- 関数はアロー関数で行うこと
- JSDocを必ず記載すること
- OBS配信用オーバーレイアプリケーションのため、アプリを直接閲覧するのは1人だけです。

## ディレクトリ構造
```bash
src/
├── app/              # App Router（URL構造）
│   └── api/          # APIエンドポイント
│       └── polling/  # ポーリングエンドポイント
├── client/           # クライアント側コード
│   ├── components/   # コンポーネント
│   └── lib/          # クライアント専用ヘルパー
├── server/           # サーバー側コード
│   ├── db/           # DBスキーマ・接続
│   ├── usecases/     # ビジネスロジック
│   ├── repositories/ # DB操作
│   ├── store/        # メモリー管理（userStore等）
│   └── lib/          # サーバー専用ヘルパー
└── types/            # 型定義
```

## データフロー

### クライアント駆動型ポーリング
1. ユーザー: YouTubeライブ配信のチャット欄にコメントする
2. クライアント: SWRで1分間隔でポーリング（/api/pollingを呼び出し）
3. サーバー: YouTube Live Chat APIから新規メッセージを取得
4. サーバー: ビジネスロジック処理（学習開始/終了/時間計算）
5. サーバー: YouTube APIにコメント投稿・DB保存
6. サーバー: userStore（メモリ）に状態を保存
7. サーバー: 最新のユーザー情報をクライアントに返却
8. クライアント: 受信したデータを画面に表示（Framer Motionでアニメーション）

**注意:** この実装はローカル環境またはVPS等の永続サーバーでのみ動作します。Vercelなどのサーバーレス環境では、userStore（メモリ管理）が維持できないため動作しません。

## Claude Code への指示

1. Claude Code との会話は"日本語"で行うこと
2. 生成する md ファイルは"日本語"で記載すること
3. 生成するプログラムのコメントとログの内容は"日本語"で記載すること
