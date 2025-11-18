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
- "サーバー側"でデータ取得・加工・変換処理を行う
- "クライアント側"でデータ表示だけを行う
- 画像は、`next/image`コンポーネントで最適化(自動的な画像リサイズ、遅延読み込み)を行う
- 静的サイトは、`SSG(Static Site Generation)`で生成する
- YouTube Data APIのquota（割り当て）の使用を最小限にする
- 関数はアロー関数で行うこと
- JSDocを必ず記載すること

---

## 📋 Next.js 実装ルール（最優先）

### 基本原則

1. **サーバーコンポーネント優先**
   - 動的に更新する必要がある画面（チャットなど）以外は、データ取得はなるべくサーバーコンポーネントに寄せる
   - クライアント側で動作する必然性（状態管理・ブラウザAPI利用・重いUIライブラリ等）がない限り `"use client"` は利用しない

2. **責務の分離**
   - サーバーコンポーネントからのデータ取得は、原則 `loaders` などに切り出したサーバー処理を使い責務を分離する
   - サーバー側で動作することを期待する処理には `import "server-only"` を書き、誤ってクライアントから参照されないようにする

3. **サーバーアクションの適切な使用**
   - サーバーアクション（`"use server"`処理）は、データ更新やファイルアップロードなど**副作用を伴う操作のためだけ**に使う
   - あわせて `revalidatePath` や `revalidateTag` などの再検証処理までを1セットで行う

4. **クライアント側データ取得の制限**
   - クライアント側でのデータ取得は例外として、以下に限って許容する：
     - リアルタイム通信
     - 高頻度ポーリング
     - ユーザー操作に即応する検索
     - オフライン最適化（React Query など）

---

## 1. App Router（アプリルーター）

**推奨度**: ⭐⭐⭐⭐⭐

Next.js 13以降で導入された新しいルーティングシステム。従来のPages Routerよりも柔軟で強力です。

### 特徴
- ファイルシステムベースのルーティング
- レイアウトとネストされたルーティングのサポート
- Server ComponentsとClient Componentsの統合
- ストリーミングとSuspenseのネイティブサポート

### 推奨ディレクトリ構造
```
src/
├── app/                    # App Router（URL構造に対応）
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # トップページ
│   ├── loading.tsx         # ローディング状態
│   ├── error.tsx           # エラーハンドリング
│   ├── api/                # APIエンドポイント
│   │   └── users/
│   │       └── route.ts
│   └── dashboard/
│       ├── layout.tsx      # ダッシュボードレイアウト
│       └── page.tsx        # ダッシュボードページ
├── client/                 # クライアント側のコード
│   ├── components/         # Reactコンポーネント
│   │   ├── ui/             # 再利用可能なUIコンポーネント
│   │   └── features/       # 機能固有のコンポーネント
│   └── lib/                # クライアントで動作するヘルパー
│       └── utils.ts
├── server/                 # サーバー側のコード
│   ├── loaders/            # データ取得処理（"use server"不要）
│   │   └── userLoader.ts
│   ├── actions/            # サーバーアクション（"use server"）
│   │   └── userActions.ts
│   ├── usecases/           # ビジネスロジック統合層
│   │   └── userUsecase.ts
│   ├── repositories/       # データベースアクセス層
│   │   └── userRepository.ts
│   ├── lib/                # データ加工・変換処理
│   │   └── dataTransform.ts
│   └── auth/               # 認証関連処理
│       └── session.ts
└── types/                  # 型定義
    └── user.ts
```

---

## 2. Server Components First（サーバーコンポーネント優先）

**推奨度**: ⭐⭐⭐⭐⭐

### 原則
デフォルトでServer Componentsを使用し、必要な場合のみClient Componentsを使用します。

### Server Componentsの利点
- JavaScriptバンドルサイズの削減
- サーバー側でのデータフェッチング
- セキュアなAPIキーの使用
- SEO対策に有利

### Server-Only パッケージの使用（推奨）

サーバー専用のコードが誤ってクライアントにバンドルされるのを防ぎます：

```bash
npm install server-only
```

```tsx
// server/loaders/userLoader.ts
import "server-only"

// このファイルはサーバーでのみ実行可能
export const getUserData = async (userId: string) => {
  const apiKey = process.env.SECRET_API_KEY // 安全
  // データ取得処理
}
```

