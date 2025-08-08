import { User } from '@/types/users';
import { YouTubeLiveChatMessage } from '@/types/youtube';
import { calcStudyTime } from '@/lib/clacTime';

export const startTime = (message: YouTubeLiveChatMessage): User => {
  const startUser = {
    channelId: message.channelId,
    name: message.authorDisplayName,
    studyTime: 0,
    profileImageUrl: message.profileImageUrl,
    startTime: new Date(message.publishedAt),
    isStudying: true,
  };
  console.debug(`startUser: ${startUser.name}`);
  return startUser;
};

export const restartTime = (user: User, startTime: Date): User => {
  const restartUser = {
    ...user,
    isStudying: true,
    startTime: startTime,
  };
  console.debug(`restartUser: ${restartUser.name}`);
  return restartUser;
};

export const stopTime = (user: User, endTime: Date): User => {
  if (user.startTime) {
    const stopUser = {
      ...user,
      studyTime: calcStudyTime(user.startTime, endTime),
      isStudying: false,
      startTime: undefined,
    };
    console.debug(`stopUser: ${stopUser.name}`);
    return stopUser;
  }
  console.warn(`No stopUser: ${user.name}`);
  return user;
};

export const updateTime = (user: User, currentTime: Date): User => {
  if (user.startTime) {
    const updatedUser = {
      ...user,
      studyTime: calcStudyTime(user.startTime, currentTime),
    };
    console.debug(`updatedUser: ${updatedUser.name}`);
    return updatedUser;
  }
  console.warn(`No updateUser: ${user.name}`);
  return user;
};
