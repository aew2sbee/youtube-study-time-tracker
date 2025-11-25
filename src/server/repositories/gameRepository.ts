import { logger } from '@/server/lib/logger';
import { db } from '@/server/db';
import { study, stats } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { getUserByChannelId } from './userRepository';
import { User } from '@/types/users';

export type StatsRow = typeof stats.$inferSelect;
export type StudyRow = typeof study.$inferSelect;
export type InsertStudyRow = typeof study.$inferInsert;

/**
 * channelIdからゲームステータス情報を取得する
 * @param channelId - チャンネルID
 * @returns ゲームステータス情報（存在しない場合はnull）
 */
export const getStatsByChannelId = async (channelId: string): Promise<StatsRow | null> => {
  const user = await getUserByChannelId(channelId);
  if (!user) {
    logger.info(`getStatsByChannelId: ユーザーが見つかりません channelId=${channelId}`);
    return null;
  }

  const rows = await db
    .select()
    .from(stats)
    .where(eq(stats.userId, user.id));

  if (rows.length === 0) {
    logger.info(`getStatsByChannelId: ステータスが見つかりません channelId=${channelId}`);
    return null;
  }

  logger.info(`getStatsByChannelId: ステータスを取得しました channelId=${channelId}`);
  return rows[0];
};

/**
 * Statsを保存する（存在しなければ作成、存在すれば更新）
 * @param user - ユーザー情報
 * @returns 保存されたStatsRow（ユーザーが見つからない場合はnull）
 */
export const saveStatsByChannelId = async (user: User): Promise<StatsRow | null> => {
  const dbUser = await getUserByChannelId(user.channelId);
  if (!dbUser) {
    logger.info(`saveStatsByChannelId: ユーザーが見つかりません channelId=${user.channelId}`);
    return null;
  }

  const existingStats = await getStatsByChannelId(user.channelId);

  if (existingStats) {
    // 既存のStatsを更新
    const updated = await db
      .update(stats)
      .set({ expSec: user.exp, updatedAt: new Date() })
      .where(eq(stats.userId, dbUser.id))
      .returning();
    logger.info(`saveStatsByChannelId: ステータスを更新しました channelId=${user.channelId}`);
    return updated[0];
  } else {
    // 新規Statsを作成
    const inserted = await db
      .insert(stats)
      .values({ userId: dbUser.id, expSec: user.exp })
      .returning();
    logger.info(`saveStatsByChannelId: ステータスを作成しました channelId=${user.channelId}`);
    return inserted[0];
  }
};
