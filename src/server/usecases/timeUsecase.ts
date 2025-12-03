import { getAllActiveUsers } from '@/server/store/user';
import { updateTime } from '../usecases/userUsecase';

/**
 * 全アクティブユーザーのtimesecを更新
 * - isStudying: trueのユーザーの経過時間を更新
 */
export const updateAllUsersTime = async (): Promise<void> => {
  const now = new Date();
  const activeUsers = getAllActiveUsers();

  for (const user of activeUsers) {
    await updateTime(user, now);
  }
};
