import { NextResponse } from 'next/server';
import { getAllActiveUsers } from '@/server/lib/userStore';
import { logger } from '@/server/lib/logger';

/**
 * GET /api/users
 * メモリストアからアクティブユーザー一覧を取得
 */
export async function GET() {
  try {
    const users = getAllActiveUsers();
    return NextResponse.json({ users });
  } catch (error) {
    logger.error(`ユーザー一覧の取得に失敗しました - ${error}`);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
