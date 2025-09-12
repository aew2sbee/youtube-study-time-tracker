import { User } from '@/types/users';
import { YouTubeLiveChatMessage } from '@/types/youtube';
import { calcStudyTime, calcTime } from '@/lib/calcTime';
import { logger } from '@/utils/logger';

/**
 * YouTubeライブチャットメッセージから新しいユーザーを作成し、学習を開始します。
 * @param message - YouTubeライブチャットメッセージ
 * @returns 学習開始状態の新しいユーザーオブジェクト
 */
export const startTime = (message: YouTubeLiveChatMessage): User => {
  const startUser = {
    channelId: message.channelId,
    name: message.authorDisplayName,
    timeSec: 0,
    profileImageUrl: message.profileImageUrl,
    updateTime: new Date(message.publishedAt),
    isStudying: true,
  };
  logger.info(`startTime - ${startUser.name} ${calcTime(startUser.timeSec)}`);
  return startUser;
};

/**
 * 既存ユーザーの学習を再開します。
 * @param user - 対象ユーザー
 * @param startTime - 学習再開時刻
 * @returns 学習再開状態に更新されたユーザーオブジェクト
 */
export const restartTime = (user: User, startTime: Date): User => {
  const restartUser = {
    ...user,
    isStudying: true,
    updateTime: startTime,
  };
  logger.info(`restartTime - ${restartUser.name} ${calcTime(user.timeSec)} => ${calcTime(restartUser.timeSec)}`);
  return restartUser;
};

/**
 * ユーザーの学習を停止し、学習時間を累積します。
 * @param user - 対象ユーザー
 * @param endTime - 学習終了時刻
 * @returns 学習時間が更新され、学習停止状態になったユーザーオブジェクト。updateTimeがない場合は元のユーザーをそのまま返す
 */
export const stopTime = (user: User, endTime: Date): User => {
  if (user.updateTime) {
    const stopUser = {
      ...user,
      timeSec: user.timeSec + calcStudyTime(user.updateTime, endTime),
      isStudying: false,
      updateTime: endTime,
    };
    logger.info(`stopTime - ${stopUser.name} ${calcTime(user.timeSec)} => ${calcTime(stopUser.timeSec)}`);
    return stopUser;
  }
  logger.warn(`No stopTime - ${user.name}`);
  return user;
};

/**
 * 学習中のユーザーの学習時間を現在時刻で更新します。
 * @param user - 対象ユーザー
 * @param currentTime - 現在時刻
 * @returns 学習時間が更新されたユーザーオブジェクト。updateTimeがない場合は元のユーザーをそのまま返す
 */
export const updateTime = (user: User, currentTime: Date): User => {
  if (user.updateTime) {
    const updatedUser = {
      ...user,
      timeSec: user.timeSec + calcStudyTime(user.updateTime, currentTime),
      updateTime: currentTime,
    };
    logger.info(`updateTime - ${updatedUser.name} ${calcTime(user.timeSec)} => ${calcTime(updatedUser.timeSec)}`);
    return updatedUser;
  }
  logger.warn(`No updateTime: ${user.name}`);
  return user;
};
