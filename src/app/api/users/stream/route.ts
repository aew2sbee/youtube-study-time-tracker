import { NextResponse } from 'next/server';
import { onUsersUpdate } from '@/server/lib/storeUser';
import { logger } from '@/server/lib/logger';
import { User } from '@/types/users';

/**
 * SSEエンドポイント
 * - UserStoreの更新をリアルタイムでクライアントにプッシュ
 * - Server-Sent Events (SSE)を使用
 */
export async function GET() {
  // SSEストリームを作成
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      logger.info('SSE接続を開始しました');

      // 初回データを送信
      const initialUsers: User[] = [];
      const initialData = `data: ${JSON.stringify({ users: initialUsers })}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // UserStore更新イベントのリスナーを登録
      const unsubscribe = onUsersUpdate((users) => {
        try {
          const data = `data: ${JSON.stringify({ users })}\n\n`;
          controller.enqueue(encoder.encode(data));
          logger.info(`SSE: ${users.length}人のユーザー情報を送信しました`);
        } catch (error) {
          logger.error(`SSE送信エラー: ${error}`);
        }
      });

      // Keep-Alive（30秒ごとにコメントを送信してコネクション維持）
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (error) {
          logger.error(`SSE Keep-Aliveエラー: ${error}`);
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      // 接続が閉じられたときのクリーンアップ
      const cleanup = () => {
        logger.info('SSE接続をクローズしました');
        unsubscribe();
        clearInterval(keepAliveInterval);
      };

      // クライアントが切断したときにクリーンアップ
      return cleanup;
    },
  });

  // SSEレスポンスヘッダーを設定
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginxのバッファリング無効化
    },
  });
}
