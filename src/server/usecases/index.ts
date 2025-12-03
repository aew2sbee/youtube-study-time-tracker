import { setUserByMessage } from './messageUsecase';
import { updateAllUsersTime } from './timeUsecase';
import { updateRefresh } from './refreshUsecase';
import { processQueue } from '@/server/store/post';
import { logger } from '@/server/lib/logger';

/**
 * メインポーリング処理
 * 全てのユースケースを統合して実行する
 *
 * 処理フロー:
 * 1. チャットメッセージ処理（新規開始・再開・終了・カテゴリ更新）
 * 2. 時間更新処理（全アクティブユーザーの学習時間を更新）
 * 3. リフレッシュ処理（一定時間経過したユーザーにリフレッシュ通知）
 * 4. コメントを投稿する（キューに溜まったコメントを順次投稿）
 *
 * @param now - 現在時刻
 */
export const processPolling = async (): Promise<void> => {
  try {
    // チャットメッセージ処理
    await setUserByMessage();
    // 時間更新処理
    await updateAllUsersTime();
    // リフレッシュ処理
    await updateRefresh();
    // コメントを投稿する
    await processQueue();
  } catch (error) {
    logger.error(`ポーリング処理中にエラーが発生しました - ${error}`);
    throw error;
  }
};
