import { User } from '@/types/users';
import { getStudyDaysByChannelId } from '../repositories/studyRepository';
import { getHP, getStartMessageByUser, isLevelUpMessage } from '../lib/messages';
import { getAllGameUsers, getUser, setUser } from '@/server/store/user';
import { LiveChatMessage } from '@/types/youtube';
import { pushQueue } from '../store/post';
import { getLevelInfo } from '../lib/levelSystem';
import { getStatsByChannelId } from '../repositories/gameRepository';
import { parameter } from '@/config/system';

export const gameMode = async (messages: LiveChatMessage[]): Promise<void> => {
  if (messages.length > 0) {
    for (const message of messages) {
      const existingUser = getUser(message.channelId);
      if (existingUser) {
        // 既存ユーザーの処理
        if (isLevelUpMessage(message.displayMessage) && !existingUser.isStudying) {
          // 学習再開
          await changeGame(existingUser, message);
        }
      } else {
        // 新規ユーザーの処理
        if (isLevelUpMessage(message.displayMessage)) {
          // 学習開始
          await startGame(message);
        }
      }
    }
  }

  const gameUsers = getAllGameUsers();

  for (const user of gameUsers) {
    await damageHP(user);
  }
};

/**
 * 学習開始のビジネスロジック
 * 新規ユーザーの学習開始を処理し、YouTubeにコメントを投稿する
 * @param message - YouTubeライブチャットメッセージ
 * @returns 開始されたユーザー情報
 */
export const startGame = async (message: LiveChatMessage): Promise<void> => {
  const stats = await getStatsByChannelId(message.channelId);
  const levelInfo = stats ? getLevelInfo(stats.expSec) : null;
  const hp = getHP(message.displayMessage);

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
    isLeveledUp: false,
    level: levelInfo ? levelInfo.level : 0,
    exp: stats ? stats.expSec : 0,
    hp: hp ? hp : parameter.INITIAL_HP,
    progress: levelInfo ? levelInfo.progress : 0,
    isMaxLevel: levelInfo ? levelInfo.isMaxLevel : false,
    timeToNextLevel: levelInfo ? levelInfo.timeToNextLevel : 0,
    nextLevelRequiredTime: levelInfo ? levelInfo.nextLevelRequiredTime : 0,
  };

  const studyDays = await getStudyDaysByChannelId(startUser.channelId);
  const startMessage = getStartMessageByUser(startUser.displayName, studyDays);

  // キューに追加
  pushQueue(startUser.displayName, startMessage);
  // メモリストアに保存
  setUser(startUser);
};

/**
 * 学習時間を更新する
 * @param user - 既存のユーザー情報
 * @param currentTime - 現在時刻
 * @returns 更新されたユーザー情報
 */
export const damageHP = async (user: User): Promise<void> => {
  const damagedUser: User = {
    ...user,
    hp: user.hp - 1,
  };

  // メモリストアに保存
  setUser(damagedUser);
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
  const hp = getHP(message.displayMessage);

  // ユーザーオブジェクトの作成
  const startUser: User = {
    channelId: user.channelId,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
    isChatSponsor: user.isChatSponsor || false,
    timeSec: user.timeSec,
    updateTime: user.updateTime,
    isStudying: true,
    refreshInterval: user.refreshInterval,
    isGameMode: true,
    isLeveledUp: false,
    level: levelInfo ? levelInfo.level : 0,
    exp: stats ? stats.expSec : 0,
    hp: hp ? hp : parameter.INITIAL_HP,
    progress: levelInfo ? levelInfo.progress : 0,
    isMaxLevel: levelInfo ? levelInfo.isMaxLevel : false,
    timeToNextLevel: levelInfo ? levelInfo.timeToNextLevel : 0,
    nextLevelRequiredTime: levelInfo ? levelInfo.nextLevelRequiredTime : 0,
  };

  // キューに追加
  // pushQueue(startUser.displayName, startMessage);
  // メモリストアに保存
  setUser(startUser);
};