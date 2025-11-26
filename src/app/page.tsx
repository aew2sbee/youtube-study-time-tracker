'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parameter } from '@/config/system';
import { usePolling } from '@/client/lib/usePolling';
import { usePagination } from '@/client/lib/usePagination';
import LoadingSpinner from '@/client/components/LoadingSpinner';
import ErrorMessage from '@/client/components/ErrorMessage';
import Experience from '@/client/components/GameMode';
import FocusTimeTracker from '@/client/components/FocusTimeTracker';
import { User } from '@/types/users';

/**
 * ホーム画面のクライアントコンポーネント
 * - クライアント駆動でサーバーポーリング処理を実行
 * - SWRで1分間隔でポーリング
 */
export default function Home() {
  // SWRでポーリング処理を実行（1分間隔）
  const { users, isLoading, isError, error } = usePolling();

  // ゲームモードのユーザーをフィルタリング
  const gameModeUsers = useMemo(() => users.filter((user) => user.isGameMode), [users]);

  // 表示するコンポーネントを条件付きで構築（ユーザーが0人のコンポーネントは除外）
  const renderComponents = useMemo(() => {
    const components: { title: string; renderComponent: (users: User[]) => React.ReactNode }[] = [];

    if (users.length > 0) {
      components.push({
        title: 'みんなで"時間計測"',
        renderComponent: (users: User[]) => <FocusTimeTracker user={users} />,
      });
    }

    if (gameModeUsers.length > 0) {
      components.push({
        title: 'みんなで"レベル上げ"',
        renderComponent: (users: User[]) => <Experience user={users.filter((user) => user.isGameMode)} />,
      });
    }

    return components;
  }, [users, gameModeUsers]);

  // ページネーション
  const { currentPage, pages } = usePagination({
    users,
    itemsPerPage: parameter.USERS_PER_PAGE,
    autoSwitchInterval: parameter.PAGE_DISPLAY_INTERVAL,
    renderComponents,
  });

  // ローディング・エラー処理
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;

  const currentPageData = pages[currentPage];

  return (
    <>
      {/* Header */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold text-black">{currentPageData.title}</h1>
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
    </>
  );
}
