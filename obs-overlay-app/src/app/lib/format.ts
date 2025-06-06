import { StudyRecord, YouTubeChat } from '@/types/chat';

const START_MESSAGE = 'study start';
// const END_MESSAGE = 'study end';

export const fillterChatMessages = (
  youTubeChat: YouTubeChat[]
): YouTubeChat[] => {
  const uniqueMessages = new Map<string, YouTubeChat>();

  youTubeChat.forEach((msg) => {
    const lowerMessage = msg.displayMessage.toLowerCase();
    if (lowerMessage.includes(START_MESSAGE)) {
      // ユーザー名をキーとして後のデータで上書き
      uniqueMessages.set(msg.displayName, msg);
    }
  });

  return Array.from(uniqueMessages.values());
};

// export const formatChatMessages = (youTubeChat: YouTubeChat[]): StudyRecord => {
//   const userSessions: StudyRecord = {};

//   youTubeChat.forEach((msg) => {
//     const user = msg.displayName;
//     const message = msg.displayMessage;

//     if (message === START_MESSAGE || message === END_MESSAGE) {
//       if (!userSessions[user]) {
//         userSessions[user] = {
//           start: null,
//           end: null,
//         };
//       }

//       if (message === START_MESSAGE) {
//         userSessions[user].start = msg.publishedAt;
//       } else if (message === END_MESSAGE) {
//         userSessions[user].end = msg.publishedAt;
//       }
//     }
//   });
//   return userSessions;
// };
