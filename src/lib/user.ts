import { User } from '@/types/users';
import { YouTubeLiveChatMessage } from '@/types/youtube';
import { calcStudyTime, calcTime } from '@/lib/clacTime';

export const startTime = (message: YouTubeLiveChatMessage): User => {
  const startUser = {
    channelId: message.channelId,
    name: message.authorDisplayName,
    timeSec: 0,
    profileImageUrl: message.profileImageUrl,
    updateTime: new Date(message.publishedAt),
    isStudying: true,
  };
  console.info(`startUser: ${startUser.name} ${calcTime(startUser.timeSec)}`);
  return startUser;
};

export const restartTime = (user: User, startTime: Date): User => {
  const restartUser = {
    ...user,
    isStudying: true,
    updateTime: startTime,
  };
  console.info(`restartUser: ${restartUser.name} ${calcTime(user.timeSec)} => ${calcTime(restartUser.timeSec)}`);
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
    console.info(`stopUser: ${stopUser.name} ${calcTime(user.timeSec)} => ${calcTime(stopUser.timeSec)}`);
    return stopUser;
  }
  console.info(`No stopUser: ${user.name}`);
  return user;
};

export const updateTime = (user: User, currentTime: Date): User => {
  if (user.updateTime) {
    const updatedUser = {
      ...user,
      timeSec: user.timeSec + calcStudyTime(user.updateTime, currentTime),
      updateTime: currentTime,
    };
    console.info(`updatedUser: ${updatedUser.name} ${calcTime(user.timeSec)} => ${calcTime(updatedUser.timeSec)}`);
    return updatedUser;
  }
  console.info(`No updateUser: ${user.name}`);
  return user;
};
