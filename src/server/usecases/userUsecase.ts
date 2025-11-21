import { User } from '@/types/users';
import { calcStudyTime } from '@/lib/calcTime';
import { logger } from '@/server/lib/logger';
import { REFRESH_MESSAGE, RESTART_MESSAGE } from '@/server/lib/messages';
import { getStudyDaysByChannelId, saveLog } from '../repositories/studyRepository';
import { getStartMessageByUser, getEndMessageByUser } from '../lib/messages';
import { setUser } from '@/server/store/user';
import { LiveChatMessage } from '@/types/youtube';
import { pushQueue } from '../store/post';

/**
 * 学習開始のビジネスロジック
 * 新規ユーザーの学習開始を処理し、YouTubeにコメントを投稿する
 * @param message - YouTubeライブチャットメッセージ
 * @returns 開始されたユーザー情報
 */
export const startStudy = async (message: LiveChatMessage, now: Date): Promise<void> => {
  // ユーザーオブジェクトの作成
  const startUser: User = {
    channelId: message.channelId,
    displayName: message.displayName,
    profileImageUrl: message.profileImageUrl,
    isChatSponsor: message.isChatSponsor || false,
    timeSec: 0,
    updateTime: now,
    isStudying: true,
    refreshInterval: 0,
    category: '',
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
    updateTime: currentTime,
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
    await saveLog(stopUser);
    logger.info(`${stopUser.displayName}の学習記録をDBに保存しました`);
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
  pushQueue(refreshUser.displayName, REFRESH_MESSAGE);
  // メモリストアに保存
  setUser(refreshUser);
};

/**
 * カテゴリー更新のビジネスロジック
 * 既存ユーザーのカテゴリーを更新する
 * @param user - 既存のユーザー情報
 * @param category - 新しいカテゴリー
 * @returns 更新されたユーザー情報
 */
export const updateCategory = async (user: User, category: string): Promise<void> => {
  const updatedUser: User = {
    ...user,
    category,
  };

  // メモリストアに保存
  setUser(updatedUser);
};
