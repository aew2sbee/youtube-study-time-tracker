import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher, postUser } from '@/utils/useSWR';
import { useState, useEffect, useRef } from 'react';
import { LiveChatResponse, YouTubeLiveChatMessage } from '@/types/youtube';
import { isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { User } from '@/types/users';
import { calcTotalTime } from '@/lib/calcTime';
import { parameter } from '@/config/system';
import { restartTime, startTime, stopTime, updateTime } from '@/lib/user';

const YOUTUBE_API_URL = '/api/youtube';
const SQLITE_API_URL = '/api/sqlite';

export const useUsers = () => {
  const [user, setUser] = useState<User[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [liveChatMessage, setLiveChatMessage] = useState<YouTubeLiveChatMessage[]>([]);
  const lastProcessedIndexRef = useRef(0); // 追加: 再処理防止用のインデックス

  const { data, error, isLoading } = useSWR<LiveChatResponse>(YOUTUBE_API_URL, fetcher, { refreshInterval: parameter.API_POLLING_INTERVAL });

  const { trigger: saveUser } = useSWRMutation(SQLITE_API_URL, postUser);
  const { trigger: postComment } = useSWRMutation(YOUTUBE_API_URL, postUser);

  // currentTimeを定期的に更新（dataに関係なく）
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setUser((prev) => prev.map((user) => (user.isStudying ? updateTime(user, now) : user)));
    };

    updateCurrentTime(); // 初回実行

    const interval = setInterval(updateCurrentTime, parameter.API_POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // データの処理（新規メッセージの追加）
  useEffect(() => {
    if (!data || data.messages.length === 0) return;

    const newMessages = data.messages.filter(
      (message) =>
        !liveChatMessage.some(
          (existing) => existing.publishedAt === message.publishedAt && existing.channelId === message.channelId,
        ),
    );

    if (newMessages.length > 0) {
      setLiveChatMessage((prev) => [...prev, ...newMessages]);
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
            const restartUser = restartTime(existingUser, publishedAt);
            newList = newList.filter((u) => u.channelId !== existingUser.channelId).concat(restartUser);
            // 停止
          } else if (isEndMessage(messageText) && existingUser.isStudying) {
            const stopUser = stopTime(existingUser, publishedAt);
            newList = newList.filter((u) => u.channelId !== existingUser.channelId).concat(stopUser);
            // useSWRMutation経由でデータ保存
            (async () => {
              //  - populateCache: このミューテーション結果をSWRキャッシュへ反映せず既存データを維持
              //  - revalidate: 成功後に追加の再フェッチを発行しない（ポーリングのみで同期）
              //  - throwOnError: エラーでも例外を投げず後続/他ユーザー処理を継続
              await saveUser(stopUser, { populateCache: false, revalidate: false, throwOnError: false });
              await postComment(stopUser, { populateCache: false, revalidate: false, throwOnError: false });
            })();
          }
        } else {
          // 新規ユーザーの開始
          if (isStartMessage(messageText)) {
            const startUser = startTime(message);
            newList.push(startUser);
          }
        }
      });

      return newList;
    });

    lastProcessedIndexRef.current = liveChatMessage.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveChatMessage]);

  return {
    currentTime: currentTime,
    users: user,
    totalStudyTime: calcTotalTime(user),
    isLoading,
    isError: error,
  };
};
