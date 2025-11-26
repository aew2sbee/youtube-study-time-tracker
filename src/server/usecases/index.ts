import { setTimeByMessage, updateAllUsersTime, updateRefresh } from './timeUsecase';
import { setGameByMessage, checkLevelup, updateStatus } from './gameUsecase';
import { processQueue } from '@/server/store/post';
import { logger } from '@/server/lib/logger';
import { parameter } from '@/config/system';
import { getLiveChatMessages } from '../lib/youtubeHelper';

/**
 * メインポーリング処理
 * 全てのユースケースを統合して実行する
 *
 * 処理フロー:
 * 1. チャットメッセージ処理（新規開始・再開・終了・カテゴリ更新）
 * 2. 時間更新処理（全アクティブユーザーの学習時間を更新）
 * 3. リフレッシュ処理（一定時間経過したユーザーにリフレッシュ通知）
 * 4. コメントを投稿する（キューに溜まったコメントを順次投稿）
 */
export const processPolling = async (): Promise<void> => {
  try {
    const now = new Date();
    const messages = await getLiveChatMessages();

    // チャットメッセージ処理
    await setTimeByMessage(messages);
    // 時間更新処理
    await updateAllUsersTime(now);
    // リフレッシュ処理
    await updateRefresh();
    // ゲームモード
    await setGameByMessage(messages);
    // レベルアップ確認処理
    await checkLevelup(now);
    // ステータス更新処理
    await updateStatus(now);
    // コメントを投稿する
    if (parameter.IS_COMMENT_ENABLED) {
      await processQueue();
    } else {
      logger.info('コメント投稿は無効化されています');
    }
  } catch (error) {
    logger.error(`ポーリング処理中にエラーが発生しました - ${error}`);
    throw error;
  }
};
