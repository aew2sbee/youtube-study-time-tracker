import { useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/users';
import HowToJoin from '@/client/components/HowToJoin';

interface PageData {
  key: string;
  title: string;
  component: ReactNode;
}

interface ComponentConfig {
  renderComponent: (users: User[]) => ReactNode;
  title: string;
}

interface UsePaginationProps {
  users: User[];
  itemsPerPage: number;
  autoSwitchInterval: number;
  renderComponents: ComponentConfig[];
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
 * - 複数のコンポーネントタイプを表示可能
 *
 * @param users - ユーザーリスト
 * @param itemsPerPage - 1ページあたりのアイテム数
 * @param autoSwitchInterval - 自動切り替え間隔（ミリ秒）
 * @param renderComponents - コンポーネント設定の配列
 */
export const usePagination = ({
  users,
  itemsPerPage,
  autoSwitchInterval,
  renderComponents,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // 各コンポーネントタイプごとにページを生成
  const allUserPages: PageData[] = renderComponents.flatMap((config) => {
    const totalUserPages = Math.ceil(users.length / itemsPerPage);

    return Array.from({ length: totalUserPages }, (_, pageIndex) => {
      const startIndex = pageIndex * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageUsers = users.slice(startIndex, endIndex);

      return {
        key: `${config.title}-${pageIndex}`,
        title: totalUserPages > 1 ? `${config.title} (${pageIndex + 1}/${totalUserPages})` : config.title,
        component: config.renderComponent(pageUsers),
      };
    });
  });

  const pages: PageData[] = [
    { key: 'How to join', title: '機能一覧', component: <HowToJoin /> },
    ...allUserPages,
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
