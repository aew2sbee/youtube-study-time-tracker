'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data
const mockUsers = [
  { name: 'Alice Johnson', studyTime: '2:30', status: '勉強中', avatar: '👩‍💻' },
  { name: 'Bob Smith', studyTime: '1:45', status: '休憩中', avatar: '👨‍💼' },
  { name: 'Charlie Brown', studyTime: '3:15', status: '勉強中', avatar: '👨‍🎓' },
  { name: 'Diana Prince', studyTime: '1:20', status: '勉強中', avatar: '👩‍🔬' },
  { name: 'Edward Norton', studyTime: '2:50', status: '休憩中', avatar: '👨‍🎨' },
  { name: 'Edward Norton', studyTime: '2:50', status: '休憩中', avatar: '👨‍🎨' },
  { name: 'Edward Norton', studyTime: '2:50', status: '休憩中', avatar: '👨‍🎨' },
  { name: 'Edward Norton', studyTime: '2:50', status: '休憩中', avatar: '👨‍🎨' },
  { name: 'Edward Norton', studyTime: '2:50', status: '休憩中', avatar: '👨‍🎨' },
];

const mockPersonalProgress = {
  totalStudyTime: '45時間30分',
  todayStudyTime: '3時間15分',
  currentStreak: '7日連続',
  monthlyGoal: '100時間',
  achievement: '45%達成',
};

const mockProgressData = {
  weeklyGoal: 20,
  currentWeekTime: 12.5,
  monthlyGoal: 80,
  currentMonthTime: 35.2,
  yearlyGoal: 1000,
  currentYearTime: 420.5,
};

// Components for each page
const PersonalProgressPage = () => (
  <div className="text-white space-y-4">
    <div className="text-center mb-6">
      <div className="text-4xl mb-2">📚</div>
      <h2 className="text-xl font-bold">個人学習進捗</h2>
    </div>
    
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="bg-blue-500/20 p-3 rounded-lg">
        <div className="text-blue-300 text-xs">総学習時間</div>
        <div className="text-lg font-bold">{mockPersonalProgress.totalStudyTime}</div>
      </div>
      <div className="bg-green-500/20 p-3 rounded-lg">
        <div className="text-green-300 text-xs">今日の学習時間</div>
        <div className="text-lg font-bold">{mockPersonalProgress.todayStudyTime}</div>
      </div>
      <div className="bg-orange-500/20 p-3 rounded-lg">
        <div className="text-orange-300 text-xs">連続学習</div>
        <div className="text-lg font-bold">{mockPersonalProgress.currentStreak}</div>
      </div>
      <div className="bg-purple-500/20 p-3 rounded-lg">
        <div className="text-purple-300 text-xs">月間目標</div>
        <div className="text-lg font-bold">{mockPersonalProgress.achievement}</div>
      </div>
    </div>
  </div>
);

const UserListPage = ({ users, pageIndex, totalPages }: { 
  users: typeof mockUsers; 
  pageIndex: number; 
  totalPages: number;
}) => (
  <div className="text-white space-y-3">
    <div className="text-center mb-4">
      <div className="text-3xl mb-2">👥</div>
      <h2 className="text-xl font-bold">Focus Time Tracker</h2>
    </div>

    <div className="space-y-2">
      {users.map((user, index) => (
        <div key={index} className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{user.avatar}</div>
            <div>
              <div className="font-semibold text-sm">{user.name}</div>
              <div className="text-xs text-gray-300">{user.status}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-400">{user.studyTime}</div>
            <div className="text-xs text-gray-400">学習時間</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProgressChartPage = () => (
  <div className="text-white space-y-4">
    <div className="text-center mb-6">
      <div className="text-4xl mb-2">📊</div>
      <h2 className="text-xl font-bold">Monthly Challenge</h2>
    </div>

    <div className="space-y-4">
      {/* Weekly Progress */}
      <div className="bg-blue-500/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-blue-300">週間目標</span>
          <span>{mockProgressData.currentWeekTime}h / {mockProgressData.weeklyGoal}h</span>
        </div>
        <div className="w-full bg-blue-900/30 rounded-full h-2">
          <motion.div
            className="bg-blue-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(mockProgressData.currentWeekTime / mockProgressData.weeklyGoal) * 100}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-green-500/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-green-300">月間目標</span>
          <span>{mockProgressData.currentMonthTime}h / {mockProgressData.monthlyGoal}h</span>
        </div>
        <div className="w-full bg-green-900/30 rounded-full h-2">
          <motion.div
            className="bg-green-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(mockProgressData.currentMonthTime / mockProgressData.monthlyGoal) * 100}%` }}
            transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Yearly Progress */}
      <div className="bg-purple-500/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-300">年間目標</span>
          <span>{mockProgressData.currentYearTime}h / {mockProgressData.yearlyGoal}h</span>
        </div>
        <div className="w-full bg-purple-900/30 rounded-full h-2">
          <motion.div 
            className="bg-purple-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(mockProgressData.currentYearTime / mockProgressData.yearlyGoal) * 100}%` }}
            transition={{ duration: 2, delay: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  </div>
);

const WelcomePage = () => (
  <div className="text-white text-center space-y-4">
    <div className="text-6xl mb-4">🎯</div>
    <h2 className="text-2xl font-bold mb-4">Study Time Tracker</h2>
    <div className="space-y-2 text-lg">
      <div>誰でも集中時間の計測に参加できます</div>
      <div className="text-yellow-300">
        コメント欄に <strong>「start」</strong> で開始
      </div>
      <div className="text-green-300">
        <strong>「end」</strong> で終了
      </div>
      <div className="text-sm text-gray-300 mt-4">
        複数回の「start」/「end」で時間が累積されます
      </div>
    </div>
  </div>
);

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);

  // 3人ずつでページ分割
  const usersPerPage = 3;
  const totalUserPages = Math.ceil(mockUsers.length / usersPerPage);
  
  // ユーザーページを動的に生成
  const userPages = Array.from({ length: totalUserPages }, (_, pageIndex) => {
    const startIndex = pageIndex * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = mockUsers.slice(startIndex, endIndex);
    
    return {
      key: `users-${pageIndex}`,
      title: totalUserPages > 1 ? `Focus Tracker (${pageIndex + 1}/${totalUserPages})` : 'Focus Tracker',
      component: (
        <UserListPage 
          users={pageUsers} 
          pageIndex={pageIndex} 
          totalPages={totalUserPages} 
        />
      ),
    };
  });

  const pages = [
    { key: 'welcome', title: 'Welcome', component: <WelcomePage /> },
    { key: 'personal', title: 'My Progress', component: <PersonalProgressPage /> },
    ...userPages,
    { key: 'progress', title: 'Monthly Challenge', component: <ProgressChartPage /> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, 10000); // 10秒間隔

    return () => clearInterval(interval);
  }, [pages.length]);

  const currentPageData = pages[currentPage];

  return (
    <div className="fixed inset-0 w-[1920px] h-[1080px] overflow-hidden pointer-events-none from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute bottom-0 left-0 w-[600px] h-[480px] p-4 pointer-events-auto">
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 h-full border border-white/20 shadow-2xl">
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-white">
              {currentPageData.title}
            </h1>
            <div className="text-white text-sm bg-white/10 px-3 py-1 rounded-full">
              {new Date().toLocaleTimeString('ja-JP', {
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