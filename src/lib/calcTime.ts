import { parameter } from '@/config/system';
import { User } from '@/types/users';

export const calcStudyTime = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const safeDiffMs = Math.max(diffMs, 0); // マイナスにならないように
  return Math.floor(safeDiffMs / 1000);
};
export const calcTotalTime = (users: User[]): number => {
  const total = users.reduce((total, u) => total + u.timeSec, parameter.ADDITIONAL_STUDY_TIME);
  return total;
};

export const calcTime = (seconds: number): string => {
  if (seconds === 0) return '0h 00min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
};

export const calculateTargetValues = (totalTime: number) => {
  const targetPercentage = Math.floor((totalTime / parameter.TARGET_STUDY_TIME) * 100);
  const targetFlowerLevel = Math.min(Math.floor(targetPercentage / 10), 10);
  return { targetPercentage, targetFlowerLevel };
};

export const convertHHMMSS = (publishedAt: string) =>
  new Date(publishedAt).toLocaleTimeString('ja-JP', {
    hour12: false,
    timeZone: 'Asia/Tokyo',
  });

export const calcCurrentWeekTotalTime = (users: User[], today:Date): number => {
  const monday = getMonday(today)
  const sunday = getSunday(today);
  const currentWeek = users.filter(user => {
    const userDate = new Date(user.updateTime);
    return userDate >= monday && userDate <= sunday;
  });
  const currentWeekTimeSec = currentWeek.reduce((total, user) => total + user.timeSec, 0);
  return currentWeekTimeSec;
};

const getMonday = (today: Date): Date => {
  const day = today.getDay(); // 日曜日=0, 月曜日=1, ..., 土曜日=6
  const diff = (day === 0 ? -6 : 1) - day; // 日曜なら-6、それ以外は1 - dayで月曜との差を計算
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0); // 時刻は0時0分0秒にリセット
  return monday;
}

const getSunday = (today: Date): Date => {
  const dayOfWeek = today.getDay(); // 0:日曜, 1:月曜, ..., 6:土曜
  const diff = 0 - dayOfWeek; // 日曜日との差（日曜日は0）
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + diff);
  return sunday;
}