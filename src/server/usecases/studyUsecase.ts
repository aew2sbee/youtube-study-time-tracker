import { User } from '@/types/users';
import { youtube_v3 } from 'googleapis';
import { calcStudyTime, calcTime } from '@/lib/calcTime';
import { logger } from '@/server/lib/logger';
import { postYouTubeComment } from '@/server/lib/youtubeHelper';
import { START_MESSAGE, removeMentionPrefix } from '@/lib/liveChatMessage';
import { getStudyDaysByChannelId, saveLog } from '../repositories/studyRepository';
import { getStartMessageByUser, END_MESSAGE, getEndMessageByUser } from '../lib/messages';

/**
 * 学習開始のビジネスロジック
 * 新規ユーザーの学習開始を処理し、YouTubeにコメントを投稿する
 * @param message - YouTubeライブチャットメッセージ
 * @returns 開始されたユーザー情報
 */
export const startStudy = async (
  message: youtube_v3.Schema$LiveChatMessage
): Promise<User> => {
  // ユーザーオブジェクトの作成
  const startUser: User = {
    channelId: message.authorDetails?.channelId || '',
    displayName: removeMentionPrefix(message.authorDetails?.displayName || ''),
    isChatSponsor: message.authorDetails?.isChatSponsor || false,
    timeSec: 0,
    profileImageUrl: message.authorDetails?.profileImageUrl || '',
    updateTime: new Date(message.snippet?.publishedAt || ''),
    isStudying: true,
    refreshInterval: 0,
    category: '',
    totalDays: 0,
    totalSec: 0,
    last7Days: 0,
    last7DaysSec: 0,
    last28Days: 0,
    last28DaysSec: 0,
  };

  logger.info(`startStudy - ${startUser.displayName} ${calcTime(startUser.timeSec)}`);

  // YouTubeにコメントを投稿
  try {
    // ユーザーの参加日数を取得
    const studyDays = await getStudyDaysByChannelId(startUser.channelId);
    const startMessage = getStartMessageByUser(studyDays);
    const commentMessage = `@${startUser.displayName}さん ${startMessage}`;
    await postYouTubeComment(commentMessage, startUser.displayName);
  } catch (error) {
    logger.error(`${startUser.displayName}の開始コメント投稿に失敗しました - ${error}`);
    // コメント投稿失敗してもユーザー作成は継続
  }

  return startUser;
};

/**
 * 学習再開のビジネスロジック
 * 既存ユーザーの学習再開を処理し、YouTubeにコメントを投稿する
 * @param user - 既存のユーザー情報
 * @param startTime - 再開時刻
 * @returns 再開されたユーザー情報
 */
export const restartStudy = async (
  user: User,
  startTime: Date
): Promise<User> => {
  // ユーザーオブジェクトの更新
  const restartUser: User = {
    ...user,
    isStudying: true,
    updateTime: startTime,
    refreshInterval: 0,
  };

  logger.info(`restartStudy - ${restartUser.displayName} ${calcTime(user.timeSec)} => ${calcTime(restartUser.timeSec)}`);

  // YouTubeにコメントを投稿
  try {
    const commentMessage = `@${restartUser.displayName}: ${START_MESSAGE}`;
    await postYouTubeComment(commentMessage, restartUser.displayName);
  } catch (error) {
    logger.error(`${restartUser.displayName}の再開コメント投稿に失敗しました - ${error}`);
    // コメント投稿失敗してもユーザー更新は継続
  }

  return restartUser;
};

/**
 * 学習時間を更新する
 * @param user - 既存のユーザー情報
 * @param currentTime - 現在時刻
 * @returns 更新されたユーザー情報
 */
export const updateStudyTime = (user: User, currentTime: Date): User => {
  const updatedUser: User = {
    ...user,
    timeSec: user.timeSec + calcStudyTime(user.updateTime, currentTime),
    updateTime: currentTime,
    refreshInterval: user.refreshInterval + calcStudyTime(user.updateTime, currentTime),
  };

  logger.info(`updateStudyTime - ${updatedUser.displayName} ${calcTime(user.timeSec)} => ${calcTime(updatedUser.timeSec)}`);
  return updatedUser;
};

/**
 * カテゴリー更新のビジネスロジック
 * 既存ユーザーのカテゴリーを更新する
 * @param user - 既存のユーザー情報
 * @param category - 新しいカテゴリー
 * @returns 更新されたユーザー情報
 */
export const updateCategory = (user: User, category: string): User => {
  const updatedUser: User = {
    ...user,
    category,
  };

  logger.info(`updateCategory - ${updatedUser.displayName} category: ${updatedUser.category}`);
  return updatedUser;
};

/**
 * 学習終了のビジネスロジック
 * 既存ユーザーの学習終了を処理し、DB保存とYouTubeコメント投稿を行う
 * @param user - 既存のユーザー情報
 * @param endTime - 終了時刻
 * @returns 終了されたユーザー情報
 */
export const endStudy = async (
  user: User,
  endTime: Date
): Promise<User> => {
  // 学習時間の最終計算
  const stopUser: User = {
    ...user,
    timeSec: user.timeSec + calcStudyTime(user.updateTime, endTime),
    isStudying: false,
    updateTime: endTime,
  };

  logger.info(`endStudy - ${stopUser.displayName} ${calcTime(user.timeSec)} => ${calcTime(stopUser.timeSec)}`);

  // DB保存
  try {
    await saveLog(stopUser);
    logger.info(`${stopUser.displayName}の学習記録をDBに保存しました`);
  } catch (error) {
    logger.error(`${stopUser.displayName}のDB保存に失敗しました - ${error}`);
    // DB保存失敗してもコメント投稿は継続
  }

  // YouTubeにコメントを投稿
  try {
    const commentMessage = getEndMessageByUser(stopUser)
    await postYouTubeComment(commentMessage, stopUser.displayName);
  } catch (error) {
    logger.error(`${stopUser.displayName}の終了コメント投稿に失敗しました - ${error}`);
    // コメント投稿失敗してもユーザー更新は継続
  }

  return stopUser;
};
