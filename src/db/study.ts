import { logger } from '@/utils/logger';
import { db } from '@/db';
import { study } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { User } from '@/types/users';
import { getUserByChannelId, insertUser } from './user';

export type StudyRow = typeof study.$inferSelect;
export type InsertStudyRow = typeof study.$inferInsert;

export const saveLog = async (user: User) => {
  logger.info(`savelog: ${user.name}`);
  const existing = await getUserByChannelId(user.channelId);
  if (!existing) {
    // 新規ユーザー登録
    const userRows = await insertUser(user);
    await insertStudy(userRows[0].id, user);
    return userRows;
  } else {
    // 既存ユーザー
    if (await checkStudy(existing.id, user)) {
      logger.info(`savelog: 重複データがありました。${user.name}`);
    } else {
      await insertStudy(existing.id, user);
    }
  }
};

export const insertStudy = async (userId: number, user: User) => {
  logger.info(`insertStudy name=${user.name}`);
  const res = await db
    .insert(study)
    .values({
      userId,
      timeSec: user.timeSec,
      timestamp: typeof user.updateTime === 'string' ? new Date(user.updateTime) : user.updateTime,
    })
    .returning();
  return res[0];
};

export const checkStudy = async (userId: number, user: User) => {
  const res = await db
    .select()
    .from(study)
    .where(
      and(
        eq(study.userId, userId),
        eq(study.timeSec, user.timeSec),
        eq(study.timestamp, typeof user.updateTime === 'string' ? new Date(user.updateTime) : user.updateTime),
      ),
    );
  logger.info(`checkStudy count=${res.length}`);
  return res.length > 0;
};

export const getTotalTimeSecByChannelId = async (channelId: string) => {
  const user = await getUserByChannelId(channelId);
  if (!user) {
    logger.info(`getTotalTimeSecByChannelId: user not found channelId=${channelId}`);
    return 0;
  }
  const rows = await db.select({ timeSec: study.timeSec }).from(study).where(eq(study.userId, user.id));
  const total = rows.reduce((acc, r) => acc + r.timeSec, 0);
  logger.info(`getTotalTimeSecByChannelId: channelId=${channelId} total=${total}`);
  return total;
};
