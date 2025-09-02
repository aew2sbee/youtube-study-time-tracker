import { logger } from '@/utils/logger';
import { db } from '@/db';
import { users } from '@/db/schema';
import { User } from '@/types/users';
import { eq, and } from 'drizzle-orm';
import { VIDEO_ID } from '@/app/api/youtube/route';

// データを保存する関数
export const saveUser = async (user: User) => {
  logger.info(`saveUser - ${user.name} ${user.timeSec}`);
  let res;
  const existingUser = await hasUser(user);
  if (existingUser.length > 0) {
    // 既存のユーザーデータを更新
    res = await updateTimeSec(user, existingUser[0].id);
  } else {
    // 新しいユーザーデータとして追加
    res = await insertUser(user);
  }
  logger.info(`savedUser - ${res[0].name} ${res[0].timeSec}`);
  return res;
};

export const updateTimeSec = async (user: User, userId: number) => {
  logger.info(`updateTimeSec - ${user.name} ${user.timeSec}`);
  const res = await db.update(users).set({ timeSec: user.timeSec }).where(eq(users.id, userId)).returning();
  if (res.length > 0) {
    logger.info(`updatedTimeSec - ${user.name} ${user.timeSec} => ${res[0].timeSec}`);
  } else {
    logger.warn(`updatedTimeSec - ${user.name} id not found: ${userId}`);
  }
  return res;
};

export const insertUser = async (user: User) => {
  logger.info(`insertUser - ${user.name} ${user.timeSec}`);
  const res = await db
    .insert(users)
    .values({
      channelId: user.channelId,
      name: user.name,
      timeSec: user.timeSec,
      videoId: VIDEO_ID,
    })
    .returning();
  logger.info(`insertedUser - ${user.name} ${user.timeSec}`);
  return res;
};

export const hasUser = async (user: User) => {
  logger.info(`hasUser - ${user.name} ${user.timeSec}`);
  const res = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.channelId, user.channelId), eq(users.videoId, VIDEO_ID)))
    .limit(1);
  if (res.length > 0) {
    logger.info(`existingUser - ${user.name} ${res[0].id}`);
  } else {
    logger.info(`existingUser - ${user.name} not found`);
  }
  return res;
};

export const getTotalTimeSec = async (channelId: string) => {
  logger.info(`getTotalTimeSec - ${channelId}`);
  const res = await db.select({ timeSec: users.timeSec }).from(users).where(eq(users.channelId, channelId));
  const totalTimeSec = res.reduce((acc, curr) => acc + curr.timeSec, 0);
  logger.info(`totalTimeSec - ${channelId} ${totalTimeSec}`);
  return totalTimeSec;
};
