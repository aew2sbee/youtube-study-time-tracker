import { parameter } from '@/config/system';
import { logger } from '@/server/lib/logger';
import { setUserByMessage } from '@/server/lib/processorMessage';
import { updateAllUsersTime } from '@/server/lib/processorTime';
import { updateRefresh } from '@/server/lib/processorRefresh';
import { emitUsersUpdate } from '@/server/lib/storeUser';
import { processQueue } from '@/server/lib/storePost';

/**
 * Next.js Instrumentation Hook
 * サーバー起動時に1回だけ実行され、定期的にYouTubeライブチャットをポーリングします
 */
export async function register() {
  // サーバー側でのみ実行
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    logger.info('サーバー側のポーリング処理を開始します');

    // 定期実行
    setInterval(async () => {
      try {
        const now = new Date();

        // チャットメッセージ処理
        await setUserByMessage(now);
        // 時間更新処理
        await updateAllUsersTime(now);
        // リフレッシュ処理
        await updateRefresh();
        // コメントを投稿する
        await processQueue();
        // コメントを投稿する
        await emitUsersUpdate();
      } catch (error) {
        logger.error(`ポーリング処理中にエラーが発生しました - ${error}`);
      }
    }, parameter.API_POLLING_INTERVAL);

    logger.info(`ポーリング間隔: ${parameter.API_POLLING_INTERVAL}ms (${parameter.API_POLLING_INTERVAL / 1000}秒)`);
  }
}
