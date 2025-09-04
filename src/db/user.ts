import { logger } from '@/utils/logger';
import { db } from '@/db';
import { users } from '@/db/schema';
import { User } from '@/types/users';
import { eq, and } from 'drizzle-orm';
import { VIDEO_ID } from '@/app/api/youtube/route';
/** データベースのusersテーブルから推論される行型 */
type UserRow = typeof users.$inferSelect;

/**
 * ユーザーデータをデータベースに保存します。既存ユーザーの場合は更新、新規ユーザーの場合は挿入します。
 * @param user - 保存するユーザーオブジェクト
 * @returns 保存されたユーザーデータの配列
 * @example
 * const result = await saveUser({
 *   channelId: 'UC123',
 *   name: 'テストユーザー',
 *   timeSec: 3600,
 *   profileImageUrl: 'https://example.com/avatar.jpg',
 *   updateTime: new Date(),
 *   isStudying: false
 * });
 */
export const saveUser = async (user: User) => {
  logger.info(`saveUser - ${user.name} ${user.timeSec}`);
  let res: UserRow[];
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

/**
 * 指定されたユーザーIDの学習時間を更新します。
 * @param user - 更新するユーザーオブジェクト
 * @param userId - 更新対象のユーザーID
 * @returns 更新されたユーザーデータの配列
 */
export const updateTimeSec = async (user: User, userId: number) => {
  logger.info(`updateTimeSec - ${user.name} ${user.timeSec}`);
  const res = await db.update(users).set({ timeSec: user.timeSec }).where(eq(users.id, userId)).returning();
  if (res.length > 0) {
    logger.info(`updatedTimeSec - ${user.name} ${user.timeSec} => ${res[0]?.timeSec}`);
  } else {
    logger.warn(`updatedTimeSec - ${user.name} id not found: ${userId}`);
  }
  return res;
};

/**
 * 新しいユーザーをデータベースに挿入します。
 * @param user - 挿入するユーザーオブジェクト
 * @returns 挿入されたユーザーデータの配列
 */
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

/**
 * 指定されたユーザーがデータベースに存在するかチェックします。
 * @param user - 検索するユーザーオブジェクト
 * @returns 見つかった場合はユーザーIDを含む配列、見つからない場合は空配列
 */
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

/**
 * 指定されたチャンネルIDの全ての動画における総学習時間を取得します。
 * @param channelId - 検索するユーザーのチャンネルID
 * @returns 総学習時間（秒）
 * @example
 * const totalTime = await getTotalTimeSec('UC123');
 * console.log(`総学習時間: ${totalTime}秒`);
 */
export const getTotalTimeSec = async (channelId: string) => {
  logger.info(`getTotalTimeSec - ${channelId}`);
  const res = await db.select({ timeSec: users.timeSec }).from(users).where(eq(users.channelId, channelId));
  const totalTimeSec = res.reduce((acc, curr) => acc + curr.timeSec, 0);
  logger.info(`totalTimeSec - ${channelId} ${totalTimeSec}`);
  return totalTimeSec;
};
