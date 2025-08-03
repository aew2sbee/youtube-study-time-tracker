'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parameter } from '@/config/system';
import HowToUse from '@/components/HowToUse';
import FocusTimeTracker from '@/components/FocusTimeTracker';
import { useStudyTime } from '@/hooks/useStudyTime';
import MyStudyProgress from '@/components/MyStudyProgress';
import MonthlyChallenge from '@/components/MonthlyChallenge';


export default function Home() {
  const { currentTime, displayedUsers, totalStudyTime } = useStudyTime();

  const [currentPage, setCurrentPage] = useState<number>(0);

  // 3人ずつでページ分割
  const userArray = Array.from(displayedUsers.values());
  const totalUserPages = Math.ceil(userArray.length / parameter.USERS_PER_PAGE);

  const userPages = Array.from({ length: totalUserPages }, (_, pageIndex) => {
    const startIndex = pageIndex * parameter.USERS_PER_PAGE;
    const endIndex = startIndex + parameter.USERS_PER_PAGE;
    const pageUsers = userArray.slice(startIndex, endIndex);

    return {
      key: `users-${pageIndex}`,
      title: totalUserPages > 1 ? `Focus Tracker (${pageIndex + 1}/${totalUserPages})` : 'Focus Tracker',
      component: (
        <FocusTimeTracker
          displayedUsers={pageUsers}
        />
      ),
    };
  });

  const pages = [
    { key: 'How to use', title: 'How to use', component: <HowToUse /> },
    ...userPages,
    { key: 'Monthly Challenge', title: 'Monthly Challenge', component: <MonthlyChallenge now={currentTime} totalStudyTime={totalStudyTime} /> },
    { key: 'My study progress', title: 'My Study Progress', component: <MyStudyProgress /> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, parameter.PAGE_DISPLAY_INTERVAL); // 10秒間隔

    return () => clearInterval(interval);
  }, [pages.length]);

  const currentPageData = pages[currentPage];

  return (
    <div className="fixed inset-0 w-[1920px] h-[1080px] overflow-hidden pointer-events-none from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute bottom-0 left-0 w-[850px] h-[480px] p-4 pointer-events-auto">
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
            <div className="text-white text-4xl bg-white/10 px-3 py-1 rounded-full">
              {currentTime.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
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