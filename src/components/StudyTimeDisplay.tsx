'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyTimeUser } from '@/types/youtube';
import { CRON_TIME_GOLD, CRON_TIME_SILVER } from '@/constants/config';
import { calcPercentage, calcRating10, calcUpdateTime } from '@/utils/calc';
import { parameter } from '@/config/system';
import { MyStudyProgress } from './MyStudyProgress';
import AnimationStar from './AnimationStar';
import ImageProfile from './ImageProfile';
import ImageCrown from './ImageCrown';
import FlowerImage from './ImageFlower';
import ProgressBar from './ProgressBar';
import FocusTimeTracker from './FocusTimeTracker';
import ExplanationCrown from './ExplanationCrown';

interface StudyTimeDisplayProps {
  users: StudyTimeUser[];
  formatTime: (seconds: number) => string;
  nextUpdateTime: Date;
  formatUpdateTime: (date: Date) => string;
  getTotalStudyTime: () => number;
  targetStudyTime: number;
  showProgressBar: boolean;
  personalProgress: {
    totalTime: number;
    examDate: string;
    testScore: string;
    updateDate: string;
    currentStudy: string;
  };
}

export const StudyTimeDisplay = ({
  users,
  formatTime,
  nextUpdateTime,
  formatUpdateTime,
  getTotalStudyTime,
  targetStudyTime,
  showProgressBar,
  personalProgress,
}: StudyTimeDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [showProgressBarState, setShowProgressBarState] = useState(false);
  const [showPersonalProgress, setShowPersonalProgress] = useState(true);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedFlowerLevel, setAnimatedFlowerLevel] = useState(1);
  const [flowerTransitionKey, setFlowerTransitionKey] = useState(0);
  const totalPages = Math.ceil(users.length / system.USERS_PER_PAGE);

  const components = [
    { type: 'personalProgress', key: 'personal' },
    ...(users.length === 0
      ? [{ type: 'emptyTracker', key: 'empty' }]
      : Array.from({ length: totalPages }, (_, i) => ({ type: 'focusTracker', key: `focus-${i}`, pageIndex: i }))),
    ...(showProgressBar && users.length > 0 ? [{ type: 'progressBar', key: 'progress' }] : []),
  ];

  // ページ遷移・アニメーションの管理
  const handlePageTransition = () => {
    setCurrentPage((prev) => {
      const nextPage = (prev + 1) % components.length;
      const currentComponent = components[nextPage];

      // 状態の更新
      setShowPersonalProgress(currentComponent.type === 'personalProgress');
      setShowProgressBarState(currentComponent.type === 'progressBar');

      // プログレスバーの場合はアニメーション開始
      if (currentComponent.type === 'progressBar') {
        startProgressBarAnimation();
      }

      return nextPage;
    });
  };

  // プログレスバーのアニメーション管理
  const startProgressBarAnimation = () => {
    const targetPercentage = calcPercentage(getTotalStudyTime(), targetStudyTime);
    const targetFlowerLevel = calcRating10(targetPercentage);
    setAnimatedPercentage(0);
    setAnimatedFlowerLevel(1);
    setFlowerTransitionKey((prev) => prev + 1);

    const duration = 3000; // 3秒間のアニメーション
    const steps = 180;
    const stepTime = duration / steps;
    const flowerLevels: Array<{ level: number; step: number }> = [];
    for (let i = 1; i <= targetFlowerLevel; i++) {
      const stepForLevel = Math.round((i / targetFlowerLevel) * steps);
      flowerLevels.push({ level: i, step: stepForLevel });
    }

    let currentStep = 0;
    const animationTimer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      const currentPercentage = Math.min(Math.max(Math.round(targetPercentage * progress), 0), targetPercentage);
      let currentFlowerLevel = 1;
      for (const flowerLevel of flowerLevels) {
        if (currentStep >= flowerLevel.step) {
          currentFlowerLevel = flowerLevel.level;
        }
      }
      setAnimatedPercentage(currentPercentage);
      setAnimatedFlowerLevel(currentFlowerLevel);

      if (currentStep >= steps) {
        clearInterval(animationTimer);
      }
    }, stepTime);
  };

  // ページ切り替えタイマー (10秒間隔)
  useEffect(() => {
    setMounted(true);
    let interval: NodeJS.Timeout;

    interval = setInterval(() => {
      handlePageTransition();
    }, 10000); // 10秒間隔に変更

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, users.length, showProgressBar, getTotalStudyTime, targetStudyTime]);

  // プログレスバーアニメーション用のクリーンアップ
  useEffect(() => {
    // クリーンアップ用
    return () => {
      // アニメーションタイマーはstartProgressBarAnimation内で都度clearIntervalされる
    };
  }, []);

  // 現在表示するコンポーネントの取得
  const getCurrentComponent = () => {
    const currentComponent = components[currentPage];
    if (!currentComponent) return null;

    if (currentComponent.type === 'focusTracker' && currentComponent.pageIndex !== undefined) {
      const startIndex = currentComponent.pageIndex * system.USERS_PER_PAGE;
      const endIndex = (currentComponent.pageIndex + 1) * system.USERS_PER_PAGE;
      const displayedUsers = users.slice(startIndex, endIndex);
      return { ...currentComponent, displayedUsers };
    }

    return currentComponent;
  };

  const currentComponent = getCurrentComponent();

  const getTitle = () => {
    if (!currentComponent) return 'Loading...';
    switch (currentComponent.type) {
      case 'personalProgress':
        return 'My Study Progress';
      case 'progressBar':
        return 'Monthly Challenge';
      case 'emptyTracker':
      case 'focusTracker':
      default:
        return 'Focus Time Tracker';
    }
  };

  const getSubtitle = () => {
    if (!currentComponent) return '--:--';
    if (currentComponent.type === 'personalProgress') {
      return `Updated Date: ${personalProgress.updateDate}`;
    }
    return `Next Update: ${mounted ? calcUpdateTime(currentTime) : '--:--'}`;
  };

  const renderCurrentComponent = () => {
    if (!currentComponent) return null;

    switch (currentComponent.type) {
      case 'personalProgress':
        return <MyStudyProgress />;
      case 'emptyTracker':
        return (
          <div className="text-white text-center text-lg flex-1 flex items-start justify-center pt-8">
            <div className="space-y-2">
              <div>誰でも集中時間の計測に参加することができます。</div>
              <div>
                コメント欄に<b>「start」</b>で開始、<b>「end」</b>で終了
              </div>
              <div>
                複数回の<b>「start」/「end」</b>で時間が累積されます
              </div>
            </div>
          </div>
        );
      case 'focusTracker':
        return (
          <>
            <FocusTimeTracker user={currentComponent.displayedUsers || []} />
            {users.length > 0 && totalPages > 1 && (
              <div className="text-white text-center mt-3 text-lg">
                {(currentComponent.pageIndex || 0) + 1} / {totalPages}
              </div>
            )}
            <ExplanationCrown />
          </>
        );
      case 'progressBar':
        return (
          <ProgressBar
            percentage={animatedPercentage}
            flowerLevel={animatedFlowerLevel}
            transitionKey={flowerTransitionKey}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 w-[1920px] h-[1080px] overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 left-0 w-[600px] h-[480px] p-4 pointer-events-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 h-full border border-white/10">
          <motion.div
            className="flex justify-between items-center mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-white">{getTitle()}</h1>
            <div className="text-white text-sm">{getSubtitle()}</div>
          </motion.div>

          <div className="flex flex-col h-[calc(100%-60px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentComponent?.key || 'loading'}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="h-full overflow-hidden"
              >
                {renderCurrentComponent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
