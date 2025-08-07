import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { useState } from 'react';
import { LiveChatResponse, YouTubeLiveChatMessage } from '@/types/youtube';
import { isEndMessage, isStartMessage } from '@/utils/liveChatMessage';
import { User } from '@/types/users';
import { calcStudyTime } from '@/utils/time';
import { parameter } from '@/config/system';

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
    const messageText = message.displayMessage.toLowerCase().trim();
    const publishedAt = new Date(message.publishedAt);
    const existingUser = user.find((user) => user.channelId === message.channelId);
    console.debug(`${message.authorDisplayName} ${messageText}`);
    console.debug(`existingUser: ${existingUser}`);

    // 既存ユーザー
    if (existingUser) {
      // 時間の再開
      if (isStartMessage(messageText) && !existingUser.isStudying) {
        const restartUser = restartTime(existingUser, publishedAt);
        setUser((prev) => [...prev, restartUser]);
        // 時間の停止
      } else if (isEndMessage(messageText) && existingUser.isStudying) {
        const stopUser = stopTime(existingUser, publishedAt);
        setUser((prev) => [...prev, stopUser]);
        // 時間の更新
      } else {
        const updatedUser = updateTime(existingUser, currentTime);
        setUser((prev) => [...prev, updatedUser]);
      }
      // 新規ユーザー
    } else {
      if (isStartMessage(messageText)) {
        const startUser = startTime(message);
        setUser((prev) => [...prev, startUser]);
      }
    }
  });

  return {
    currentTime: currentTime,
    users: user,
    pollingIntervalMillis: data?.pollingIntervalMillis || parameter.API_POLLING_INTERVAL,
    isLoading,
    isError: error,
  };
};

const startTime = (message: YouTubeLiveChatMessage): User => {
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

const restartTime = (user: User, startTime: Date): User => {
  const restartUser = {
    ...user,
    isStudying: true,
    startTime: startTime,
  };
  console.debug(`restartUser: ${restartUser.name}`);
  return restartUser;
};

const stopTime = (user: User, endTime: Date): User => {
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

const updateTime = (user: User, currentTime: Date): User => {
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
