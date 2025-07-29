import { StudyTimeUser } from "./types/youtube";

const ADDITIONAL_STUDY_TIME = 262 * 60 * 60;

export const formatTime = (seconds: number): string => {
  if (seconds === 0) return '0h 0min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
};

export const formatUpdateTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

export const getTotalStudyTime = (): number => {
  const usersTotal = Array.from(users.values())
    .filter((user) => user.studyTime > 0 || user.isStudying)
    .reduce((total, user) => {
      let userTime = user.studyTime;
      // 現在勉強中の場合は経過時間も追加
      if (user.isStudying && user.startTime) {
        const currentTime = Math.floor(
          (new Date().getTime() - user.startTime.getTime()) / 1000
        );
        userTime += currentTime;
      }
      return total + userTime;
    }, 0);

  // 追加の勉強時間を合算
  return usersTotal + ADDITIONAL_STUDY_TIME;
};

export const getSortedUsers = (users): StudyTimeUser[] => {
  const now = new Date();
  return Array.from(users.values())
    .filter((user) => user.studyTime > 0 || user.isStudying)
    .map((user) => {
      // リアルタイム計算: 勉強中の場合は現在時刻までの時間を追加
      if (user.isStudying && user.startTime) {
        const currentStudyTime = Math.floor(
          (now.getTime() - user.startTime.getTime()) / 1000
        );
        return {
          ...user,
          studyTime: user.studyTime + currentStudyTime,
        };
      }
      return user;
    });
};
