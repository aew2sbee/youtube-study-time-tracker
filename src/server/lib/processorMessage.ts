import { youtube_v3 } from 'googleapis';
import { logger } from '@/server/lib/logger';
import { isCategoryMessage, isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { startStudy, restartStudy, endStudy, updateCategory } from '@/server/usecases/studyUsecase';
import { getUser } from '@/server/lib/userStore';
import { removeMentionPrefix } from '@/server/lib/youtubeHelper';

/**
 * 個別メッセージの処理
 * - メッセージタイプを判定
 * - 適切なUsecaseを直接呼び出し
 * - メモリストアに状態を保存
 */
export const setUserByMessage = async (message: youtube_v3.Schema$LiveChatMessage): Promise<void> => {
  const messageText = (message.snippet?.displayMessage || '').toLowerCase().trim();
  const publishedAt = new Date(message.snippet?.publishedAt || '');
  const channelId = message.authorDetails?.channelId;

  if (!channelId) return;

  const existingUser = getUser(channelId);

  if (existingUser) {
    // 既存ユーザーの処理
    if (isStartMessage(messageText) && !existingUser.isStudying) {
      // 学習再開
      await restartStudy(existingUser, publishedAt);
      logger.info(`${existingUser.displayName}の学習を再開しました`);
    } else if (isEndMessage(messageText) && existingUser.isStudying) {
      // 学習終了
      await endStudy(existingUser, publishedAt);
      logger.info(`${existingUser.displayName}の学習を終了しました`);
    } else if (isCategoryMessage(messageText) && existingUser.isStudying) {
      // カテゴリー更新
      updateCategory(existingUser, messageText);
      logger.info(`${existingUser.displayName}のカテゴリーを更新しました: ${messageText}`);
    }
  } else {
    // 新規ユーザーの処理
    if (isStartMessage(messageText)) {
      // 学習開始
      await startStudy(message);
      const displayName = removeMentionPrefix(message.authorDetails?.displayName || '');
      logger.info(`${displayName}の学習を開始しました`);
    }
  }
};
