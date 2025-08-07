import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { useState } from 'react';
import { LiveChatResponse, YouTubeLiveChatMessage } from '@/types/youtube';
import { isStartStudyMessage } from './utils';
import { isEndMessage, isStartMessage } from '@/utils/liveChatMessage';
import { User } from '@/types/users';

const YOUTUBE_API_URL = '/api/youtube';

export const useUsers = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [liveChatMessage, setLiveChatMessage] = useState<YouTubeLiveChatMessage[]>([]);
  const [user, setUser] = useState<User[]>([]);

  const { data, error, isLoading } = useSWR<LiveChatResponse>(YOUTUBE_API_URL, fetcher);

  // 現在時刻を更新
  setCurrentTime(new Date());

  if (data?.messages.length === 0) {
    console.debug(`data.messages.length: ${data.messages.length}`);
  }

  data?.messages.forEach((message) => {
    // 既に同じメッセージが存在する場合はスキップ
    if (liveChatMessage.includes(message)) return;

    // 新しいメッセージを追加
    setLiveChatMessage((prev) => [...prev, message]);
    console.debug(`add messages: ${message.publishedAt} ${message.authorDisplayName} ${message.displayMessage}`);
  });

  liveChatMessage.forEach((message) => {
    // 学習開始メッセージか学習終了メッセージの場合、ユーザーの状態を更新
    const messageText = message.displayMessage.toLowerCase().trim();
    const existingUser:User = studyTimeUser.find(user => user.name === message.authorDisplayName) ?? {};

    // 既存ユーザー
    if (existingUser) {
      // 時間の更新
      const updatedUser = updateStartTime(existingUser, currentTime);
      setUser((prev) => [...prev, updatedUser]);
      // 時間の停止
      const stopUser = stopStartTime(existingUser, currentTime);
      setUser((prev) => [...prev, stopUser]);
    }
    // 新規ユーザー





    // 計測開始
    if (isStartMessage(messageText)) {
      if (!existingUser) {
        const newUser = createNewUser(message);
        setStudyTimeUser((prev) => [...prev, newUser]);

      } else {
        const updatedUser = updateStartTime(existingUser, new Date(message.publishedAt));
        setStudyTimeUser((prev) => prev.map(user => user.name === updatedUser.name ? updatedUser : user));
      }
    }

    // 計測終了
    if (isEndMessage(messageText)) {
      // 新規ユーザー
      if (!existingUser) {
        const newUser = createNewUser(message);
        setStudyTimeUser((prev) => [...prev, newUser]);
      // 時間の更新
      } else {
        const updatedUser = updateStartTime(existingUser, new Date(message.publishedAt));
        setStudyTimeUser((prev) => prev.map(user => user.name === updatedUser.name ? updatedUser : user));
      }
    }
  });

  //   if (isStartStudyMessage(message.displayMessage)) {
  //   const messageTime = new Date(message.publishedAt);


  //   const messageText = message.displayMessage.toLowerCase().trim();
  //   const userName = message.authorDisplayName;

  //   if (messageText.includes('start study')) {
  //     const newUser: StudyTimeUser = {
  //       channelId: message.channelId,
  //       name: userName,
  //       studyTime: 0,
  //       profileImageUrl: message.profileImageUrl,
  //       startTime: new Date(message.publishedAt),
  //       isStudying: true,
  //     };
  //     setUsers((prev) => [...prev, newUser]);
  //   } else if (messageText.includes('end study')) {
  //     setUsers((prev) =>
  //       prev.map((user) =>
  //         user.name === userName && user.isStudying
  //           ? { ...user, isStudying: false, studyTime: user.studyTime + (now.getTime() - (user.startTime?.getTime() || now.getTime())) / 1000 }
  //           : user
  //       )
  //     );
  //   }
  // });



  // if (!data || data.length === 0)
  //   return {
  //     now: now,
  //     users: [],
  //     pollingIntervalMillis: 5000,
  //     isLoading,
  //     isError: error,
  //   };

  return {
    currentTime: currentTime,
    users: data,
    pollingIntervalMillis: 5000,
    isLoading,
    isError: error,
  };
}



const createNewUser = (message: YouTubeLiveChatMessage): User => {
  return {
    channelId: message.channelId,
    name: message.authorDisplayName,
    studyTime: 0,
    profileImageUrl: message.profileImageUrl,
    startTime: new Date(message.publishedAt),
    isStudying: true,
  };
};

const updateStartTime = (user: User, currentTime: Date): User => {
  if (user.isStudying && user.startTime) {
    console.debug(`Updating study time for user: ${user.name}`);
    return {
      ...user,
      studyTime: calcStudyTime(user.startTime, currentTime),
    };
  }
  console.debug(`No update needed for user: ${user.name}`);
  return user;
};

const stopStartTime = (user: User, currentTime: Date): User => {
  if (user.isStudying && user.startTime) {
    console.debug(`Updating study time for user: ${user.name}`);
    return {
      ...user,
      studyTime: calcStudyTime(user.startTime, currentTime),
    };
  }
  console.debug(`No update needed for user: ${user.name}`);
  return user;
};

const calcStudyTime = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const safeDiffMs = Math.max(diffMs, 0); // マイナスにならないように
  return Math.floor(safeDiffMs / 1000);
}