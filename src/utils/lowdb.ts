import { logger } from './logger';
import { JSONFilePreset } from 'lowdb/node';
interface LogUser {
  channelId: string;
  name: string;
  timeSec: number;
  updateTime: Date;
}
// データベース全体の型
interface DatabaseData {
  user: LogUser[];
}

// デフォルトデータ
const defaultData: DatabaseData = {
  user: [],
};

// データベースを初期化
const db = await JSONFilePreset<DatabaseData>('database/db.json', defaultData);

// データを保存する関数
export const saveJson = async (user: LogUser) => {
  await db.read();
  // dateKeyが存在しない場合は初期化
  if (!db.data.user) db.data.user = [];

  logger.info(`Before save - total users: ${db.data.user.length}`);

  const existingUserIndex = db.data.user.findIndex(
    (existingUser: LogUser) => existingUser.channelId === user.channelId,
  );

  if (existingUserIndex >= 0) {
    // 既存のユーザーデータを更新
    db.data.user[existingUserIndex] = {
      ...db.data.user[existingUserIndex],
      timeSec: db.data.user[existingUserIndex].timeSec + user.timeSec, // 既存の時間に追加
      updateTime: user.updateTime,
    };
    logger.info(`Updated existing user data - ${user.name} ${user.timeSec} seconds`);
  } else {
    // 新しいユーザーデータとして追加
    db.data.user.push(user);
    logger.info(`Added new user data - ${user.name} ${user.timeSec} seconds`);
  }

  logger.info(`After operation - total users: ${db.data.user.length}`);

  // ファイルに書き込み
  await db.write();
  logger.info(`Saved user data - ${user.name} ${user.timeSec} seconds, total count: ${db.data.user.length}`);
};

export const getUserData = async (user: LogUser): Promise<LogUser | undefined> => {
  await db.read();
  // dateKeyが存在しない場合は空のオブジェクトを返す
  if (!db.data.user) {
    logger.error(`No data`);
  }
  logger.info(`User data - ${user.name} ${user.channelId}`);
  const existingUser = db.data.user.find((u: LogUser) => u.channelId === user.channelId);
  if (existingUser) {
    logger.info(`User data length - ${existingUser.name}`);
    return existingUser;
  }
  logger.warn(`No user data found for channelId: ${user.channelId}`);
};
