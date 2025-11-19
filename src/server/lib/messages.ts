import { parameter } from "@/config/system";

export const REFRESH_MESSAGE =
  'そろそろ2時間が経過しますので、20分ほど休憩しませんか？' +
  'ポモドーロ・テクニックでは、2時間ごとに"15〜30分程度の長めの休憩"を取ることが推奨されています';

export const START_MESSAGE =
  '本日もよろしくお願いします。計測を終了される場合は「end」とコメントしてくださいね';

/**
 * 参加日数に応じた開始メッセージを取得する
 * @param days - 参加日数
 * @returns 開始メッセージ
 */
export const getStartMessageByDays = (days: number): string => {
  if (days === 0) {
    return '初参加ですね！🔰よろしくお願いします🙇' + START_MESSAGE;
  } else if (days < 7) {
    return `${days}日目の参加ですね！継続は力なり💪` + START_MESSAGE;
  } else if (days < 30) {
    return `${days}日目！素晴らしい継続力ですね🦾` + START_MESSAGE;
  } else {
    return `なんと${days}日目！継続の達人ですね🏆` + START_MESSAGE;
  }
};

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

/**
 * 指定されたメッセージが許可されたメッセージ（start/end/category）かどうかを判定します。
 * @param {string} messageText - 判定するメッセージテキスト
 * @returns {boolean} 許可されたメッセージの場合はtrue
 */
export const isAllowMessage = (messageText: string): boolean => {
  return isStartMessage(messageText) || isEndMessage(messageText) || isCategoryMessage(messageText);
};
