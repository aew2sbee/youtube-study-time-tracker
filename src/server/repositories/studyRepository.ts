import { logger } from '@/server/lib/logger';
import { db } from '@/server/db';
import { study } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { User } from '@/types/users';
import { getUserByChannelId, insertUser } from './userRepository';

export type StudyRow = typeof study.$inferSelect;
export type InsertStudyRow = typeof study.$inferInsert;

const VIDEO_ID = process.env.VIDEO_ID;

export const saveLog = async (user: User) => {
  logger.info(`savelog: ${user.displayName}`);
  const existing = await getUserByChannelId(user.channelId);
  // 既存ユーザー
  if (existing) {
    const studyId = await hasSameVideoData(existing.id, user)
    if (studyId) {
      logger.info(`savelog: 同じvideo_idのデータを更新します。${user.displayName}`);
      await updateStudy(studyId, user);
    } else {
      logger.info(`savelog: 新しいデータを追加します。${user.displayName}`);
      await insertStudy(existing.id, user);
    }
  } else {
    // 新規ユーザー登録
    const userRows = await insertUser(user);
    await insertStudy(userRows.id, user);
    logger.info(`savelog: 新規ユーザーを追加しました。${user.displayName}`);
  }
};

export const insertStudy = async (userId: number, user: User) => {
  logger.info(`insertStudy name=${user.displayName}`);
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
    logger.info(`videoIdが指定されていません。: ${user.displayName}`);
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
    logger.info(`同じvideo_idのデータを見つけました。: ${user.displayName} videoId=${VIDEO_ID}`);
    return res[0].id;
  } else {
    logger.info(`同じvideo_idのデータはありませんでした。: ${user.displayName} videoId=${VIDEO_ID}`);
    return null;
  }
};

export const getStudyTimeStatsByChannelId = async (channelId: string) => {
  const user = await getUserByChannelId(channelId);
  if (!user) {
    logger.info(`getStudyTimeStatsByChannelId: user not found channelId=${channelId}`);
    return {
      totalDays: 0,
      totalTime: 0,
      last7Days: 0,
      last7DaysTime: 0,
      last7DaysDays: 0,
      last28DaysTime: 0
    };
  }

  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = new Date(now - 28 * 24 * 60 * 60 * 1000);

  // 全期間のデータを1回のクエリで取得
  const allRows = await db
    .select({ timeSec: study.timeSec, timestamp: study.timestamp })
    .from(study)
    .where(eq(study.userId, user.id));

  // 全期間の集計
  const totalTime = allRows.reduce((acc, r) => acc + r.timeSec, 0);
  const totalDays = new Set(allRows.map(r => r.timestamp.toISOString().split('T')[0])).size;

  // 過去7日間のデータをフィルタリング
  const last7DaysRows = allRows.filter(r => r.timestamp >= sevenDaysAgo);
  const last7DaysTime = last7DaysRows.reduce((acc, r) => acc + r.timeSec, 0);
  const last7Days = new Set(last7DaysRows.map(r => r.timestamp.toISOString().split('T')[0])).size;

  // 過去28日間のデータをフィルタリング
  const last28DaysRows = allRows.filter(r => r.timestamp >= twentyEightDaysAgo);
  const last28DaysTime = last28DaysRows.reduce((acc, r) => acc + r.timeSec, 0);
  const last28Days = new Set(last28DaysRows.map(r => r.timestamp.toISOString().split('T')[0])).size;

  logger.info(`getStudyTimeStatsByChannelId: channelId=${channelId} total=${totalTime} (${totalDays}日) last7DaysTime=${last7DaysTime} (${last7Days}日) last28DaysTime=${last28DaysTime} (${last28Days}日)`);

  return {
    totalDays,
    totalTime,
    last7Days,
    last7DaysTime,
    last28Days,
    last28DaysTime,
  };
};
