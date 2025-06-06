import { StudyRecord, YouTubeChat } from '@/types/chat';

const START_MESSAGE = 'study start';
const END_MESSAGE = 'study end';

export const fillterChatMessages = (
  youTubeChat: YouTubeChat[]
): YouTubeChat[] => {
  const studyRecordList = youTubeChat.filter((msg) => {
    const lowerMessage = msg.displayMessage.toLowerCase();
    return (
      lowerMessage.includes(START_MESSAGE) || lowerMessage.includes(END_MESSAGE)
    );
  });
  return studyRecordList;
};

export const formatChatMessages = (youTubeChat: YouTubeChat[]): StudyRecord => {
  const userSessions: StudyRecord = {};

  youTubeChat.forEach((msg) => {
    const user = msg.displayName;
    const message = msg.displayMessage;

    if (message === START_MESSAGE || message === END_MESSAGE) {
      if (!userSessions[user]) {
        userSessions[user] = {
          start: null,
          end: null,
        };
      }

      if (message === START_MESSAGE) {
        userSessions[user].start = msg.publishedAt;
      } else if (message === END_MESSAGE) {
        userSessions[user].end = msg.publishedAt;
      }
    }
  });
  return userSessions;
};
