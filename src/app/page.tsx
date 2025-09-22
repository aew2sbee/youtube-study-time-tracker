'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parameter } from '@/config/system';
import FocusTimeTracker from '@/components/FocusTimeTracker';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useUsers } from '@/hooks/useUsers';
import HowToJoin from '@/components/HowToJoin';


export default function Home() {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { users, isLoading, isError } = useUsers();

  // 3人ずつでページ分割
  const totalUserPages = Math.ceil(users.length / parameter.USERS_PER_PAGE);

  const userPages = Array.from({ length: totalUserPages }, (_, pageIndex) => {
    const startIndex = pageIndex * parameter.USERS_PER_PAGE;
    const endIndex = startIndex + parameter.USERS_PER_PAGE;
    const pageUsers = users.slice(startIndex, endIndex);

    return {
      key: `users-${pageIndex}`,
      title: totalUserPages > 1 ? `時間計測 (${pageIndex + 1}/${totalUserPages})` : '時間計測',
      component: (
        <FocusTimeTracker
          user={pageUsers}
        />
      ),
    };
  });

  const pages = [
    { key: 'How to join', title: '参加方法', component: <HowToJoin /> },
    ...userPages,
  ];

  useEffect(() => {
    if (pages.length > 0) {
      const interval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % pages.length);
      }, parameter.PAGE_DISPLAY_INTERVAL); // 10秒間隔

      return () => clearInterval(interval);
    }
  }, [pages.length]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={isError} />;

  const currentPageData = pages[currentPage];

  return (
    <div className="fixed inset-0 w-[1920px] h-[1080px] overflow-hidden pointer-events-none bg-black">
      <div className="absolute bottom-0 left-0 w-[640px] h-[1080px] p-4 pointer-events-auto">
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 h-full border border-white/20 shadow-2xl">
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white">
              {currentPageData.title}
            </h1>
          </motion.div>

          {/* Page Content */}
          <div className="h-[calc(100%-80px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageData.key}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
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
                  index === currentPage
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}