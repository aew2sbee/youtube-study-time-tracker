import { StudyTimeUser } from '@/types/youtube';
import { JSONFilePreset } from 'lowdb/node';

// 月別合計時間の型
interface MonthlyTotalTimeSec {
  [key: string]: number; // "202501": 0, "202502": 0 など
}

// 日別ユーザーデータの型
interface DailyUsers {
  [key: string]: StudyTimeUser[]; // "20250805": [] など
}

// データベース全体の型
interface DatabaseData {
  monthlyTotalTimeSec: MonthlyTotalTimeSec;
  users: DailyUsers;
}

// デフォルトデータ
const defaultData: DatabaseData = {
  monthlyTotalTimeSec: {},
  users: {}
};


// データを保存する関数
export const savedb = async (currentTime:Date, userData: StudyTimeUser[], totalTimeSec:number) => {
    const dateKey = getdateKey(currentTime)
    // 現在の月を取得（YYYYMM形式）
    const monthKey = getmonthKey(currentTime)

  // データベースを初期化
  const db = await JSONFilePreset<DatabaseData>('database/db.json', defaultData);

  // dateKeyが存在しない場合は初期化
  if (!db.data.users[dateKey]) {
    db.data.users[dateKey] = [];
  }

  // monthKeyが存在しない場合は初期化
  if (!db.data.monthlyTotalTimeSec[monthKey]) {
    db.data.monthlyTotalTimeSec[monthKey] = 0;
  }

  // 引数のデータを保存
  db.data.users[dateKey] = userData;
  db.data.monthlyTotalTimeSec[monthKey] = totalTimeSec;

  // ファイルに書き込み
  await db.write();

  console.log('データが保存されました:', db.data.monthlyTotalTimeSec[monthKey]);
  console.log('データが保存されました:', db.data.users[dateKey].length);
}

// 月別の合計時間を取得する関数
export const getMonthlyTotalTime = async (monthKey: string): Promise<number> => {
  // データベースを初期化
  const db = await JSONFilePreset<DatabaseData>('database/db.json', defaultData);
  // monthKeyが存在しない場合は0を返す
  if (!db.data.monthlyTotalTimeSec[monthKey]) {
    return 0;
  }

  return db.data.monthlyTotalTimeSec[monthKey];
}

// 現在の月の合計時間を取得する関数
export const getCurrentMonthTotalTime = async (now: Date): Promise<number> => {
  const monthKey = getmonthKey(now)
  return await getMonthlyTotalTime(monthKey);
}


const getdateKey = (now: Date) => now.toISOString().slice(0, 10).replace(/-/g, '');
const getmonthKey = (now: Date) => now.toISOString().slice(0, 7).replace('-', '');