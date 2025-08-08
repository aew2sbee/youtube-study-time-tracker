import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { useState, useEffect, useRef } from 'react';
import { LiveChatResponse, YouTubeLiveChatMessage } from '@/types/youtube';
import { isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { User } from '@/types/users';
import { calcTotalTime } from '@/lib/clacTime';
import { parameter } from '@/config/system';
import { restartTime, startTime, stopTime, updateTime } from '@/lib/user';

const YOUTUBE_API_URL = '/api/youtube';

export const useUsers = () => {
  const [user, setUser] = useState<User[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [liveChatMessage, setLiveChatMessage] = useState<YouTubeLiveChatMessage[]>([]);
  const lastProcessedIndexRef = useRef(0); // 追加: 再処理防止用のインデックス

  const { data, error, isLoading } = useSWR<LiveChatResponse>(YOUTUBE_API_URL, fetcher, {
    refreshInterval: (data) => Math.max(data?.pollingIntervalMillis ?? 0, parameter.API_POLLING_INTERVAL),
  });

  // データの処理（currentTime更新＋新規メッセージの追加）
  useEffect(() => {
    if (!data) return;

    console.debug(`useUsers: data: ${JSON.stringify(data)}`);
    setCurrentTime(new Date());

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
  }, [data]);

  // メッセージ処理（新規分のみ、開始/終了の状態遷移のみ反映）
  useEffect(() => {
    if (liveChatMessage.length === 0) return;

    const startIndex = lastProcessedIndexRef.current;
    const messagesToProcess = liveChatMessage.slice(startIndex);
    if (messagesToProcess.length === 0) return;

    setUser((prevUsers) => {
      let updatedUsers = [...prevUsers];

      messagesToProcess.forEach((message) => {
        const messageText = message.displayMessage.toLowerCase().trim();
        const publishedAt = new Date(message.publishedAt);
        const existingUser = updatedUsers.find((u) => u.channelId === message.channelId);

        if (existingUser) {
          // 再開
          if (isStartMessage(messageText) && !existingUser.isStudying) {
            const restartUser = restartTime(existingUser, publishedAt);
            updatedUsers = updatedUsers.filter((u) => u.channelId !== existingUser.channelId).concat(restartUser);
            // 停止
          } else if (isEndMessage(messageText) && existingUser.isStudying) {
            const stopUser = stopTime(existingUser, publishedAt);
            updatedUsers = updatedUsers.filter((u) => u.channelId !== existingUser.channelId).concat(stopUser);
          }
          // 学習時間の更新はここでは行わない（currentTime変更時に一括で行う）
        } else {
          // 新規ユーザーの開始
          if (isStartMessage(messageText)) {
            const startUser = startTime(message);
            updatedUsers.push(startUser);
          }
        }
      });

      return updatedUsers;
    });

    lastProcessedIndexRef.current = liveChatMessage.length;
  }, [liveChatMessage]);

  // currentTimeが変わるたびに、学習中ユーザーのstudyTimeを一括更新
  useEffect(() => {
    setUser((prev) => prev.map((u) => (u.isStudying ? updateTime(u, currentTime) : u)));
  }, [currentTime]);

  return {
    currentTime: currentTime,
    users: user,
    totalStudyTime: calcTotalTime(user),
    isLoading,
    isError: error,
  };
};
