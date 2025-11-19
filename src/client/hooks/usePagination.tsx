import { useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/users';
import FocusTimeTracker from '@/client/components/FocusTimeTracker';
import HowToJoin from '@/client/components/HowToJoin';

interface PageData {
  key: string;
  title: string;
  component: ReactNode;
}

interface UsePaginationProps {
  users: User[];
  itemsPerPage: number;
  autoSwitchInterval: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pages: PageData[];
}

/**
 * ページ分割と自動ページ切り替えを管理するカスタムフック
 * - ユーザーリストをページ分割
 * - 自動的にページを切り替え
 * - 「参加方法」ページを先頭に追加
 */
export const usePagination = ({
  users,
  itemsPerPage,
  autoSwitchInterval,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // ユーザーをページ分割
  const totalUserPages = Math.ceil(users.length / itemsPerPage);

  const userPages: PageData[] = Array.from({ length: totalUserPages }, (_, pageIndex) => {
    const startIndex = pageIndex * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageUsers = users.slice(startIndex, endIndex);

    return {
      key: `users-${pageIndex}`,
      title: totalUserPages > 1 ? `時間計測 (${pageIndex + 1}/${totalUserPages})` : '時間計測',
      component: <FocusTimeTracker user={pageUsers} />,
    };
  });

  // 「参加方法」ページを先頭に追加
  const pages: PageData[] = [
    { key: 'How to join', title: '参加方法', component: <HowToJoin /> },
    ...userPages,
  ];

  // 自動ページ切り替え
  useEffect(() => {
    if (pages.length > 0) {
      const interval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % pages.length);
      }, autoSwitchInterval);

      return () => clearInterval(interval);
    }
  }, [pages.length, autoSwitchInterval]);

  return { currentPage, pages };
};
