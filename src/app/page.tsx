import HomeClient from '@/client/components/HomeClient';

/**
 * Server Component
 * SSEでリアルタイムにユーザー情報を取得
 */
export default async function Home() {
  return <HomeClient />;
}
