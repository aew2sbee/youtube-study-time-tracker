import { User } from '@/types/users';
import { calcStudyTime, calcTime } from '@/lib/calcTime';
import { logger } from '@/server/lib/logger';

export const updateTime = (user: User, currentTime: Date): User => {
  const updatedUser = {
    ...user,
    timeSec: user.timeSec + calcStudyTime(user.updateTime, currentTime),
    updateTime: currentTime,
    refreshInterval: user.refreshInterval + calcStudyTime(user.updateTime, currentTime),
  };
  logger.info(`updateTime - ${updatedUser.displayName} ${calcTime(user.timeSec)} => ${calcTime(updatedUser.timeSec)}`);
  return updatedUser;
};

export const resetRefresh = (user: User): User => {
  const refreshUser = {
    ...user,
    refreshInterval: 0,
  };
  logger.info(`resetRefresh - ${refreshUser.displayName} ${calcTime(user.refreshInterval)} => ${calcTime(refreshUser.refreshInterval)}`);
  return refreshUser;
};
