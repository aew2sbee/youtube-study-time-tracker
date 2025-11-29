import { User } from '@/types/users';
import { getStudyDaysByChannelId } from '../repositories/studyRepository';
import { getLevelUpMessage, getStartMessageByUser, isEndMessage, isLevelUpMessage } from '../lib/messages';
import { getAllGameUsers, getUser, setUser } from '@/server/store/user';
import { LiveChatMessage } from '@/types/youtube';
import { pushQueue } from '../store/post';
import { calcWisdomGain, getLevelInfo } from '../lib/levelSystem';
import { getStatsByChannelId, saveStatsByChannelId } from '../repositories/gameRepository';
import { parameter } from '@/config/system';
import { calcStudyTime } from '../lib/calcTime';
import { logger } from '@/server/lib/logger';

export const setGameByMessage = async (messages: LiveChatMessage[]): Promise<void> => {
  if (messages.length > 0) {
    for (const message of messages) {
      const existingUser = getUser(message.channelId);
      if (existingUser) {
        // 既存ユーザーの処理
        if (isLevelUpMessage(message.displayMessage) && !existingUser.isGameMode) {
          await changeGame(existingUser, message);
        } else if (isEndMessage(message.displayMessage) && existingUser.isGameMode) {
          // 学習終了
          await endGame(existingUser, message.publishedAt);
          logger.info(`${existingUser.displayName}の学習を終了しました`);
        }
      } else {
        // 新規ユーザーの処理
        if (isLevelUpMessage(message.displayMessage)) {
          await startGame(message);
        }
      }
    }
  }
};

export const updateStatus = async (now: Date): Promise<void> => {
  const gameUsers = getAllGameUsers();

  for (const user of gameUsers) {
    const clacedEXP = user.exp + calcStudyTime(user.updateTime, now);
    const nextLevelInfo = getLevelInfo(clacedEXP);
    const updatedUser: User = {
      ...user,
      updateTime: now,
      exp: clacedEXP,
      level: nextLevelInfo.level,
      isMaxLevel: nextLevelInfo.isMaxLevel,
      progress: nextLevelInfo.progress,
      timeToNextLevel: nextLevelInfo.timeToNextLevel,
    };
    // メモリストアに保存
    setUser(updatedUser);
  }
}

export const checkLevelup = async (now: Date): Promise<void> => {
  const gameUsers = getAllGameUsers();

  for (const user of gameUsers) {
    const nextEXP = user.exp + calcStudyTime(user.updateTime, now);

    // 今回のポーリング処理でレベルアップしたか判定
    if (getLevelInfo(nextEXP).level > user.level) {
      // かしこさ上昇値を計算
      const wisdomGain = calcWisdomGain(user.level, user.wisdom);
      // ユーザーのかしこさを更新
      const updatedUser: User = {
        ...user,
        wisdom: user.wisdom + wisdomGain,
      };
      setUser(updatedUser);
      // メッセージをキューに追加
      const levelUpMessage = getLevelUpMessage(user, user.wisdom, updatedUser.wisdom);
      console.log(levelUpMessage);
      pushQueue(user.displayName, levelUpMessage);
    }
  }
}

/**
 * 学習開始のビジネスロジック
 * 新規ユーザーの学習開始を処理し、YouTubeにコメントを投稿する
 * @param message - YouTubeライブチャットメッセージ
 * @returns 開始されたユーザー情報
 */
export const startGame = async (message: LiveChatMessage): Promise<void> => {
  const stats = await getStatsByChannelId(message.channelId);
  const levelInfo = stats ? getLevelInfo(stats.expSec) : null;

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
    isGameMode: true,
    level: levelInfo ? levelInfo.level : 1,
    exp: stats ? stats.expSec : 0,
    wisdom: stats ? stats.wisdom : 10,
    progress: levelInfo ? levelInfo.progress : 0,
    isMaxLevel: levelInfo ? levelInfo.isMaxLevel : false,
    timeToNextLevel: levelInfo ? levelInfo.timeToNextLevel : 0,
  };

  const studyDays = await getStudyDaysByChannelId(startUser.channelId);
  const startMessage = getStartMessageByUser(startUser.displayName, studyDays);

  // キューに追加
  pushQueue(startUser.displayName, startMessage);
  // メモリストアに保存
  setUser(startUser);
};

/**
 * 学習開始のビジネスロジック
 * 新規ユーザーの学習開始を処理し、YouTubeにコメントを投稿する
 * @param message - YouTubeライブチャットメッセージ
 * @returns 開始されたユーザー情報
 */
export const changeGame = async (user: User, message: LiveChatMessage): Promise<void> => {
  const stats = await getStatsByChannelId(user.channelId);
  const levelInfo = stats ? getLevelInfo(stats.expSec) : null;

  // ユーザーオブジェクトの作成
  const startUser: User = {
    ...user,
    updateTime: message.publishedAt,
    isGameMode: true,
    level: levelInfo ? levelInfo.level : 1,
    exp: stats ? stats.expSec : 0,
    wisdom: stats ? stats.wisdom : 10,
    progress: levelInfo ? levelInfo.progress : 0,
    isMaxLevel: levelInfo ? levelInfo.isMaxLevel : false,
    timeToNextLevel: levelInfo ? levelInfo.timeToNextLevel : 0,
  };

  // メモリストアに保存
  setUser(startUser);
};

export const endGame = async (user: User, endTime: Date): Promise<void> => {
  // 学習時間の最終計算
  const stopUser: User = {
    ...user,
    exp: user.exp + calcStudyTime(user.updateTime, endTime),
    isGameMode: false,
  };

  // DB保存
  try {
    if (parameter.IS_DATABASE_ENABLED) {
      await saveStatsByChannelId(stopUser);
      logger.info(`${stopUser.displayName}のステータスをDBに保存しました`);
    } else {
      logger.info('データベース保存は無効化されています');
    }
  } catch (error) {
    logger.error(`${stopUser.displayName}のDB保存に失敗しました - ${error}`);
    // DB保存失敗してもコメント投稿は継続
  }

  // メモリストアに保存（isStudying: false状態で保持）
  setUser(stopUser);
};