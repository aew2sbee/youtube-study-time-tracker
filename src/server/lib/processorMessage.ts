import { logger } from '@/server/lib/logger';
import { isCategoryMessage, isEndMessage, isStartMessage } from '@/server/lib/messages';
import { startStudy, restartStudy, endStudy, updateCategory } from '@/server/usecases/studyUsecase';
import { getUser } from '@/server/lib/storeUser';
import { getLiveChatMessages } from '@/server/lib/youtubeHelper';

/**
 * 個別メッセージの処理
 * - メッセージタイプを判定
 * - 適切なUsecaseを直接呼び出し
 * - メモリストアに状態を保存
 * @param now - 現在時刻（学習再開・終了時の時刻として使用）
 */
export const setUserByMessage = async (now: Date): Promise<void> => {
  const messages = await getLiveChatMessages();
  if (messages.length > 0) {
    logger.info(`${messages.length}件のメッセージを取得しました`);

    // 各メッセージを処理
    for (const message of messages) {

      const existingUser = getUser(message.channelId);
      if (existingUser) {
        // 既存ユーザーの処理
        if (isStartMessage(message.displayMessage) && !existingUser.isStudying) {
          // 学習再開
          await restartStudy(existingUser, now);
          logger.info(`${existingUser.displayName}の学習を再開しました`);
        } else if (isEndMessage(message.displayMessage) && existingUser.isStudying) {
          // 学習終了
          await endStudy(existingUser, now);
          logger.info(`${existingUser.displayName}の学習を終了しました`);
        } else if (isCategoryMessage(message.displayMessage) && existingUser.isStudying) {
          // カテゴリー更新
          updateCategory(existingUser, message.displayMessage);
          logger.info(`${existingUser.displayName}のカテゴリーを更新しました: ${message.displayMessage}`);
        }
      } else {
        // 新規ユーザーの処理
        if (isStartMessage(message.displayMessage)) {
          // 学習開始
          await startStudy(message, now);
          logger.info(`${message.displayName}の学習を開始しました`);
        }
      }
    }
  } else {
    logger.info('新しいメッセージはありません');
  }
};
