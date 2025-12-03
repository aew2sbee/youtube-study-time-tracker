import { parameter } from '@/config/system';
import { User } from '@/types/users';
import { calcTime } from '@/server/lib/calcTime';
import { getStudyTimeStatsByChannelId } from '../repositories/studyRepository';

export const REFRESH_MESSAGE =
  'そろそろ2時間が経過しますので、20分ほど休憩しませんか？' +
  'ポモドーロ・テクニックでは、2時間ごとに"15〜30分程度の長めの休憩"を取ることが推奨されています';

export const START_MESSAGE = '本日もよろしくお願いします。計測を終了される場合は「end」とコメントしてくださいね';

export const RESTART_MESSAGE =
  'おかえりなさい! 引き続きよろしくお願いいたします。計測を終了される場合は「end」とコメントしてくださいね';

export const END_MESSAGE = 'お疲れ様でした！本日の学習時間を記録しました。またのご参加をお待ちしています😊';
/**
 * 参加日数に応じた開始メッセージを取得する
 * @param days - 参加日数
 * @returns 開始メッセージ
 */
export const getStartMessageByUser = (displayName: string, days: number): string => {
  let message = '';
  if (days === 0) {
    message = '初参加ですね！🔰よろしくお願いします🙇' + START_MESSAGE;
  } else if (days < 7) {
    message = `${days + 1}日目の参加ですね！継続は力なり💪` + START_MESSAGE;
  } else if (days < 30) {
    message = `${days + 1}日目！素晴らしい継続力ですね🦾` + START_MESSAGE;
  } else {
    message = `なんと${days + 1}日目！継続の達人ですね🏆` + START_MESSAGE;
  }
  return `@${displayName}さん ${message}`;
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
 * 指定されたメッセージが許可されたメッセージ（start/end/category）かどうかを判定します。
 * @param {string} messageText - 判定するメッセージテキスト
 * @returns {boolean} 許可されたメッセージの場合はtrue
 */
export const isAllowMessage = (messageText: string): boolean => {
  return isStartMessage(messageText) || isEndMessage(messageText) || isLevelUpMessage(messageText);
};

/**
 * 統計情報を含む終了メッセージを生成します。
 * @param {User} user - ユーザー情報（統計情報を含む）
 * @returns {string} 統計情報を含む終了メッセージ
 */
export const getEndMessageByUser = async (user: User): Promise<string> => {
  const studyLog = await getStudyTimeStatsByChannelId(user.channelId)
  return `@${user.displayName}さん お疲れ様でした🌟` + `今日は${calcTime(user.timeSec)}集中しました!!` +
  `これまでに合計${studyLog.totalDays}日間集中してなんと${calcTime(studyLog.totalTime)}も頑張りました!!` +
  `📅 過去7日間実績は、${studyLog.last7Days}日で${calcTime(studyLog.last7DaysTime)}` +
  `📆 過去28日間は、${studyLog.last28Days}日で${calcTime(studyLog.last28DaysTime)}` +
  `この配信がお役に立ったなら高評価👍をお願いします。また集中したい時はぜひ配信にお越しください`;
};

/**
 * 指定されたメッセージが「levelup XXm」形式かどうかを判定する
 * @param messageText - 判定するメッセージテキスト
 * @returns 「levelup XXm」形式の場合はtrue
 */
export const isLevelUpMessage = (messageText: string): boolean =>
  messageText.toLowerCase().trim() === parameter.GAME_START_FLAG;

/**
 * レベルアップメッセージを生成
 * @param user - ユーザー情報
 * @param wisdomGain - かしこさ上昇値
 * @returns レベルアップメッセージ
 */
export const getLevelUpMessage = (user: User, beforeWisdom: number, AfterWisdom: number): string => {
  return `@${user.displayName}のレベル${user.level + 1}に上がった!!🎉 かしこさ🧠: ${beforeWisdom} ► ${AfterWisdom}`;
};

/**
 * 名前を付与したリフレッシュメッセージを取得する
 * @param displayName - ユーザーの表示名▶
 * @returns 名前を付与したリフレッシュメッセージ
 */
export const getRefreshMessageByUser = (displayName: string): string => {
  return `@${displayName}さん ${REFRESH_MESSAGE}`;
};