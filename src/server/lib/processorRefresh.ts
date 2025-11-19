import { parameter } from '@/config/system';
import { getAllActiveUsers } from '@/server/lib/storeUser';
import { resetRefresh } from '@/server/usecases/studyUsecase';

/**
 * 全アクティブユーザーの時間を更新
 * - isStudying: trueのユーザーの時間を更新
 * - refreshIntervalをチェックしてリフレッシュ通知を投稿
 */
export const updateRefresh = async (): Promise<void> => {
  const activeUsers = getAllActiveUsers();

  for (const user of activeUsers) {
    // リフレッシュ通知が必要かチェック
    if (parameter.REFRESH_INTERVAL_TIME <= user.refreshInterval) {
      // リフレッシュ間隔をリセット
      await resetRefresh(user);
    }
  }
};
