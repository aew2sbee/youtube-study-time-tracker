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
  const [user, setUser] = useState<User[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [liveChatMessage, setLiveChatMessage] = useState<YouTubeLiveChatMessage[]>([]);

  const { data, error, isLoading } = useSWR<LiveChatResponse>(YOUTUBE_API_URL, fetcher, {
    refreshInterval: (data) => Math.max(data?.pollingIntervalMillis ?? 0, parameter.API_POLLING_INTERVAL),
  });

  // データの処理
  useEffect(() => {
    setCurrentTime(new Date());
  }, []); // liveChatMessageを依存配列から外す

  useEffect(() => {
    if (!data) return;

    if (data.messages.length === 0) {
      console.debug(`data.messages.length: ${data.messages.length}`);
      return;
    }

    // 新しいメッセージのみを処理
    const newMessages = data.messages.filter(
      (message) =>
        !liveChatMessage.some(
          (existing) => existing.publishedAt === message.publishedAt && existing.channelId === message.channelId,
        ),
    );

    if (newMessages.length > 0) {
      setLiveChatMessage((prev) => [...prev, ...newMessages]);
      console.debug(`add ${newMessages.length} new messages`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, data]); // liveChatMessageを依存配列から外す

  // メッセージ処理
  useEffect(() => {
    if (liveChatMessage.length === 0) return;

    setUser((prevUsers) => {
      let updatedUsers = [...prevUsers];

      liveChatMessage.forEach((message) => {
        const messageText = message.displayMessage.toLowerCase().trim();
        const publishedAt = new Date(message.publishedAt);
        const existingUser = updatedUsers.find((user) => user.channelId === message.channelId);

        // 既存ユーザー
        if (existingUser) {
          // 時間の再開
          if (isStartMessage(messageText) && !existingUser.isStudying) {
            const restartUser = restartTime(existingUser, publishedAt);
            updatedUsers = updatedUsers.filter((u) => u.channelId !== existingUser.channelId).concat(restartUser);
            // 時間の停止
          } else if (isEndMessage(messageText) && existingUser.isStudying) {
            const stopUser = stopTime(existingUser, publishedAt);
            updatedUsers = updatedUsers.filter((u) => u.channelId !== existingUser.channelId).concat(stopUser);
            // 時間の更新
          } else if (existingUser.isStudying) {
            const updatedUser = updateTime(existingUser, currentTime);
            updatedUsers = updatedUsers.filter((u) => u.channelId !== existingUser.channelId).concat(updatedUser);
          }
          // 新規ユーザー
        } else {
          if (isStartMessage(messageText)) {
            const startUser = startTime(message);
            updatedUsers.push(startUser);
          }
        }
      });

      return updatedUsers;
    });
  }, [currentTime, liveChatMessage]); // userを依存配列から外す

  return {
    currentTime: currentTime,
    users: user,
    totalStudyTime: calcTotalTime(user),
    isLoading,
    isError: error,
  };
};