クライアント側から誤って import するとビルドエラーになります。

### Loaders パターン（データ取得）

サーバーコンポーネントでのデータ取得は `loaders` に分離します：

```tsx
// server/loaders/userLoader.ts
import "server-only"
import { getUserByChannelId } from "@/server/repositories/userRepository"

export const loadUserProfile = async (channelId: string) => {
  const user = await getUserByChannelId(channelId)

  if (!user) {
    throw new Error("ユーザーが見つかりません")
  }

  return {
    name: user.name,
    channelId: user.channelId,
    profileImageUrl: user.profileImageUrl,
  }
}
```

```tsx
// app/users/[channelId]/page.tsx
import { loadUserProfile } from "@/server/loaders/userLoader"

const UserProfilePage = async ({ params }: { params: { channelId: string } }) => {
  const user = await loadUserProfile(params.channelId)

  return (
    <div>
      <h1>{user.name}</h1>
      <img src={user.profileImageUrl} alt={user.name} />
    </div>
  )
}

export default UserProfilePage
```

### Client Componentsが必要な場合

以下の場合**のみ** `'use client'` を使用：

```tsx
// client/components/Counter.tsx
'use client'

import { useState } from 'react'

export const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

**Client Componentsの使用条件**:
- `useState`, `useEffect`などのReact Hooks使用時
- ブラウザAPIの使用時（`window`, `localStorage`など）
- イベントハンドラー（`onClick`, `onChange`など）
- カスタムフックの使用時
- リアルタイム通信（WebSocket など）
- 高頻度ポーリング

---


### SSR (Server-Side Rendering)
**最適な用途**: ユーザー固有のダッシュボード、リアルタイムデータ

```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'

const Dashboard = async () => {
  const data = await fetchUserData()
  return <div>{data}</div>
}

export default Dashboard
```

### ISR (Incremental Static Regeneration)
**最適な用途**: ニュースサイト、ECサイトの商品ページ

```tsx
export const revalidate = 3600 // 1時間ごとに再生成

const ProductPage = async ({ params }: { params: { id: string } }) => {
  const product = await getProduct(params.id)
  return <div>{product.name}</div>
}

export default ProductPage
```

---

## 4. 画像・フォント最適化

### next/image
**推奨度**: ⭐⭐⭐⭐⭐

```tsx
import Image from 'next/image'

const Hero = () => {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero Image"
      width={1200}
      height={600}
      priority // LCPの改善
      placeholder="blur" // ぼかし効果
    />
  )
}

export default Hero
```

### 利点
- 自動的な画像最適化
- レイアウトシフトの防止
- 遅延読み込み
- WebP/AVIFへの自動変換

### next/font
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}

export default RootLayout
```

---

## 5. データフェッチングパターン

### Loaders によるデータ取得（推奨）

**原則**: サーバーコンポーネントでのデータ取得は `loaders` に分離します。

```tsx
// server/loaders/productLoader.ts
import "server-only"
import { getProductById } from "@/server/repositories/productRepository"

/**
 * 商品データを取得する
 */
export const loadProduct = async (productId: string) => {
  const product = await getProductById(productId)

  if (!product) {
    throw new Error("商品が見つかりません")
  }

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
  }
}
```

```tsx
// app/products/[id]/page.tsx
import { loadProduct } from "@/server/loaders/productLoader"

const ProductPage = async ({ params }: { params: { id: string } }) => {
  const product = await loadProduct(params.id)

  return (
    <div>
      <h1>{product.name}</h1>
      <p>¥{product.price}</p>
    </div>
  )
}

export default ProductPage
```

### 外部APIフェッチの場合

```tsx
// server/loaders/externalDataLoader.ts
import "server-only"

export const loadExternalData = async () => {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 60秒キャッシュ
  })

  if (!res.ok) throw new Error('データ取得に失敗しました')

  return res.json()
}
```

### キャッシング戦略

```tsx
// キャッシュなし（常に最新データ）
fetch(url, { cache: 'no-store' })

// 時間ベースの再検証（60分ごと）
fetch(url, { next: { revalidate: 3600 } })

// タグベースの再検証（revalidateTagで一括更新）
fetch(url, { next: { tags: ['products'] } })
```

