import { parameter } from '@/config/system';
import { User } from '@/types/users';

/**
 * 追加の勉強時間（秒: h * m + sec）
 */
export const ADDITIONAL_STUDY_TIME = 0 * 60 * 60;

/**
 * 開始時刻と終了時刻から学習時間を秒単位で計算します。
 * @param start - 学習開始時刻
 * @param end - 学習終了時刻
 * @returns 学習時間（秒）。終了時刻が開始時刻より前の場合は0を返す
 */
export const calcStudyTime = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const safeDiffMs = Math.max(diffMs, 0); // マイナスにならないように
  return Math.floor(safeDiffMs / 1000);
};
/**
 * 全ユーザーの学習時間と追加学習時間を合計します。
 * @param users - ユーザー配列
 * @returns 合計学習時間（秒）
 */
export const calcTotalTime = (users: User[]): number => {
  const total = users.reduce((total, u) => total + u.timeSec, ADDITIONAL_STUDY_TIME);
  return total;
};

/**
 * 秒数を英語形式の時分表示に変換します。
 * @param seconds - 秒数
 * @returns 「Xh XXmin」形式の文字列
 * @example
 * calcTime(3661) // "1h 01min"
 * calcTime(0) // "0h 00min"
 */
export const calcTime = (seconds: number): string => {
  if (seconds === 0) return '0h 00min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
};

/**
 * 秒数を日本語形式の時分表示に変換します。
 * @param seconds - 秒数
 * @returns 「X時XX分」形式の文字列。0秒の場合は「0分」
 * @example
 * calcTimeJP(3661) // "1時01分"
 * calcTimeJP(0) // "0分"
 */
export const calcTimeJP = (seconds: number): string => {
  if (seconds === 0) return '0分';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}時${minutes.toString().padStart(2, '0')}分`;
};

/**
 * 総学習時間から目標達成率と花レベルを計算します。
 * @param totalTime - 総学習時間（秒）
 * @returns 目標達成率（パーセント）と花レベル（0-10）
 * @example
 * calculateTargetValues(990000) // { targetPercentage: 50, targetFlowerLevel: 5 }
 */
export const calculateTargetValues = (totalTime: number) => {
  const targetPercentage = Math.floor((totalTime / parameter.TARGET_STUDY_TIME) * 100);
  const targetFlowerLevel = Math.min(Math.floor(targetPercentage / 10), 10);
  return { targetPercentage, targetFlowerLevel };
};

/**
 * ISO文字列を日本時間の時分秒形式に変換します。
 * @param publishedAt - ISO形式の日時文字列
 * @returns 「H:MM:SS」または「HH:MM:SS」形式の時刻文字列
 * @example
 * convertHHMMSS("2023-01-01T15:30:45Z") // "0:30:45" (日本時間)
 */
export const convertHHMMSS = (publishedAt: string) =>
  new Date(publishedAt).toLocaleTimeString('ja-JP', {
    hour12: false,
    timeZone: 'Asia/Tokyo',
  });
