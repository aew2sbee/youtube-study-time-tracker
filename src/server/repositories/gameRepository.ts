import { logger } from '@/server/lib/logger';
import { db } from '@/server/db';
import { stats } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { getUserByChannelId, insertUser } from './userRepository';
import { User } from '@/types/users';

// 型
export type StatsRow = typeof stats.$inferSelect;

export const saveStatsByChannelId = async (user: User): Promise<void> => {
  logger.info(`saveStats: ${user.displayName}`);
  const existing = await getUserByChannelId(user.channelId);
  // 既存ユーザー
  if (existing) {
    const statsId = await getStatsIdByuserId(existing.id);
    if (statsId) {
      await updateStats(statsId, user);
    } else {
      await insertStats(existing.id, user);
    }
  } else {
    // 新規ユーザー登録
    const userRows = await insertUser(user);
    await insertStats(userRows.id, user);
  }
};

export const getStatsByChannelId = async (channelId: string) => {
  const user = await getUserByChannelId(channelId);
  if (!user) {
    return null;
  }

  const res = await db
    .select()
    .from(stats)
    .where(eq(stats.userId, user.id));

  if (res.length === 0) {
    return null;
  }

  return res[0];
}


export const getStatsIdByuserId = async (userId: number) => {
  const res = await db
    .select()
    .from(stats)
    .where(eq(stats.userId, userId));

  if (res.length === 0) {
    return null;
  }

  return res[0].id;
};

export const updateStats = async (userId: number, user: User) => {
    const res = await db
      .update(stats)
      .set({ expSec: user.exp, updatedAt: new Date() })
      .where(eq(stats.userId, userId))
      .returning();
    return res[0];
}

export const insertStats = async (userId: number, user: User) => {
  const res = await db
    .insert(stats)
    .values({ userId: userId, expSec: user.exp })
    .returning();
  return res[0];
};