### クライアント側データ取得（例外的）

**以下の場合のみ許容**:
- リアルタイム通信（WebSocket など）
- 高頻度ポーリング
- ユーザー操作に即応する検索
- オフライン最適化（React Query など）

```tsx
// client/components/RealtimeChat.tsx
'use client'

import { useEffect, useState } from 'react'

export const RealtimeChat = () => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // WebSocket接続（リアルタイム通信）
    const ws = new WebSocket('wss://example.com/chat')

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)])
    }

    return () => ws.close()
  }, [])

  return <div>{/* チャット表示 */}</div>
}
```

---

## 6. ファイルベースルーティング規約

### 特殊ファイル
| ファイル名 | 用途 |
|----------|------|
| `layout.tsx` | 共通レイアウト |
| `page.tsx` | ページコンテンツ |
| `loading.tsx` | ローディング状態 |
| `error.tsx` | エラーハンドリング |
| `not-found.tsx` | 404ページ |
| `route.ts` | APIルート |

### 動的ルート
```
app/
├── blog/
│   └── [slug]/
│       └── page.tsx          # /blog/hello-world
└── shop/
    └── [...categories]/
        └── page.tsx          # /shop/electronics/phones
```

---

## 7. コロケーション（Colocation）とディレクトリ構成

**推奨度**: ⭐⭐⭐⭐⭐

関連するファイルを適切に配置し、責務を明確に分離する原則。

### 推奨ディレクトリ構成（詳細版）

```
src/
├── app/                      # App Router（URL構造）
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/                  # APIエンドポイント
│   │   └── users/
│   │       └── route.ts
│   └── dashboard/
│       ├── layout.tsx
│       └── page.tsx
│
├── client/                   # クライアント側コード
│   ├── components/           # Reactコンポーネント
│   │   ├── ui/               # 再利用可能なUIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   └── features/         # 機能固有のコンポーネント
│   │       └── UserProfile.tsx
│   └── lib/                  # クライアントで動作するヘルパー
│       ├── utils.ts
│       └── formatters.ts
│
├── server/                   # サーバー側コード
│   ├── loaders/              # データ取得処理
│   │   └── userLoader.ts
│   ├── actions/              # サーバーアクション（副作用）
│   │   └── userActions.ts
│   ├── usecases/             # ビジネスロジック統合層
│   │   └── userUsecase.ts
│   ├── repositories/         # データベースアクセス層
│   │   ├── userRepository.ts
│   │   └── postRepository.ts
│   ├── lib/                  # データ加工・変換処理
│   │   ├── dataTransform.ts
│   │   └── validators.ts
│   └── auth/                 # 認証関連処理
│       └── session.ts
│
└── types/                    # 型定義（共通）
    ├── user.ts
    └── post.ts
```

### 各ディレクトリの責務

| ディレクトリ | 責務 | "use client" | "server-only" |
|------------|------|-------------|---------------|
| `app/` | ルーティング・APIエンドポイント | 不要（Server Component） | - |
| `client/components/` | Reactコンポーネント | 必要な場合のみ | ❌ |
| `client/lib/` | クライアントヘルパー | 不要 | ❌ |
| `server/loaders/` | データ取得処理 | ❌ | ✅ 推奨 |
| `server/actions/` | 副作用処理（更新等） | ❌（'use server'） | ✅ 推奨 |
| `server/usecases/` | ビジネスロジック | ❌ | ✅ 推奨 |
| `server/repositories/` | DB操作 | ❌ | ✅ 推奨 |
| `server/lib/` | サーバーヘルパー | ❌ | ✅ 推奨 |
| `types/` | 型定義 | 不要 | - |

### プライベートフォルダ（`_` プレフィックス）

`_`で始まるフォルダはルーティングから除外されます：

```
app/
└── dashboard/
    ├── _components/          # プライベートコンポーネント
    │   ├── Header.tsx
    │   └── Sidebar.tsx
    ├── _lib/                 # プライベートユーティリティ
    │   └── analytics.ts
    ├── layout.tsx
    └── page.tsx
```

---

## 8. パフォーマンス最適化

### コード分割
```tsx
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // クライアントサイドのみで読み込む
})
```

