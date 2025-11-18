import { logger } from '@/utils/logger';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
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
  const rows = await db.select().from(users).where(eq(users.channelId, channelId));
  return rows[0];
};

export const updateUserNameByChannelId = async (channelId: string, name: string) => {
  logger.info(`updateUserNameByChannelId name=${name}`);
  const existing = await getUserByChannelId(channelId);
  if (existing.name === name) {
    logger.info(`updateUserNameByChannelId same name=${existing.name}`);
    return;
  } else {
    logger.info(`updateUserNameByChannelId diff name=${existing.name}`);
    return await db.update(users).set({ name }).where(eq(users.channelId, channelId)).returning();
  }
};
