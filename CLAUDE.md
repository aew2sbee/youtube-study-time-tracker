# Next.js ベストプラクティス

## 概要
Next.jsの開発における最も有名で合理的なベストプラクティスをまとめたドキュメントです。

---

## 1. App Router（アプリルーター）

**推奨度**: ⭐⭐⭐⭐⭐

Next.js 13以降で導入された新しいルーティングシステム。従来のPages Routerよりも柔軟で強力です。

### 特徴
- ファイルシステムベースのルーティング
- レイアウトとネストされたルーティングのサポート
- Server ComponentsとClient Componentsの統合
- ストリーミングとSuspenseのネイティブサポート

### ディレクトリ構造
```
app/
├── layout.tsx          # ルートレイアウト
├── page.tsx            # トップページ
├── loading.tsx         # ローディング状態
├── error.tsx           # エラーハンドリング
└── dashboard/
    ├── layout.tsx      # ダッシュボードレイアウト
    └── page.tsx        # ダッシュボードページ
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

### Client Componentsが必要な場合
```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

以下の場合にのみ`'use client'`を使用：
- `useState`, `useEffect`などのReact Hooks使用時
- ブラウザAPIの使用時（`window`, `localStorage`など）
- イベントハンドラー（`onClick`, `onChange`など）
- カスタムフックの使用時

---

## 3. レンダリング戦略

### SSG (Static Site Generation)
**最適な用途**: ブログ、マーケティングサイト、ドキュメント

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}
```

### SSR (Server-Side Rendering)
**最適な用途**: ユーザー固有のダッシュボード、リアルタイムデータ

```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const data = await fetchUserData()
  return <div>{data}</div>
}
```

### ISR (Incremental Static Regeneration)
**最適な用途**: ニュースサイト、ECサイトの商品ページ

```tsx
export const revalidate = 3600 // 1時間ごとに再生成

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)
  return <div>{product.name}</div>
}
```

---

## 4. 画像・フォント最適化

### next/image
**推奨度**: ⭐⭐⭐⭐⭐

```tsx
import Image from 'next/image'

export default function Hero() {
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

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 5. データフェッチングパターン

### Server Componentsでの直接フェッチ
```tsx
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 60秒キャッシュ
  })
  
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data.title}</div>
}
```

### キャッシング戦略
```tsx
// キャッシュなし
fetch(url, { cache: 'no-store' })

// 時間ベースの再検証
fetch(url, { next: { revalidate: 3600 } })

// タグベースの再検証
fetch(url, { next: { tags: ['products'] } })
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

## 7. コロケーション（Colocation）

**推奨度**: ⭐⭐⭐⭐

関連するファイルを近くに配置する原則。

### ディレクトリ構造例
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

### プライベートフォルダ
`_`で始まるフォルダはルーティングから除外されます。

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

export default function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
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

export default async function Page({ params, searchParams }: PageProps) {
  // 型安全なコード
}
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

## 11. セキュリティベストプラクティス

### Server Actionsの使用
```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  
  // データベース操作
  await db.post.create({ data: { title } })
  
  revalidatePath('/posts')
}
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
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id)
  
  return {
    title: product.name,
    description: product.description,
  }
}
```

---

## まとめ

Next.jsの開発で最も重要なポイント：

1. **App Router**を使用する
2. **Server Components First**の原則を守る
3. 適切な**レンダリング戦略**を選択する
4. **next/image**と**next/font**で最適化する
5. **TypeScript**を活用する
6. **コロケーション**で保守性を向上させる

これらのベストプラクティスに従うことで、高性能でメンテナンスしやすいNext.jsアプリケーションを構築できます。

---

**参考リンク**
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)


## Claude Code への指示

1. Claude Code との会話は"日本語"で行うこと
2. 生成する md ファイルは"日本語"で記載すること
3. 生成するプログラムのコメントとログの内容は"日本語"で記載すること