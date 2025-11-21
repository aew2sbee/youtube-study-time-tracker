import { postYouTubeComment } from '../lib/youtubeHelper';
import { logger } from '../lib/logger';

/**
 * コメント投稿用のキューアイテム
 */
interface PostQueueItem {
  message: string;
  userName: string;
}

/**
 * コメント投稿キュー
 */
const postQueue: PostQueueItem[] = [];

/**
 * キュー処理中フラグ
 */
let isProcessing = false;

/**
 * コメントをキューに追加するだけ（処理は開始しない）
 * @param userName - ユーザー名（ログ用）
 * @param message - 投稿するメッセージ
 */
export const pushQueue = (userName: string, message: string): void => {
  postQueue.push({ message, userName });
  logger.info(`コメントをキューに追加しました: ${userName}`);
};

/**
 * キューを処理する（キューが空になるまで繰り返す）
 */
export const processQueue = async (): Promise<void> => {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  logger.info('キュー処理を開始します');

  try {
    while (postQueue.length > 0) {
      const item = postQueue.shift();
      if (!item) {
        break;
      }

      try {
        await postYouTubeComment(item.message, item.userName);
        logger.info(`コメント投稿完了: ${item.userName} (残りキューサイズ: ${postQueue.length})`);
      } catch (error) {
        logger.error(`コメント投稿失敗: ${item.userName} - ${error}`);
      }

      // 1秒スリープ（YouTube API rate limit対策）
      if (postQueue.length > 0) {
        logger.info('1秒待機します...');
        await sleep(1000);
      }
    }

    logger.info('キュー処理が完了しました');
  } finally {
    isProcessing = false;
  }
};

/**
 * 指定されたミリ秒数だけ待機する
 * @param ms - 待機時間（ミリ秒）
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
