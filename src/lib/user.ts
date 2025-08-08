import { User } from '@/types/users';
import { YouTubeLiveChatMessage } from '@/types/youtube';
import { calcStudyTime, calcTime } from '@/lib/clacTime';

export const startTime = (message: YouTubeLiveChatMessage): User => {
  const startUser = {
    channelId: message.channelId,
    name: message.authorDisplayName,
    timeSec: 0,
    profileImageUrl: message.profileImageUrl,
    startTime: new Date(message.publishedAt),
    isStudying: true,
  };
  console.info(`startUser: ${startUser.name} ${startUser.timeSec}`);
  return startUser;
};

export const restartTime = (user: User, startTime: Date): User => {
  const restartUser = {
    ...user,
    isStudying: true,
    startTime: startTime,
  };
  console.info(`restartUser: ${restartUser.name} ${restartUser.timeSec}`);
  return restartUser;
};

export const stopTime = (user: User, endTime: Date): User => {
  if (user.startTime) {
    const stopUser = {
      ...user,
      timeSec: user.timeSec + calcStudyTime(user.startTime, endTime),
      isStudying: false,
      startTime: undefined,
    };
    console.info(`stopUser: ${stopUser.name} ${stopUser.timeSec}`);
    return stopUser;
  }
  console.info(`No stopUser: ${user.name}`);
  return user;
};

export const updateTime = (user: User, currentTime: Date): User => {
  if (user.startTime) {
    const updatedUser = {
      ...user,
      timeSec: calcStudyTime(user.startTime, currentTime),
    };
    console.info(`updatedUser: ${updatedUser.name} ${calcTime(updatedUser.timeSec)}`);
    return updatedUser;
  }
  console.info(`No updateUser: ${user.name}`);
  return user;
};
