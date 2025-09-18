import { parameter } from '@/config/system';

export const REFRESH_MESSAGE =
  'そろそろ2時間が経過しますので、20分ほど休憩しませんか？ ポモドーロ・テクニックでは、2時間ごとに「15〜30分程度の長めの休憩」を取ることが推奨されています。';

export const CHAT_MESSAGE = [
  '素晴らしい努力ですね!!',
  'その調子!!',
  '頑張りが数字として表れていますね!!',
  'NICE✨',
  'FANTASTIC🎉',
  'GREAT👍',
  'EXCELLENT🥇',
  '継続力がすごい!!',
  '努力が実を結びますように!!',
  'よく頑張っていますね!!',
  '努力が形になっていますね!!',
  '応援しています📣',
  'あなたの努力は必ず報われますよ!!',
  '無理しすぎてませんか? 休憩も大事ですよ!!',
  '頑張った自分にご褒美をあげてください!!',
];

/**
 * 指定されたメッセージが学習開始メッセージかどうかを判定します。
 * @param {string} messageText - 判定するメッセージテキスト
 * @returns {boolean} 学習開始メッセージの場合はtrue
 */
export const isStartMessage = (messageText: string): boolean =>
  messageText.toLowerCase().trim() === parameter.START_STUDY_KEYWORDS;

/**
 * 指定されたメッセージが学習終了メッセージかどうかを判定します。
 * @param {string} messageText - 判定するメッセージテキスト
 * @returns {boolean} 学習終了メッセージの場合はtrue
 */
export const isEndMessage = (messageText: string): boolean =>
  messageText.toLowerCase().trim() === parameter.END_STUDY_KEYWORDS;
