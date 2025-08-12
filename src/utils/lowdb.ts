import { User } from '@/types/users';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { logger } from './logger';

// データベース全体の型
interface DatabaseData {
  user: User[];
}

// デフォルトデータ
const defaultData: DatabaseData = {
  user: []
};

// データベースを初期化
const adapter = new JSONFile<DatabaseData>('database/db.json');
const db = new Low<DatabaseData>(adapter, defaultData);

// データを保存する関数
export const saveJson = async (user: User) => {
  await db.read();
  // dateKeyが存在しない場合は初期化
  if (!db.data.user) db.data.user = [];

  db.data.user.push(user);
  // ファイルに書き込み
  await db.write();
  logger.info(`Saved user data - ${user.name} ${user.timeSec} seconds`);
}


export const getUserData = async (): Promise<User[]> => {
  await db.read();
  // dateKeyが存在しない場合は空のオブジェクトを返す
  if (!db.data.user) {
    logger.info(`No user data`);
    return [];
  }
  logger.info(`User data - ${db.data.user.length}`);
  return db.data.user;
}
