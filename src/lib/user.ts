import { User } from '@/types/users';
import { YouTubeLiveChatMessage } from '@/types/youtube';
import { calcStudyTime, calcTime } from '@/lib/calcTime';
import { logger } from '@/utils/logger';

export const startTime = (message: YouTubeLiveChatMessage): User => {
  const startUser = {
    channelId: message.channelId,
    name: message.authorDisplayName,
    timeSec: 0,
    profileImageUrl: message.profileImageUrl,
    updateTime: new Date(message.publishedAt),
    isStudying: true,
  };
  logger.info(`startTime - ${startUser.name} ${calcTime(startUser.timeSec)}`);
  return startUser;
};

export const restartTime = (user: User, startTime: Date): User => {
  const restartUser = {
    ...user,
    isStudying: true,
    updateTime: startTime,
  };
  logger.info(`restartTime - ${restartUser.name} ${calcTime(user.timeSec)} => ${calcTime(restartUser.timeSec)}`);
  return restartUser;
};

export const stopTime = (user: User, endTime: Date): User => {
  if (user.updateTime) {
    const stopUser = {
      ...user,
      timeSec: user.timeSec + calcStudyTime(user.updateTime, endTime),
      isStudying: false,
      updateTime: endTime,
    };
    logger.info(`stopTime - ${stopUser.name} ${calcTime(user.timeSec)} => ${calcTime(stopUser.timeSec)}`);
    return stopUser;
  }
  logger.warn(`No stopTime - ${user.name}`);
  return user;
};

export const updateTime = (user: User, currentTime: Date): User => {
  if (user.updateTime) {
    const updatedUser = {
      ...user,
      timeSec: user.timeSec + calcStudyTime(user.updateTime, currentTime),
      updateTime: currentTime,
    };
    logger.info(`updateTime - ${updatedUser.name} ${calcTime(user.timeSec)} => ${calcTime(updatedUser.timeSec)}`);
    return updatedUser;
  }
  logger.warn(`No updateTime: ${user.name}`);
  return user;
};
