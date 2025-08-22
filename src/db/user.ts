import { logger } from './logger';
import { createDbClient, drizzleDb, users } from '@/db';
import { User } from '@/types/users';
import { eq, and, gte, lte } from 'drizzle-orm';

// データを保存する関数
export const saveUser = async (user: User) => {
  logger.info(`user - ${user.name} ${user.timeSec} ${user.updateTime}`);

  try {
    // 同じchannelIdで同じ日付のレコードを検索
    // updateTimeはDate型として保存するため、同日の判定は日付の開始時刻と終了時刻で範囲検索
    const userDate = new Date(user.updateTime);

    // 同じ日付の開始時刻と終了時刻を取得
    const startOfDay = new Date(userDate);
    startOfDay.setHours(0, 0, 0, 0); // 00:00:00.000

    const endOfDay = new Date(userDate);
    endOfDay.setHours(23, 59, 59, 999); // 23:59:59.999

    const existingUser = await drizzleDb
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.channelId, user.channelId),
          gte(users.updateTime, startOfDay),
          lte(users.updateTime, endOfDay)
        )
      )
      .limit(1);

    logger.info(`existingUser length - ${existingUser.length}`);

    if (existingUser.length > 0) {
      // 既存のユーザーデータを更新
      const updatedUser = await drizzleDb
        .update(users)
        .set({
          timeSec: user.timeSec,
          updateTime: userDate,
        })
        .where(eq(users.id, existingUser[0].id))
        .returning();

      logger.info(`Updated user data - ${user.name} ${user.updateTime} => ${updatedUser[0].timeSec}`);
    } else {
      // 新しいユーザーデータとして追加
      const newUser = await drizzleDb
        .insert(users)
        .values({
          channelId: user.channelId,
          name: user.name,
          timeSec: user.timeSec,
          updateTime: userDate,
        })
        .returning();

      logger.info(`Added user data - ${user.name} ${user.updateTime} 0 => ${newUser[0].timeSec}`);
    }

    logger.info(`Saved user data - ${user.name} ${user.timeSec} seconds`);
  } catch (error) {
    logger.error(`Database error saving user: ${error}`);
    throw error;
  }
};

// // getUserData関数（コメントアウト版から復活）
// export const getUserData = async (user: User): Promise<User[]> => {
//   try {
//     // 指定されたchannelIdのユーザーデータを取得
//     const existingUsers = await drizzleDb
//       .select({
//         channelId: users.channelId,
//         name: users.name,
//         timeSec: users.timeSec,
//         updateTime: users.updateTime
//       })
//       .from(users)
//       .where(eq(users.channelId, user.channelId));

//     if (existingUsers.length === 0) {
//       logger.warn(`No user data found for channelId: ${user.channelId}`);
//       return [];
//     }

//     logger.info(`User name - ${existingUsers[0].name}`);
//     logger.info(`User data - ${user.name} ${user.channelId}`);

//     // データベースの結果をUser型に変換
//     return existingUsers.map(dbUser => ({
//       channelId: dbUser.channelId,
//       name: dbUser.name,
//       timeSec: dbUser.timeSec,
//       isStudying: false, // 取得時は勉強中ではない状態とする
//       updateTime: dbUser.updateTime.toISOString(), // Date型をISO文字列に変換
//       startTime: undefined, // startTimeは実行時管理なのでundefined
//     }));

//   } catch (error) {
//     logger.error(`Database error getting user: ${error}`);
//     throw error;
//   }
// };