### ストリーミングとSuspense
```tsx
import { Suspense } from 'react'

const Page = () => {
  return (
    <div>
      <h1>My Page</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}

export default Page
```

---

## 9. TypeScript統合

**推奨度**: ⭐⭐⭐⭐⭐

```tsx
// app/blog/[slug]/page.tsx
interface PageProps {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const Page = async ({ params, searchParams }: PageProps) => {
  // 型安全なコード
}

export default Page
```

---

## 10. 環境変数の管理

### ファイル構成
```
.env.local          # ローカル開発用（Gitignore）
.env.development    # 開発環境
.env.production     # 本番環境
```

### 使用方法
```tsx
// サーバーサイド専用
const apiKey = process.env.API_SECRET_KEY

// クライアントサイドで使用可能
const publicKey = process.env.NEXT_PUBLIC_API_KEY
```

---

## 11. セキュリティベストプラクティスとServer Actions

### Server Actions の適切な使用

**重要**: Server Actionsは**副作用を伴う操作（データ更新・ファイルアップロード等）専用**です。

```tsx
// server/actions/postActions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createPostInDb } from '@/server/repositories/postRepository'

/**
 * 投稿を作成し、キャッシュを再検証する
 */
export const createPostAction = async (formData: FormData) => {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // バリデーション
  if (!title || title.length < 1) {
    return { success: false, error: 'タイトルは必須です' }
  }

  try {
    // データベース操作
    const post = await createPostInDb({ title, content })

    // キャッシュ再検証（必須！）
    revalidatePath('/posts')
    revalidateTag('posts-list')

    return { success: true, post }
  } catch (error) {
    return { success: false, error: '投稿の作成に失敗しました' }
  }
}
```

### Server Actions の使用ルール

1. **副作用のみ**: データ取得は loader を使用し、Server Actions は更新・削除・作成のみに使用
2. **再検証は必須**: `revalidatePath` または `revalidateTag` を必ずセットで実行
3. **エラーハンドリング**: try-catch でエラーを適切に処理し、クライアントに返す
4. **バリデーション**: サーバー側でも必ず入力値を検証

### Client Component での使用例

```tsx
// client/components/PostForm.tsx
'use client'

import { createPostAction } from '@/server/actions/postActions'
import { useState } from 'react'

export const PostForm = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = async (formData: FormData) => {
    const result = await createPostAction(formData)

    if (result.success) {
      setMessage('投稿を作成しました')
    } else {
      setMessage(result.error || '不明なエラー')
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">投稿</button>
      {message && <p>{message}</p>}
    </form>
  )
}
```

### キャッシュ再検証の使い分け

```tsx
// パスベースの再検証（特定のページ）
revalidatePath('/posts')
revalidatePath('/posts/[id]', 'page')

// タグベースの再検証（複数ページに影響）
revalidateTag('posts-list')

// 両方を組み合わせることも可能
revalidatePath('/dashboard')
revalidateTag('user-data')
```

### CSRFトークン不要
Server Actionsは自動的にCSRF保護されます。

---

## 12. メタデータとSEO

### 静的メタデータ
```tsx
export const metadata = {
  title: 'My App',
  description: 'My App Description',
  openGraph: {
    images: ['/og-image.jpg'],
  },
}
```

### 動的メタデータ
```tsx
export const generateMetadata = async ({ params }: { params: { id: string } }) => {
  const product = await getProduct(params.id)

  return {
    title: product.name,
    description: product.description,
  }
}
```

---

## まとめ

### 最も重要な実装ルール（必須）

1. **サーバーコンポーネント優先**
   - デフォルトでServer Componentsを使用
   - `"use client"`は最小限に（状態管理・ブラウザAPI・イベントハンドラーのみ）

2. **責務の明確な分離**
   - データ取得 → `server/loaders/`（"use server"不要）
   - データ更新 → `server/actions/`（"use server"必須）
   - ビジネスロジック → `server/usecases/`
   - DB操作 → `server/repositories/`
   - UI → `client/components/`

3. **server-onlyの活用**
   - サーバー専用コードには必ず `import "server-only"` を追加
   - クライアントへの誤バンドルを防止

