import { parameter } from '@/config/system';
import { StudyTimeUser } from '@/types/youtube';

/**
 * 最終更新時刻から次回更新時刻を計算します。
 * @param {Date} lastUpdateTime - 最終更新時刻
 * @returns {Date} 次回更新時刻
 */
export const calcNextUpdateTime = (lastUpdateTime: Date): Date =>
  new Date(lastUpdateTime.getTime() + parameter.API_POLLING_INTERVAL);

/**
 * 現在時刻を「hh:mm」形式の文字列で返します。
 * @param {Date} now - 現在時刻
 * @returns {string} フォーマット済み時刻文字列
 */
export const calcUpdateTime = (now: Date): string =>
  `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

/**
 * 秒数を「xh xxmin」形式の文字列に変換します。
 * @param {number} seconds - 秒数
 * @returns {string} フォーマット済み時間文字列
 */
export const calcTime = (seconds: number): string => {
  if (seconds === 0) return '0h 0min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
};

/**
 * 全ユーザーの合計勉強時間（追加分含む）を計算します。
 * @param {StudyTimeUser[]} users - ユーザー配列
 * @returns {number} 合計勉強時間（秒）
 */
export const calcTotalStudyTime = (users: StudyTimeUser[]): number => {
  const usersTotal = Array.from(users.values())
    .filter((user) => user.studyTime > 0 || user.isStudying)
    .reduce((total, user) => {
      let userTime = user.studyTime;
      // 現在勉強中の場合は経過時間も追加
      if (user.isStudying && user.startTime) {
        const currentTime = Math.floor((new Date().getTime() - user.startTime.getTime()) / 1000);
        userTime += currentTime;
      }
      return total + userTime;
    }, 0);

  // 追加の勉強時間を合算
  return usersTotal + parameter.ADDITIONAL_STUDY_TIME;
};

/**
 * 各ユーザーの現在の勉強時間を計算します。
 * @param {Date} now - 現在時刻
 * @param {StudyTimeUser[]} users - ユーザー配列
 * @returns {StudyTimeUser[]} 勉強時間を更新したユーザー配列
 */
export const calcUsersStudyTime = (now: Date, users: StudyTimeUser[]): StudyTimeUser[] => {
  return Array.from(users.values())
    .filter((user) => user.studyTime > 0 || user.isStudying)
    .map((user) => {
      // リアルタイム計算: 勉強中の場合は現在時刻までの時間を追加
      if (user.isStudying && user.startTime) {
        const currentStudyTime = Math.floor((now.getTime() - user.startTime.getTime()) / 1000);
        return {
          ...user,
          studyTime: user.studyTime + currentStudyTime,
        };
      }
      return user;
    });
};

/**
 * 開始時刻と終了時刻から勉強時間（秒）を計算します。
 * @param {Date} startTime - 勉強開始時刻
 * @param {Date} endTime - 勉強終了時刻
 * @returns {number} 勉強時間（秒）
 */
export const calcStudyDuration = (startTime: Date, endTime: Date): number =>
  Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

/**
 * 値が全体に対して占める割合（%）を計算します。
 * @param {number} value - 値
 * @param {number} total - 全体
 * @returns {number} 割合（整数%）
 */
export const calcPercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.floor((value / total) * 100);
};

/**
 * 値を10段階評価に変換します（最大10）。
 * @param {number} value - 値
 * @returns {number} 10段階評価
 */
export const calcRating10 = (value: number): number => Math.min(Math.floor(value / 10), 10);


export const calculateTargetValues = (totalTime: number) => {
    const targetPercentage = Math.floor((totalTime / parameter.TARGET_STUDY_TIME) * 100);
    const targetFlowerLevel = Math.min(Math.floor(targetPercentage / 10), 10);
    return { targetPercentage, targetFlowerLevel };
  };
