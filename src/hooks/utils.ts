import { StudyTimeUser, YouTubeLiveChatMessage } from "@/types/youtube";
import { parameter } from '@/config/system';
import { calcStudyDuration } from "@/utils/calc";




export const createNewUser = (message: YouTubeLiveChatMessage, messageText: string): StudyTimeUser => {
  const isStarting = isStartStudyMessage(messageText);
  const messageTime = new Date(message.publishedAt);

  return {
    channelId: message.channelId,
    name: message.authorDisplayName,
    studyTime: 0,
    profileImageUrl: message.profileImageUrl,
    startTime: isStarting ? messageTime : undefined,
    isStudying: isStarting,
  };
};

export const handleStudyStart = (user: StudyTimeUser, messageTime: Date): StudyTimeUser => {
  if (!user.isStudying) {
    return {
      ...user,
      startTime: messageTime,
      isStudying: true,
    };
  }
  return user;
};

export const handleStudyEnd = (user: StudyTimeUser, messageTime: Date): StudyTimeUser => {
  if (user.isStudying && user.startTime) {
    const studyDuration = calcStudyDuration(user.startTime, messageTime);
    const additionalTime = Math.max(studyDuration, 0);
    return {
      ...user,
      studyTime: user.studyTime + additionalTime,
      isStudying: false,
      startTime: undefined,
    };
  }
  return user;
};

export const createMessageId = (message: YouTubeLiveChatMessage, messageText: string): string => {
  return `${message.authorDisplayName}-${message.publishedAt}-${messageText}`;
};

export const handleExistingUser = (
  user: StudyTimeUser,
  message: YouTubeLiveChatMessage,
  messageText: string,
): StudyTimeUser => {
  const messageTime = new Date(message.publishedAt);

  if (isStartStudyMessage(messageText)) {
    return handleStudyStart(user, messageTime);
  }

  if (isEndStudyMessage(messageText)) {
    return handleStudyEnd(user, messageTime);
  }

  return user;
};
