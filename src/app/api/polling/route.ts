import { NextResponse } from 'next/server';
import { processPolling } from '@/server/usecases';
import { getAllUsers } from '@/server/store/user';
import { logger } from '@/server/lib/logger';

/**
 * ポーリングエンドポイント（クライアント駆動）
 * - クライアントからのSWRポーリングで実行される
 * - YouTube APIからメッセージ取得
 * - ビジネスロジック処理
 * - userStoreの最新状態を返却
 * @returns ユーザー一覧のJSONレスポンス
 */
export async function GET() {
  try {


    // サーバー側のポーリング処理を実行
    await processPolling();

    // 最新のユーザー情報を取得
    const users = getAllUsers();

    logger.info(`ポーリング完了: ${users.length}人のユーザー情報を返却`);

    return NextResponse.json(
      { users },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    logger.error(`ポーリング処理エラー: ${error}`);
    return NextResponse.json(
      { error: 'ポーリング処理に失敗しました', users: [] },
      { status: 500 }
    );
  }
}
