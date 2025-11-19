'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { motion, AnimatePresence } from 'framer-motion';
import { youtube_v3 } from 'googleapis';
import { User } from '@/types/users';
import { parameter } from '@/config/system';
import { fetcher, postYoutubeComment } from '@/utils/useSWR';
import { isCategoryMessage, isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { resetRefresh, updateCategory, updateTime } from '@/lib/user';
import { startStudyAction, restartStudyAction, endStudyAction } from '@/server/actions/studyAction';
import FocusTimeTracker from '@/client/components/FocusTimeTracker';
import LoadingSpinner from '@/client/components/LoadingSpinner';
import ErrorMessage from '@/client/components/ErrorMessage';
import HowToJoin from '@/client/components/HowToJoin';

const YOUTUBE_API_URL = '/api/youtube';

interface HomeClientProps {
  initialMessages?: youtube_v3.Schema$LiveChatMessage[];
}

export default function HomeClient({ initialMessages = [] }: HomeClientProps) {
  const [user, setUser] = useState<User[]>([]);
  const [liveChatMessage, setLiveChatMessage] = useState<youtube_v3.Schema$LiveChatMessage[]>(initialMessages);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const lastProcessedIndexRef = useRef(0);

  const { data, error, isLoading } = useSWR<{ messages: youtube_v3.Schema$LiveChatMessage[] }>(
    YOUTUBE_API_URL,
    fetcher,
    {
      refreshInterval: parameter.API_POLLING_INTERVAL,
    }
  );

  const { trigger: postComment } = useSWRMutation(YOUTUBE_API_URL, postYoutubeComment);

  // currentTimeを定期的に更新
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setUser((prev) =>
        prev.map((user) => {
          // リフレッシュ間隔を超えたユーザーは通知する
          if (user.isStudying && parameter.REFRESH_INTERVAL_TIME <= user.refreshInterval) {
            const updatedUser = updateTime(user, now);
            const refreshedUser = resetRefresh(updatedUser);
            (async () => {
              await postComment(
                { user: refreshedUser, flag: parameter.REFRESH_FLAG },
                { populateCache: false, revalidate: false, throwOnError: false }
              );
            })();
            return refreshedUser;
          } else if (user.isStudying) {
            return updateTime(user, now);
          } else {
            return user;
          }
        })
      );
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, parameter.API_POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [postComment]);

  // データの処理（新規メッセージの追加）
  useEffect(() => {
    if (!data || data.messages.length === 0) return;

    const newMessages = data.messages.filter(
      (message) =>
        !liveChatMessage.some(
          (existing) =>
            existing.snippet?.publishedAt === message.snippet?.publishedAt &&
            existing.authorDetails?.channelId === message.authorDetails?.channelId
        )
    );

    if (newMessages.length > 0) {
      setLiveChatMessage((prev) => [...prev, ...newMessages]);
    }
  }, [data, liveChatMessage]);

  // メッセージ処理
  useEffect(() => {
    if (liveChatMessage.length === 0) return;

    const startIndex = lastProcessedIndexRef.current;
    const messagesToProcess = liveChatMessage.slice(startIndex);
    if (messagesToProcess.length === 0) return;

    setUser((prevUsers) => {
      let newList = [...prevUsers];

      messagesToProcess.forEach((message) => {
        const messageText = (message.snippet?.displayMessage || '').toLowerCase().trim();
        const publishedAt = new Date(message.snippet?.publishedAt || '');
        const existingUser = newList.find((u) => u.channelId === message.authorDetails?.channelId);

        if (existingUser) {
          // 再開
          if (isStartMessage(messageText) && !existingUser.isStudying) {
            (async () => {
              const result = await restartStudyAction(existingUser, publishedAt);
              if (result.success) {
                setUser((prev) => {
                  const filtered = prev.filter((u) => u.channelId !== result.user.channelId);
                  return [...filtered, result.user];
                });
              } else {
                console.error('学習再開に失敗しました:', result.error);
              }
            })();
          } else if (isEndMessage(messageText) && existingUser.isStudying) {
            (async () => {
              const result = await endStudyAction(existingUser, publishedAt);
              if (result.success) {
                setUser((prev) => {
                  const filtered = prev.filter((u) => u.channelId !== result.user.channelId);
                  return [...filtered, result.user];
                });
              } else {
                console.error('学習終了に失敗しました:', result.error);
              }
            })();
          } else if (isCategoryMessage(messageText) && existingUser.isStudying) {
            const categoryUser = updateCategory(existingUser, messageText);
            newList = newList.filter((u) => u.channelId !== existingUser.channelId).concat(categoryUser);
          }
        } else {
          // 新規ユーザーの開始
          if (isStartMessage(messageText)) {
            (async () => {
              const result = await startStudyAction(message);
              if (result.success) {
                setUser((prev) => {
                  const filtered = prev.filter((u) => u.channelId !== result.user.channelId);
                  return [...filtered, result.user];
                });
              } else {
                console.error('学習開始に失敗しました:', result.error);
              }
            })();
          }
        }
      });

      return newList;
    });

    lastProcessedIndexRef.current = liveChatMessage.length;
  }, [liveChatMessage, postComment]);

  // 3人ずつでページ分割
  const totalUserPages = Math.ceil(user.length / parameter.USERS_PER_PAGE);

  const userPages = Array.from({ length: totalUserPages }, (_, pageIndex) => {
    const startIndex = pageIndex * parameter.USERS_PER_PAGE;
    const endIndex = startIndex + parameter.USERS_PER_PAGE;
    const pageUsers = user.slice(startIndex, endIndex);

    return {
      key: `users-${pageIndex}`,
      title: totalUserPages > 1 ? `時間計測 (${pageIndex + 1}/${totalUserPages})` : '時間計測',
      component: <FocusTimeTracker user={pageUsers} />,
    };
  });

  const pages = [{ key: 'How to join', title: '参加方法', component: <HowToJoin /> }, ...userPages];

  // 自動ページ切り替え
  useEffect(() => {
    if (pages.length > 0) {
      const interval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % pages.length);
      }, parameter.PAGE_DISPLAY_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [pages.length]);

  if (isLoading && user.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const currentPageData = pages[currentPage];

  return (
    <div className="fixed inset-0 w-[1920px] h-[1080px] overflow-hidden pointer-events-none from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute bottom-0 left-0 w-[640px] h-[1080px] p-4 pointer-events-auto">
        <div className="bg-neutral-900 backdrop-blur-md rounded-xl p-6 h-full border border-gray-900 shadow-2xl">
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-neutral-200">{currentPageData.title}</h1>
          </motion.div>

          {/* Page Content */}
          <div className="h-[calc(100%-80px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageData.key}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="h-full"
              >
                {currentPageData.component}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page Indicator */}
          <div className="absolute bottom-4 right-6 flex space-x-2">
            {pages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage ? 'bg-gray-200' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
