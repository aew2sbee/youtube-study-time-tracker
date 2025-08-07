import { StudyTimeUser } from '@/types/youtube';
import { JSONFilePreset } from 'lowdb/node';

// 月別合計時間の型
interface MonthlyTotalTimeSec {
  [key: string]: number; // "202501": 0, "202502": 0 など
}

// データベース全体の型
interface DatabaseData {
  monthlyTotalTimeSec: MonthlyTotalTimeSec;
  studyLogs: StudyTimeUser[];
}

// デフォルトデータ
const defaultData: DatabaseData = {
  monthlyTotalTimeSec: {},
  studyLogs: []
};

// データベースを初期化
const db = await JSONFilePreset<DatabaseData>('database/db.json', defaultData);

const getmonthKey = (now: Date) => now.toISOString().slice(0, 7).replace('-', '');

// データを保存する関数
export const writeJson = async (currentTime: Date, userData: StudyTimeUser[], totalTimeSec:number) => {
  // 現在の月を取得（YYYYMM形式）
  const monthKey = getmonthKey(currentTime)

  // dateKeyが存在しない場合は初期化
  if (!db.data.studyLogs) db.data.studyLogs = [];

  // monthKeyが存在しない場合は初期化
  if (!db.data.monthlyTotalTimeSec[monthKey]) db.data.monthlyTotalTimeSec[monthKey] = 0;

  db.data.monthlyTotalTimeSec[monthKey] = totalTimeSec;
  // 引数のデータを保存
  for (const user of userData) {
      db.data.studyLogs.push(user);
    }

  // ファイルに書き込み
  await db.write();

  console.log('データが保存されました:', db.data.monthlyTotalTimeSec[monthKey]);
  console.log('データが保存されました:', db.data.studyLogs.length);
}


export const getUserData = async (): Promise<StudyTimeUser[]> => {
  // dateKeyが存在しない場合は空のオブジェクトを返す
  if (!db.data.studyLogs) return [];
  return db.data.studyLogs;
}

// 月別の合計時間を取得する関数
export const getMonthlyTotalTime = async (monthKey: string): Promise<number> => {
  // monthKeyが存在しない場合は0を返す
  if (!db.data.monthlyTotalTimeSec[monthKey]) return 0;
  return db.data.monthlyTotalTimeSec[monthKey];
}

// 現在の月の合計時間を取得する関数
export const getCurrentMonthTotalTime = async (currentTime: Date): Promise<number> => {
  const monthKey = getmonthKey(currentTime)
  return await getMonthlyTotalTime(monthKey);
}
