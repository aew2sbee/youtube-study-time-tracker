import { parameter } from "@/config/system";


export const CHAT_MESSAGE = [
  'おぉ〜、やるやんか！お母ちゃんびっくりしたで！',
  'あんた、ほんまに賢なったなぁ〜。えらいえらい！',
  'そんなん出来るようになったん？かっこええやん！',
  'お母ちゃん泣いてまうわ、成長しすぎや〜',
  'さすがやなぁ、あんた努力の天才やで',
  'それ聞いたら、もう誇らしゅうて仕方ないわ',
  'あんたの頭の中、きっと金ピカやな',
  'おぉ、そんな難しいこと出来るようになったんか！参ったわ',
  '努力はウソつかへんな、あんた見てたら分かるわ',
  '今日はあんたの好きなもん作ったるわ、ご褒美や！',
  'あんた、ほんまにコツコツやってたんやなぁ…感心するわ',
  'せやからお母ちゃん、あんた信じてたんやで',
  'えぇ〜！もうそんなレベルまで行ったん？びっくり仰天や！',
  'あんたのその頑張り、宝もんやわ',
  'やっぱりうちの子はちゃうなぁ〜',
  'あんたの成長スピード、チャリより速いで！',
  'ようやったなぁ〜！ほんまによぅ頑張った！',
  'お母ちゃん、もう近所に自慢してくるわ',
  'えらすぎて、なんかご利益ありそうやわ',
  'あんた、もう博士やな！“博士”って呼んだろか',
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