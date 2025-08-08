import { parameter } from "@/config/system";
import { User } from "@/types/users";

export const calcStudyTime = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const safeDiffMs = Math.max(diffMs, 0); // マイナスにならないように
  return Math.floor(safeDiffMs / 1000);
}
export const calcTotalTime = (users: User[]): number => {
  const total = users.reduce((total, u) => total + u.timeSec, parameter.ADDITIONAL_STUDY_TIME)
  console.debug(`total: ${total}`);
  return total;
}

export const calcTime = (seconds: number): string => {
  if (seconds === 0) return '0h 0min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
};

export const calculateTargetValues = (totalTime: number) => {
  const targetPercentage = Math.floor((totalTime / parameter.TARGET_STUDY_TIME) * 100);
  const targetFlowerLevel = Math.min(Math.floor(targetPercentage / 10), 10);
  return { targetPercentage, targetFlowerLevel };
};

export const convertHHMM = (publishedAt:string) => new Date(publishedAt).toLocaleTimeString('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Tokyo',
});