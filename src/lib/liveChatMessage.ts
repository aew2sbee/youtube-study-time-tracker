import { parameter } from '@/config/system';

export const REFRESH_MESSAGE =
  'そろそろ2時間が経過しますので、20分ほど休憩しませんか？ ポモドーロ・テクニックでは、2時間ごとに「15〜30分程度の長めの休憩」を取ることが推奨されています。';

export const START_MESSAGE =
  '計測を受け付けました。一緒に頑張っていきましょう♪ 計測を終了される場合は、「end」とコメントしてくださいね。';

/**
 * メッセージの先頭に付与されている@を削除します。
 * @param {string} message - 処理するメッセージテキスト
 * @returns {string} @が削除されたメッセージ
 * @example
 * removeMentionPrefix('@username') // => 'username'
 * removeMentionPrefix('@username こんにちは') // => 'username こんにちは'
 * removeMentionPrefix('こんにちは') // => 'こんにちは'
 */
export const removeMentionPrefix = (message: string): string =>
  message.startsWith('@') ? message.slice(1) : message;

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

/**
 * 指定されたメッセージがカテゴリーメッセージ（作業、勉強、読書）かどうかを判定します。
 * @param {string} messageText - 判定するメッセージテキスト
 * @returns {boolean} カテゴリーメッセージの場合はtrue
 */
export const isCategoryMessage = (messageText: string): boolean => {
  const trimmedMessage = messageText.trim();
  return (parameter.ALLOW_WORDS as readonly string[]).includes(trimmedMessage);
};
