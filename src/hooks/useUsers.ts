import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { useState, useEffect, useRef } from 'react';
import { LiveChatResponse, YouTubeLiveChatMessage } from '@/types/youtube';
import { isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { User } from '@/types/users';
import { calcTime, calcTotalTime, convertHHMM2 } from '@/lib/clacTime';
import { parameter } from '@/config/system';
import { restartTime, startTime, stopTime, updateTime } from '@/lib/user';

const YOUTUBE_API_URL = '/api/youtube';

export const useUsers = () => {
  const [user, setUser] = useState<User[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [liveChatMessage, setLiveChatMessage] = useState<YouTubeLiveChatMessage[]>([]);
  const lastProcessedIndexRef = useRef(0); // 追加: 再処理防止用のインデックス

  const { data, error, isLoading } = useSWR<LiveChatResponse>(YOUTUBE_API_URL, fetcher, {
    refreshInterval: (data) => {
      const interval = data?.pollingIntervalMillis ?? parameter.API_POLLING_INTERVAL;
      console.info(`SWR polling interval: ${interval}ms, pollingIntervalMillis: ${data?.pollingIntervalMillis}`);
      return interval;
    },
    onError: (error) => {
      console.error('SWR fetch error:', error);
    },
    onSuccess: (data) => {
      console.info('SWR fetch success - received data', data);
    },
  });


  // データの処理（新規メッセージの追加）
  useEffect(() => {
    setCurrentTime(new Date());
    console.info(`SWR status - isLoading: ${isLoading}, error: ${!!error}, data: ${!!data}`);

    if (!data || data.messages.length === 0) return;

    const newMessages = data.messages.filter(
      (message) =>
        !liveChatMessage.some(
          (existing) => existing.publishedAt === message.publishedAt && existing.channelId === message.channelId,
        ),
    );

    if (newMessages.length > 0) {
      setLiveChatMessage((prev) => [...prev, ...newMessages]);
      console.info(`add ${newMessages.length} new messages`);
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
      let newList = [...prevUsers];

      messagesToProcess.forEach((message) => {
        const messageText = message.displayMessage.toLowerCase().trim();
        const publishedAt = new Date(message.publishedAt);
        const existingUser = newList.find((u) => u.channelId === message.channelId);

        if (existingUser) {
          // 再開
          if (isStartMessage(messageText) && !existingUser.isStudying) {
            console.info(
              `restartUser1 ${existingUser?.name} ${calcTime(existingUser?.timeSec)} ${existingUser?.updateTime}`,
            );
            const restartUser = restartTime(existingUser, publishedAt);
            console.info(
              `restartUser2 ${restartUser?.name} ${calcTime(restartUser?.timeSec)} ${convertHHMM2(
                restartUser?.updateTime,
              )}`,
            );
            newList = newList.filter((u) => u.channelId !== existingUser.channelId).concat(restartUser);
            // 停止
          } else if (isEndMessage(messageText) && existingUser.isStudying) {
            console.info(
              `stopUser1 ${existingUser?.name} ${calcTime(existingUser?.timeSec)} ${convertHHMM2(
                existingUser?.updateTime,
              )}`,
            );
            const stopUser = stopTime(existingUser, publishedAt);
            console.info(`stopUser2 ${stopUser?.name} ${calcTime(stopUser?.timeSec)} ${stopUser?.updateTime}`);
            newList = newList.filter((u) => u.channelId !== existingUser.channelId).concat(stopUser);
          }
        } else {
          // 新規ユーザーの開始
          if (isStartMessage(messageText)) {
            const startUser = startTime(message);
            console.info(
              `startUser2 ${startUser?.name} ${calcTime(startUser?.timeSec)} ${convertHHMM2(startUser?.updateTime)}`,
            );
            newList.push(startUser);
          }
        }
      });

      return newList;
    });

    lastProcessedIndexRef.current = liveChatMessage.length;
  }, [liveChatMessage]);

  useEffect(() => {
    console.info(`SWR`);
    setUser((prev) => prev.map((user) => (user.isStudying ? updateTime(user, currentTime) : user)));
  }, [currentTime]);

  return {
    currentTime: currentTime,
    users: user,
    totalStudyTime: calcTotalTime(user),
    isLoading,
    isError: error,
  };
};