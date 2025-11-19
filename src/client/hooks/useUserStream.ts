import { useState, useEffect } from 'react';
import { User } from '@/types/users';

interface UseUserStreamReturn {
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * SSEでユーザー情報をリアルタイム取得するカスタムフック
 * - Server-Sent Eventsを使用してサーバーからプッシュ通知を受け取る
 * - useSWRのポーリングを置き換え
 */
export const useUserStream = (): UseUserStreamReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        // SSE接続を開始
        eventSource = new EventSource('/api/users/stream');

        // メッセージ受信時の処理
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setUsers(data.users);
            setIsLoading(false);
            setError(null);
          } catch (err) {
            console.error('SSEデータのパースエラー:', err);
            setError(err instanceof Error ? err : new Error('データパースエラー'));
          }
        };

        // 接続開始時の処理
        eventSource.onopen = () => {
          console.log('SSE接続を確立しました');
          setError(null);
        };

        // エラー時の処理
        eventSource.onerror = (err) => {
          console.error('SSE接続エラー:', err);
          setError(new Error('SSE接続エラー'));
          setIsLoading(false);

          // 接続をクローズ
          if (eventSource) {
            eventSource.close();
          }

          // 5秒後に再接続を試みる
          setTimeout(() => {
            console.log('SSE再接続を試みています...');
            connectSSE();
          }, 5000);
        };
      } catch (err) {
        console.error('SSE初期化エラー:', err);
        setError(err instanceof Error ? err : new Error('SSE初期化エラー'));
        setIsLoading(false);
      }
    };

    // SSE接続を開始
    connectSSE();

    // クリーンアップ: コンポーネントのアンマウント時に接続をクローズ
    return () => {
      if (eventSource) {
        console.log('SSE接続をクローズします');
        eventSource.close();
      }
    };
  }, []); // 空の依存配列 = マウント時に1回だけ実行

  return { users, isLoading, error };
};
