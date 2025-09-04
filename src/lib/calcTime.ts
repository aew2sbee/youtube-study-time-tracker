import { ADDITIONAL_STUDY_TIME } from '../../database/parameter';
import { parameter } from '@/config/system';
import { User } from '@/types/users';

export const calcStudyTime = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const safeDiffMs = Math.max(diffMs, 0); // マイナスにならないように
  return Math.floor(safeDiffMs / 1000);
};
export const calcTotalTime = (users: User[]): number => {
  const total = users.reduce((total, u) => total + u.timeSec, ADDITIONAL_STUDY_TIME ?? 0);
  return total;
};

export const calcTime = (seconds: number): string => {
  if (seconds === 0) return '0h 00min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
};

export const calcTimeJP = (seconds: number): string => {
  if (seconds === 0) return '0分';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}時${minutes.toString().padStart(2, '0')}分`;
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

export const convertYYYYMMDD = (updateTime: Date | string): string => {
  if (typeof updateTime === 'string') {
    return new Date(updateTime).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tokyo',
    });
  } else {
    return updateTime.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tokyo',
    });
  }
};

export const calcUserTotalTime = (users: User[]): number => {
  const totalTimeSec = users.reduce((total, user) => total + user.timeSec, 0);
  return totalTimeSec;
};
  const totalTimeSec = users.reduce((total, user) => total + user.timeSec, 0);
  return totalTimeSec;
};
