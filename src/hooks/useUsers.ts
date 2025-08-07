import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { useState, useEffect } from 'react';
import { LiveChatResponse, YouTubeLiveChatMessage } from '@/types/youtube';
import { isEndMessage, isStartMessage } from '@/utils/liveChatMessage';
import { User } from '@/types/users';
import { calcTotalTime } from '@/utils/time';
import { parameter } from '@/config/system';
import { restartTime, startTime, stopTime, updateTime } from '@/lib/user';

const YOUTUBE_API_URL = '/api/youtube';

export const useUsers = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [liveChatMessage, setLiveChatMessage] = useState<YouTubeLiveChatMessage[]>([]);
  const [user, setUser] = useState<User[]>([]);

  const { data, error, isLoading } = useSWR<LiveChatResponse>(YOUTUBE_API_URL, fetcher, {
    refreshInterval: (data: LiveChatResponse | undefined) => data?.pollingIntervalMillis || parameter.API_POLLING_INTERVAL,
  });

  // 現在時刻を更新
  useEffect(() => {
    setCurrentTime(new Date());
  }, [data]);

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
    totalStudyTime: calcTotalTime(user),
    pollingIntervalMillis: data?.pollingIntervalMillis || parameter.API_POLLING_INTERVAL,
    isLoading,
    isError: error,
  };
};
