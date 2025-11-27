import { parameter } from '@/config/system';
import { calcStudyTime } from '@/server/lib/calcTime';
import { logger } from '@/server/lib/logger';
import {
  isEndMessage,
  isStartMessage,
  RESTART_MESSAGE,
  getStartMessageByUser,
  getEndMessageByUser,
  getRefreshMessageByUser,
} from '@/server/lib/messages';
import { getStudyDaysByChannelId, saveLog } from '@/server/repositories/studyRepository';
import { pushQueue } from '@/server/store/post';
import { getAllActiveUsers, getUser, setUser } from '@/server/store/user';
import { User } from '@/types/users';
import { LiveChatMessage } from '@/types/youtube';

/**
 * 個別メッセージの処理
 * - メッセージタイプを判定
 * - 適切なUsecaseを直接呼び出し
 * - メモリストアに状態を保存
 * @param now - 現在時刻（学習再開・終了時の時刻として使用）
 */
export const setTimeByMessage = async (messages: LiveChatMessage[]): Promise<void> => {
  if (messages.length > 0) {
    logger.info(`${messages.length}件のメッセージを取得しました`);

    // 各メッセージを処理
    for (const message of messages) {
      const existingUser = getUser(message.channelId);
      if (existingUser) {
        // 既存ユーザーの処理
        if (isStartMessage(message.displayMessage) && !existingUser.isStudying) {
          // 学習再開
          await restartStudy(existingUser, message.publishedAt);
          logger.info(`${existingUser.displayName}の学習を再開しました`);
        } else if (isEndMessage(message.displayMessage) && existingUser.isStudying) {
          // 学習終了
          await endStudy(existingUser, message.publishedAt);
          logger.info(`${existingUser.displayName}の学習を終了しました`);
        }
      } else {
        // 新規ユーザーの処理
        if (isStartMessage(message.displayMessage)) {
          // 学習開始
          await startStudy(message);
          logger.info(`${message.displayName}の学習を開始しました`);
        }
      }
    }
  } else {
    logger.info('新しいメッセージはありません');
  }
};

/**
 * 全アクティブユーザーのtimesecを更新
 * - isStudying: trueのユーザーの経過時間を更新
 */
export const updateAllUsersTime = async (now: Date): Promise<void> => {
  const activeUsers = getAllActiveUsers();

  for (const user of activeUsers) {
    await updateTime(user, now);
  }
};

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

/**
 * 学習開始のビジネスロジック
 * 新規ユーザーの学習開始を処理し、YouTubeにコメントを投稿する
 * @param message - YouTubeライブチャットメッセージ
 * @returns 開始されたユーザー情報
 */
export const startStudy = async (message: LiveChatMessage): Promise<void> => {
  // ユーザーオブジェクトの作成
  const startUser: User = {
    channelId: message.channelId,
    displayName: message.displayName,
    profileImageUrl: message.profileImageUrl,
    isChatSponsor: message.isChatSponsor || false,
    timeSec: 0,
    updateTime: message.publishedAt,
    isStudying: true,
    refreshInterval: 0,
    isGameMode: false,
    level: 0,
    exp: 0,
    maxHp: 0,
    hp: 0,
    progress: 0,
    isMaxLevel: false,
    timeToNextLevel: 0,
    nextLevelRequiredTime: 0,
  };

  const studyDays = await getStudyDaysByChannelId(startUser.channelId);
  const startMessage = getStartMessageByUser(startUser.displayName, studyDays);

  // キューに追加
  pushQueue(startUser.displayName, startMessage);
  // メモリストアに保存
  setUser(startUser);
};

/**
 * 学習再開のビジネスロジック
 * 既存ユーザーの学習再開を処理し、YouTubeにコメントを投稿する
 * @param user - 既存のユーザー情報
 * @param startTime - 再開時刻
 * @returns 再開されたユーザー情報
 */
export const restartStudy = async (user: User, startTime: Date): Promise<void> => {
  // ユーザーオブジェクトの更新
  const restartUser: User = {
    ...user,
    isStudying: true,
    updateTime: startTime,
    refreshInterval: 0,
  };

  const restartMessage = `@${restartUser.displayName}さん ${RESTART_MESSAGE}`;
  // キューに追加
  pushQueue(restartUser.displayName, restartMessage);
  // メモリストアに保存
  setUser(restartUser);
};

/**
 * 学習時間を更新する
 * @param user - 既存のユーザー情報
 * @param currentTime - 現在時刻
 * @returns 更新されたユーザー情報
 */
export const updateTime = async (user: User, currentTime: Date): Promise<void> => {
  const updatedUser: User = {
    ...user,
    timeSec: user.timeSec + calcStudyTime(user.updateTime, currentTime),
    updateTime: user.isGameMode ? user.updateTime : currentTime,
    refreshInterval: user.refreshInterval + calcStudyTime(user.updateTime, currentTime),
  };

  // メモリストアに保存
  setUser(updatedUser);
};

/**
 * 学習終了のビジネスロジック
 * 既存ユーザーの学習終了を処理し、DB保存とYouTubeコメント投稿を行う
 * @param user - 既存のユーザー情報
 * @param endTime - 終了時刻
 * @returns 終了されたユーザー情報
 */
export const endStudy = async (user: User, endTime: Date): Promise<void> => {
  // 学習時間の最終計算
  const stopUser: User = {
    ...user,
    timeSec: user.timeSec + calcStudyTime(user.updateTime, endTime),
    isStudying: false,
    updateTime: endTime,
  };

  // DB保存
  try {
    if (parameter.IS_DATABASE_ENABLED) {
      await saveLog(stopUser);
      logger.info(`${stopUser.displayName}の学習記録をDBに保存しました`);
    } else {
      logger.info('データベース保存は無効化されています');
    }
  } catch (error) {
    logger.error(`${stopUser.displayName}のDB保存に失敗しました - ${error}`);
    // DB保存失敗してもコメント投稿は継続
  }

  const commentMessage = getEndMessageByUser(stopUser);
  // キューに追加
  pushQueue(stopUser.displayName, commentMessage);
  // メモリストアに保存（isStudying: false状態で保持）
  setUser(stopUser);
};

/**
 * リフレッシュ間隔をリセットする
 * @param user - 既存のユーザー情報
 */
export const resetRefresh = async (user: User): Promise<void> => {
  const refreshUser: User = {
    ...user,
    refreshInterval: 0,
  };
  // キューに追加
  const refreshMessage = getRefreshMessageByUser(refreshUser.displayName);
  pushQueue(refreshUser.displayName, refreshMessage);
  // メモリストアに保存
  setUser(refreshUser);
};
