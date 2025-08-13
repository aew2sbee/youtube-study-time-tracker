import { parameter } from "@/config/system";


export const CHAT_MESSAGE = [
  '素晴らしい努力ですね!!',
  'よく頑張っていらっしゃいますね!!',
  '丁寧に取り組まれていますね!!',
  '着実に進められていますね!!',
  'とても集中されていますね!!',
  '頑張りが目に見えますね!!',
  '努力の成果が表れていますね!!',
  '忍耐強く続けていらっしゃいますね!!',
  '着実に理解が深まっていますね!!',
  '前向きに取り組まれていますね!!',
  '細かいところまで気を配られていますね!!',
  '誠実に取り組まれていますね!!',
  '熱心に取り組まれていますね!!',
  '労力がしっかりと感じられますね!!',
  '確実にステップを踏まれていますね!!',
  '集中力が素晴らしいですね!!',
  '立派な努力です!!',
  '継続する姿勢が素晴らしいですね!!',
  '注意深く取り組まれていますね!!',
  '頑張り続ける姿が印象的です!!',
]

/**
 * 指定されたメッセージが学習開始メッセージかどうかを判定します。
 * @param {string} messageText - 判定するメッセージテキスト
 * @returns {boolean} 学習開始メッセージの場合はtrue
 */
export const isStartMessage = (messageText: string): boolean => messageText.toLowerCase().trim() === parameter.START_STUDY_KEYWORDS;

/**
 * 指定されたメッセージが学習終了メッセージかどうかを判定します。
 * @param {string} messageText - 判定するメッセージテキスト
 * @returns {boolean} 学習終了メッセージの場合はtrue
 */
export const isEndMessage = (messageText: string): boolean => messageText.toLowerCase().trim() === parameter.END_STUDY_KEYWORDS;
