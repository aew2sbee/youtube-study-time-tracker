import { logger } from '@/server/lib/logger';
import { parameter } from '@/config/system';
import { REFRESH_MESSAGE } from '@/lib/liveChatMessage';
import { getAllActiveUsers, setUser } from '@/server/lib/userStore';
import { updateTime, resetRefresh } from '@/lib/user';
import { postYouTubeComment } from '@/server/lib/youtubeHelper';

/**
 * 全アクティブユーザーの時間を更新
 * - isStudying: trueのユーザーの時間を更新
 * - refreshIntervalをチェックしてリフレッシュ通知を投稿
 */
export const updateAllUsersTime = async (): Promise<void> => {
  const activeUsers = getAllActiveUsers();
  const now = new Date();

  for (const user of activeUsers) {
    // 時間を更新
    const updatedUser = updateTime(user, now);

    // リフレッシュ通知が必要かチェック
    if (parameter.REFRESH_INTERVAL_TIME <= updatedUser.refreshInterval) {
      // リフレッシュ間隔をリセット
      const refreshedUser = resetRefresh(updatedUser);

      // YouTubeにリフレッシュコメントを投稿
      try {
        const commentMessage = `@${refreshedUser.displayName}: ${REFRESH_MESSAGE}`;
        await postYouTubeComment(commentMessage, refreshedUser.displayName);
        logger.info(`${refreshedUser.displayName}のリフレッシュ通知を投稿しました`);
      } catch (error) {
        logger.error(`${refreshedUser.displayName}のリフレッシュ通知投稿に失敗しました - ${error}`);
      }

      // リセット後の状態を保存
      setUser(refreshedUser);
    } else {
      // 通常の時間更新
      setUser(updatedUser);
    }
  }
};
