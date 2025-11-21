import { useSWR, fetcher } from '@/client/lib/useSWR';
import { User } from '@/types/users';

/**
 * ポーリングレスポンス型
 */
interface PollingResponse {
  users: User[];
}

/**
 * ポーリングフックの戻り値型
 */
export interface UsePollingReturn {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * SWRを使用してポーリング処理を実行するカスタムフック
 * - /api/pollingエンドポイントを定期的に呼び出し
 * - サーバー側でYouTube API取得 + ビジネスロジック処理を実行
 * - 最新のユーザー情報を取得
 *
 * @param refreshInterval - ポーリング間隔（ミリ秒）デフォルトは60000（1分）
 * @returns ユーザー一覧とSWR状態
 *
 * @example
 * ```tsx
 * const { users, isLoading, isError } = usePolling();
 *
 * // ポーリング間隔をカスタマイズ
 * const { users } = usePolling(30000); // 30秒間隔
 * ```
 */
export const usePolling = (refreshInterval = 60000): UsePollingReturn => {
  const { data, error, isLoading, mutate } = useSWR<PollingResponse>(
    '/api/polling',
    fetcher,
    {
      // ポーリング間隔（デフォルト1分）
      refreshInterval,
      // ウィンドウフォーカス時に再検証
      revalidateOnFocus: true,
      // 再接続時に再検証
      revalidateOnReconnect: true,
      // 初回マウント時に再検証
      revalidateOnMount: true,
      // エラー時の再試行間隔
      errorRetryInterval: 5000,
      // 最大再試行回数
      errorRetryCount: 3,
      // タイムアウト（2分）
      fetcher: (url: string) =>
        fetch(url).then(res => {
          if (!res.ok) throw new Error('ポーリングに失敗しました');
          return res.json();
        }),
    }
  );

  return {
    users: data?.users || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
};
