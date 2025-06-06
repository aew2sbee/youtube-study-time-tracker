import { StudyRecord } from '@/types/chat';
import fs from 'fs/promises';
import path from 'path';

const getYear = (utcDate: Date) => utcDate.getFullYear().toString();
const getMonth = (utcDate: Date) =>
  String(utcDate.getMonth() + 1).padStart(2, '0');
const getDay = (utcDate: Date) => String(utcDate.getDate()).padStart(2, '0');

export const saveJson = async (utcDate: Date, jsonData: StudyRecord[]) => {
  // JSTの "YYYY/MM/DD" 形式に変換
  const year = getYear(utcDate);
  const month = getMonth(utcDate);
  const day = getDay(utcDate);

  // 保存先ディレクトリとファイル名
  const dirPath = path.join(
    process.cwd(),
    'src',
    'data',
    year.toString(),
    month
  );
  const filePath = path.join(dirPath, `${day}.json`);

  // ディレクトリがなければ作成
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
};

export const readJson = async (utcDate: Date) => {
  const year = getYear(utcDate);
  const month = getMonth(utcDate);
  const day = getDay(utcDate);
  const filePath = path.join(
    process.cwd(),
    'src',
    'data',
    year.toString(),
    month,
    `${day}.json`
  );
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
};
