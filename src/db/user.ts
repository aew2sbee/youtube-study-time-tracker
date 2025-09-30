import { logger } from '@/utils/logger';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User } from '@/types/users';

// 型
export type UserRow = typeof users.$inferSelect;
export type InsertUserRow = typeof users.$inferInsert;

export const insertUser = async (user: User) => {
  logger.info(`insertUser name=${user.name}`);
  const res = await db.insert(users).values({ channelId: user.channelId, name: user.name }).returning();
  logger.info(`insertUser new name=${res[0].name}`);
  return res[0];
};

export const getUserByChannelId = async (channelId: string) => {
  return await db.query.users.findFirst({
    where: eq(users.channelId, channelId),
  });
};

export const updateUserNameByChannelId = async (channelId: string, name: string) => {
  logger.info(`updateUserNameByChannelId name=${name}`);
  const existing = await getUserByChannelId(channelId);
  if (existing && existing.name === name) {
    logger.info(`updateUserNameByChannelId same name=${existing.name}`);
    return;
  } else {
    logger.info(`updateUserNameByChannelId diff name`);
    return await db.update(users).set({ name }).where(eq(users.channelId, channelId)).returning();
  }
};
