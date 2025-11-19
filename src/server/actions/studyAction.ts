'use server';

import { User } from '@/types/users';
import { youtube_v3 } from 'googleapis';
import { startStudy, restartStudy } from '@/server/usecases/studyUsecase';
import { logger } from '@/server/lib/logger';

/**
 * 学習開始のServer Action
 * クライアントから呼び出され、新規ユーザーの学習開始を処理する
 * @param message - YouTubeライブチャットメッセージ
 * @returns 開始されたユーザー情報、またはエラー情報
 */
export const startStudyAction = async (
  message: youtube_v3.Schema$LiveChatMessage
): Promise<{ success: true; user: User } | { success: false; error: string }> => {
  try {
    logger.info(`${message.authorDetails?.displayName}の学習開始アクションが呼び出されました`);

    const user = await startStudy(message);

    return { success: true, user };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    logger.error(`学習開始アクションが失敗しました - ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

/**
 * 学習再開のServer Action
 * クライアントから呼び出され、既存ユーザーの学習再開を処理する
 * @param user - 既存のユーザー情報
 * @param startTime - 再開時刻
 * @returns 再開されたユーザー情報、またはエラー情報
 */
export const restartStudyAction = async (
  user: User,
  startTime: Date
): Promise<{ success: true; user: User } | { success: false; error: string }> => {
  try {
    logger.info(`${user.displayName}の学習再開アクションが呼び出されました`);

    const restartedUser = await restartStudy(user, startTime);

    return { success: true, user: restartedUser };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    logger.error(`学習再開アクションが失敗しました - ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};