4. **Server Actionsの適切な使用**
   - 副作用（データ更新・ファイルアップロード）専用
   - `revalidatePath` または `revalidateTag` を必ずセットで実行

5. **クライアント側データ取得の制限**
   - 原則サーバー側で取得
   - 例外：リアルタイム通信・高頻度ポーリング・即応検索のみ

### 推奨ディレクトリ構成

```
src/
├── app/          # App Router（URL構造）
├── client/       # クライアント側コード
│   ├── components/
│   └── lib/
├── server/       # サーバー側コード
│   ├── loaders/      # データ取得
│   ├── actions/      # データ更新（"use server"）
│   ├── usecases/     # ビジネスロジック
│   ├── repositories/ # DB操作
│   └── lib/          # ヘルパー
└── types/        # 型定義
```

### その他の重要なポイント

- **App Router**を使用する
- 適切な**レンダリング戦略**を選択する（SSG/SSR/ISR）
- **next/image**と**next/font**で最適化する
- **TypeScript**を活用する
- **アロー関数**で記述する（プロジェクトルール）

これらのベストプラクティスに従うことで、高性能でメンテナンスしやすく、セキュアなNext.jsアプリケーションを構築できます。

---

## 13. レイヤー別実装例（完全版）

### データフロー全体像

```
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

### 実装例：ユーザー登録フロー

#### 1. 型定義（`types/user.ts`）
```tsx
export type User = {
  id: string
  name: string
  email: string
  createdAt: Date
}

export type CreateUserInput = {
  name: string
  email: string
}
```

#### 2. Repository層（`server/repositories/userRepository.ts`）
```tsx
import "server-only"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { CreateUserInput, User } from "@/types/user"

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const [newUser] = await db.insert(users).values(input).returning()
  return newUser
}

export const getUserById = async (id: string): Promise<User | null> => {
  const [user] = await db.select().from(users).where(eq(users.id, id))
  return user || null
}
```

#### 3. Usecase層（`server/usecases/userUsecase.ts`）
```tsx
import "server-only"
import { createUser, getUserById } from "@/server/repositories/userRepository"
import type { CreateUserInput } from "@/types/user"

export const registerUser = async (input: CreateUserInput) => {
  // バリデーション
  if (!input.email.includes('@')) {
    throw new Error('有効なメールアドレスを入力してください')
  }

  // ビジネスロジック
  const user = await createUser(input)

  // 通知などの追加処理
  // await sendWelcomeEmail(user.email)

  return user
}
```

#### 4. Server Action（`server/actions/userActions.ts`）
```tsx
'use server'

import { revalidatePath } from 'next/cache'
import { registerUser } from "@/server/usecases/userUsecase"

export const registerUserAction = async (formData: FormData) => {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  try {
    const user = await registerUser({ name, email })

    // キャッシュ再検証
    revalidatePath('/users')

    return { success: true, user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}
```

#### 5. Loader（`server/loaders/userLoader.ts`）
```tsx
import "server-only"
import { getUserById } from "@/server/repositories/userRepository"

export const loadUser = async (userId: string) => {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('ユーザーが見つかりません')
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}
```

#### 6. Client Component（`client/components/UserRegistrationForm.tsx`）
```tsx
'use client'

import { registerUserAction } from "@/server/actions/userActions"
import { useState } from 'react'

export const UserRegistrationForm = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = async (formData: FormData) => {
    const result = await registerUserAction(formData)

    if (result.success) {
      setMessage(`登録完了: ${result.user.name}`)
    } else {
      setMessage(`エラー: ${result.error}`)
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="名前" required />
      <input name="email" type="email" placeholder="メール" required />
      <button type="submit">登録</button>
      {message && <p>{message}</p>}
    </form>
  )
}
```

#### 7. Server Component（`app/users/[id]/page.tsx`）
```tsx
import { loadUser } from "@/server/loaders/userLoader"

// アロー関数で定義（プロジェクトルール）
const UserPage = async ({ params }: { params: { id: string } }) => {
  const user = await loadUser(params.id)

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

export default UserPage
```

## Claude Code への指示

1. Claude Code との会話は"日本語"で行うこと
2. 生成する md ファイルは"日本語"で記載すること
3. 生成するプログラムのコメントとログの内容は"日本語"で記載すること
