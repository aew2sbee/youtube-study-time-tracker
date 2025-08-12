import { User } from '@/types/users';
import { logger } from './logger';
import { JSONFilePreset } from 'lowdb/node';

// データベース全体の型
interface DatabaseData {
  user: User[];
}

// デフォルトデータ
const defaultData: DatabaseData = {
  user: []
};

// データベースを初期化
const db = await JSONFilePreset<DatabaseData>('database/db.json', defaultData);

// データを保存する関数
export const saveJson = async (user: User) => {
  await db.read();
  // dateKeyが存在しない場合は初期化
  if (!db.data.user) db.data.user = [];

  logger.info(`Before save - total users: ${db.data.user.length}`);

  // 重複チェック: 同じchannelIdとupdateTimeの組み合わせが既に存在するかチェック
  const existingUserIndex = db.data.user.findIndex(
    (existingUser) =>
      existingUser.channelId === user.channelId &&
      existingUser.updateTime === user.updateTime
  );

  if (existingUserIndex >= 0) {
    // 既存のユーザーデータを更新
    db.data.user[existingUserIndex] = user;
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
}


export const getUserData = async (user: User): Promise<User[]> => {
  await db.read();
  // dateKeyが存在しない場合は空のオブジェクトを返す
  if (!db.data.user) {
    logger.error(`No data`);
    return [];
  }
  logger.info(`User data - ${user.name} ${user.channelId}`);
  const users = db.data.user.filter((u) => u.channelId === user.channelId);
  if (users.length === 0) {
    logger.warn(`No user data found for channelId: ${user.channelId}`);
  }
  return users;
}
