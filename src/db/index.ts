import { drizzle } from 'drizzle-orm/better-sqlite3';
import { users } from './schema';
import path from 'path';
import fs from 'fs';

// データベースファイルのパス
const DB_PATH = path.join(process.cwd(), 'database', 'sqlite.db');

let _db: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  // サーバーサイドでのみ実行
  if (typeof window !== 'undefined') {
    throw new Error('Database access is only available on the server side');
  }

  if (!_db) {
    // 動的インポートでbetter-sqlite3を読み込み
    const Database = require('better-sqlite3');

    // データベースディレクトリが存在しない場合は作成
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // SQLiteデータベース接続
    const sqlite = new Database(DB_PATH);
    _db = drizzle(sqlite);
  }
  return _db;
};

// 後方互換性のため - 実行時にのみ初期化される
export const db = new Proxy({} as any, {
  get(target, prop) {
    return getDb()[prop as keyof typeof target];
  }
});

// スキーマをエクスポート
export { users };