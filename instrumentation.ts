import { parameter } from '@/config/system';
import { logger } from '@/server/lib/logger';
import { getLiveChatMessages, nextPageToken, removeMentionPrefix } from '@/server/lib/youtubeHelper';
import { setUserByMessage } from '@/server/lib/processorMessage';
import { updateAllUsersTime } from '@/server/lib/processorTime';

/**
 * Next.js Instrumentation Hook
 * サーバー起動時に1回だけ実行され、1分おきにYouTubeライブチャットをポーリングします
 */
export async function register() {
  // サーバー側でのみ実行
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    logger.info('サーバー側のポーリング処理を開始します');

    /**
     * YouTubeライブチャットをポーリングする処理
     */
    const pollLiveChat = async () => {
      try {
        logger.info(`YouTubeライブチャットをポーリング中 - pageToken: ${nextPageToken || 'なし'}`);

        const messages = await getLiveChatMessages();

        if (messages.length > 0) {
          logger.info(`${messages.length}件のメッセージを取得しました`);

          // 各メッセージを処理
          for (const message of messages) {
            try {
              await setUserByMessage(message);
            } catch (error) {
              const displayName = removeMentionPrefix(message.authorDetails?.displayName || '');
              logger.error(`${displayName}のメッセージ処理中にエラーが発生しました - ${error}`);
            }
          }
        } else {
          logger.info('新しいメッセージはありません');
        }
      } catch (error) {
        logger.error(`ライブチャットのポーリング中にエラーが発生しました - ${error}`);
      }
    };

    // 初回実行（サーバー起動直後）
    pollLiveChat().catch((error) => {
      logger.error(`初回ポーリング実行時にエラーが発生しました - ${error}`);
    });

    // メッセージポーリングを定期実行
    setInterval(() => {
      pollLiveChat().catch((error) => {
        logger.error(`定期ポーリング実行時にエラーが発生しました - ${error}`);
      });
    }, parameter.API_POLLING_INTERVAL);

    logger.info(`メッセージポーリング間隔: ${parameter.API_POLLING_INTERVAL}ms (${parameter.API_POLLING_INTERVAL / 1000}秒)`);

    // 時間更新を定期実行
    setInterval(() => {
      updateAllUsersTime().catch((error) => {
        logger.error(`時間更新処理中にエラーが発生しました - ${error}`);
      });
    }, parameter.API_POLLING_INTERVAL);

    logger.info(`時間更新間隔: ${parameter.API_POLLING_INTERVAL}ms (${parameter.API_POLLING_INTERVAL / 1000}秒)`);
  }
}
