import { logger } from '@/utils/logger';
import { db } from '@/db';
import { study } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { User } from '@/types/users';
import { getUserByChannelId, insertUser } from './user';

export type StudyRow = typeof study.$inferSelect;
export type InsertStudyRow = typeof study.$inferInsert;

const VIDEO_ID = process.env.VIDEO_ID;

export const saveLog = async (user: User) => {
  logger.info(`savelog: ${user.name}`);
  const existing = await getUserByChannelId(user.channelId);
  // 既存ユーザー
  if (existing) {
    const studyId = await hasSameVideoData(existing.id, user)
    if (studyId) {
      logger.info(`savelog: 同じvideo_idのデータを更新します。${user.name}`);
      await updateStudy(studyId, user);
    } else {
      logger.info(`savelog: 新しいデータを追加します。${user.name}`);
      await insertStudy(existing.id, user);
    }
  } else {
    // 新規ユーザー登録
    const userRows = await insertUser(user);
    await insertStudy(userRows.id, user);
    logger.info(`savelog: 新規ユーザーを追加しました。${user.name}`);
  }
};

export const insertStudy = async (userId: number, user: User) => {
  logger.info(`insertStudy name=${user.name}`);
  const res = await db
    .insert(study)
    .values({
      userId,
      timeSec: user.timeSec,
      videoId: VIDEO_ID,
      timestamp: typeof user.updateTime === 'string' ? new Date(user.updateTime) : user.updateTime,
    })
    .returning();
  return res[0];
};

export const updateStudy = async (studyId: number, user: User) => {
    const res = await db
      .update(study)
      .set({
        timeSec: user.timeSec,
        timestamp: typeof user.updateTime === 'string' ? new Date(user.updateTime) : user.updateTime,
      })
      .where(eq(study.id, studyId))
      .returning();
    return res[0];
}

export const hasSameVideoData = async (userId: number, user: User) => {
  if (!VIDEO_ID) {
    logger.info(`videoIdが指定されていません。: ${user.name}`);
    return null;
  }

  const res = await db
    .select()
    .from(study)
    .where(
      and(
        eq(study.userId, userId),
        eq(study.videoId, VIDEO_ID)
      ),
    );
  logger.info(`checkStudy count=${res.length}`);
  if (res.length > 0) {
    logger.info(`同じvideo_idのデータを見つけました。: ${user.name} videoId=${VIDEO_ID}`);
    return res[0].id;
  } else {
    logger.info(`同じvideo_idのデータはありませんでした。: ${user.name} videoId=${VIDEO_ID}`);
    return null;
  }
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