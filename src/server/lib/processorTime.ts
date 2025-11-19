import { getAllActiveUsers } from '@/server/lib/storeUser';
import { updateTime } from '../usecases/studyUsecase';

/**
 * 全アクティブユーザーのtimesecを更新
 * - isStudying: trueのユーザーの経過時間を更新
 */
export const updateAllUsersTime = async (now: Date): Promise<void> => {
  const activeUsers = getAllActiveUsers();

  for (const user of activeUsers) {
    await updateTime(user, now)
  }
};
