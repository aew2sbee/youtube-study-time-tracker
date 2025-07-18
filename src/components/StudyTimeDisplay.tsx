import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StudyTimeUser } from '@/types/youtube';
import { CRON_TIME_1, CRON_TIME_2, CRON_TIME_3 } from '@/constants/config';

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

const now = new Date();
const USERS_PER_PAGE = 3;
const TRANSITION_DURATION = 1 * 1000; // フェードトランジション時間（ミリ秒）
const PAGE_DISPLAY_INTERVAL = 10 * 1000; // ページ表示間隔（ミリ秒）
const CURRENT_YEAR_MONTH = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

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
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProgressBarState, setShowProgressBarState] = useState(false);
  const [showPersonalProgress, setShowPersonalProgress] = useState(true);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedFlowerLevel, setAnimatedFlowerLevel] = useState(1);
  const [flowerTransitionKey, setFlowerTransitionKey] = useState(0);
  const usersPerPage = USERS_PER_PAGE;
  const totalPages = Math.ceil(users.length / usersPerPage);

  useEffect(() => {
    setMounted(true);
    let animationTimer: NodeJS.Timeout;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage((prev) => {
          let totalViews = 2; // 個人進捗 + Study Time Tracker（ユーザー0人でも表示）
          if (users.length > 0) {
            totalViews = 1 + totalPages; // 個人進捗 + ユーザーページ数
            if (showProgressBar) {
              totalViews += 1; // プログレスバーページを追加
            }
          }

          const nextPage = (prev + 1) % totalViews;

          // 個人進捗表示の判定
          if (nextPage === 0) {
            setShowPersonalProgress(true);
            setShowProgressBarState(false);
          } else if (
            users.length > 0 &&
            showProgressBar &&
            nextPage === totalViews - 1
          ) {
            // 最後のページがプログレスバー
            setShowPersonalProgress(false);
            setShowProgressBarState(true);

            // プログレスバーページでのカウントアップアニメーション
            const targetPercentage = Math.floor((getTotalStudyTime() / targetStudyTime) * 100);
            const targetFlowerLevel = Math.min(Math.floor(targetPercentage / 10) + 1, 10);
            setAnimatedPercentage(0);
            setAnimatedFlowerLevel(1);
            setFlowerTransitionKey(prev => prev + 1);

            const duration = 3000; // 3秒間のアニメーション（より長く）
            const steps = 180; // フレーム数をさらに増やして滑らかに
            const stepTime = duration / steps;
            // 花のレベルを段階的に変化させるための配列
            const flowerLevels: Array<{ level: number; step: number }> = [];
            for (let i = 1; i <= targetFlowerLevel; i++) {
              const stepForLevel = Math.round((i / targetFlowerLevel) * steps);
              flowerLevels.push({ level: i, step: stepForLevel });
            }

            let currentStep = 0;
            animationTimer = setInterval(() => {
              currentStep++;

              // 線形に進行させる
              const progress = Math.min(currentStep / steps, 1);
              const currentPercentage = Math.min(Math.max(Math.round(targetPercentage * progress), 0), targetPercentage);

              // 現在のステップに対応する花のレベルを見つける
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
          } else {
            // ユーザーページまたは空のStudy Time Tracker
            setShowPersonalProgress(false);
            setShowProgressBarState(false);
          }

          return nextPage;
        });
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    }, PAGE_DISPLAY_INTERVAL);

    return () => {
      clearInterval(interval);
      if (animationTimer) {
        clearInterval(animationTimer);
      }
    };
}, [totalPages, users.length, showProgressBar, getTotalStudyTime, targetStudyTime]);

  // ユーザー表示用のページ計算（個人進捗を除く）
  const getUserPageIndex = () => {
    if (showPersonalProgress || showProgressBarState) {
      return 0;
    }
    // currentPage - 1 (個人進捗分を引く)
    return Math.max(0, currentPage - 1);
  };

  const userPageIndex = getUserPageIndex();
  const displayedUsers = users.slice(
    userPageIndex * usersPerPage,
    (userPageIndex + 1) * usersPerPage
  );

  return (
    <div className={`w-screen h-screen p-2 flex justify-start items-end transition-opacity duration-1000 overflow-hidden ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="w-full max-w-2xl flex flex-col justify-end h-full">
        <div className="p-4 mb-2 h-96">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-white">
              {showPersonalProgress
                ? 'My Study Progress'
                : showProgressBarState
                ? `Monthly Challenge`
                : 'Focus Time Tracker'}
            </h1>
            <div className="text-white text-2xl">
              {showPersonalProgress
                ? `Updated Date: ${personalProgress.updateDate}`
                : `Next Update: ${
                    mounted ? formatUpdateTime(nextUpdateTime) : '--:--'
                  }`}
            </div>
          </div>

          <div className="flex flex-col h-90">
            {showPersonalProgress ? (
              <div className="flex-1 flex flex-col justify-start pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium text-2xl">
                      Current Study
                    </span>
                    <span className="text-white font-bold text-2xl">
                      {personalProgress.currentStudy}
                    </span>
                  </div>

                  <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium text-2xl">
                      Total Study Time
                    </span>
                    <span className="text-white font-bold text-2xl">
                      {personalProgress.totalTime} / 150h
                    </span>
                  </div>

                  <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium text-2xl">
                      Exam Date
                    </span>
                    <span className="text-white font-bold text-2xl">
                      {personalProgress.examDate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium text-2xl">
                      Test Score
                    </span>
                    <span className="text-white font-bold text-2xl">
                      {personalProgress.testScore}
                    </span>
                  </div>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-white text-center text-2xl flex-1 flex items-start justify-center pt-16">
                <div className="space-y-2">
                  <div>誰でも勉強時間の計測に参加することができます。</div>
                  <div>
                    コメント欄に<b>「start」</b>で開始、<b>「end」</b>で終了
                  </div>
                  <div>複数回の<b>「start」/「end」</b>で時間が累積されます</div>
                </div>
              </div>
            ) : showProgressBar && showProgressBarState ? (
              <div className="flex-1 flex flex-row pt-4">
                <div className="w-2/5 flex flex-col justify-center space-y-2 pr-8">
                  <div className="text-white text-center">
                    <div className="text-lg mb-2">Current Progress</div>
                    <div className="text-4xl font-bold">
                      {parseInt(formatTime(getTotalStudyTime()).slice(0, -3))} / {parseInt(formatTime(targetStudyTime).slice(0, -3))} h
                    </div>
                  </div>
                  <div className="text-white text-center">
                    <div className="text-lg mb-2">Current Progress Percent</div>
                    <div className="text-5xl font-bold">
                      {animatedPercentage} %
                    </div>
                  </div>
                </div>
                <div className="w-3/5 flex flex-col pl-8 relative">
                  <div className="flex justify-center items-center relative">
                    <Image
                      key={flowerTransitionKey}
                      src={`/flower/${CURRENT_YEAR_MONTH}/${animatedFlowerLevel}.png`}
                      alt="Progress flower"
                      width={600}
                      height={600}
                      className="w-64 h-64 object-contain transition-all duration-300 ease-in-out"
                    />
                    {animatedFlowerLevel === 10 && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* キラキラエフェクト - 花の画像内に収まるよう配置 */}
                        <div className="absolute top-36 left-28 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-1300"></div>
                        <div className="absolute top-32 left-24 w-3 h-3 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-500"></div>
                        <div className="absolute top-16 left-20 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute top-7 left-40 w-3 h-3 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-900"></div>
                        <div className="absolute top-3 left-32 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-300"></div>
                        <div className="absolute top-28 left-64 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-1100"></div>
                        <div className="absolute top-40 left-36 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-700"></div>
                        <div className="absolute top-44 left-60 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-1500"></div>

                        {/* 右側エリア */}
                        <div className="absolute top-4 left-60 w-3 h-3 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-1600"></div>
                        <div className="absolute top-44 left-10 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-70 animation-delay-800"></div>
                        <div className="absolute top-10 left-72 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-75 animation-delay-200"></div>
                        <div className="absolute top-12 left-60 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75 animation-delay-1200"></div>
                        <div className="absolute top-40 left-80 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-80 animation-delay-600"></div>
                        <div className="absolute top-20 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-1400"></div>
                        <div className="absolute top-16 left-32 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-1800"></div>
                        <div className="absolute top-80 left-12 w-3 h-3 bg-yellow-500 rounded-full animate-bounce opacity-85 animation-delay-1000"></div>

                        {/* 下側エリア */}
                        <div className="absolute top-56 left-28 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-70 animation-delay-750"></div>
                        <div className="absolute top-48 left-32 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-350"></div>
                        <div className="absolute top-48 left-20 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-100"></div>
                        <div className="absolute top-12 left-14 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-75 animation-delay-550"></div>
                        <div className="absolute top-52 left-64 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-80 animation-delay-650"></div>
                        <div className="absolute top-24 left-72 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-250"></div>
                        <div className="absolute top-14 left-40 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-450"></div>
                        <div className="absolute top-56 left-48 w-2 h-2 bg-yellow-500 rounded-full animate-bounce opacity-85 animation-delay-850"></div>

                        {/* 中央エリア */}
                        <div className="absolute top-44 left-14 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-1550"></div>
                        <div className="absolute top-40 left-32 w-2 h-2 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-1150"></div>
                        <div className="absolute top-32 left-28 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75 animation-delay-950"></div>
                        <div className="absolute top-28 left-12 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-1350"></div>
                        <div className="absolute top-36 left-64 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-1050"></div>
                        <div className="absolute top-32 left-80 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-1450"></div>
                        <div className="absolute top-44 left-72 w-3 h-3 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-1250"></div>
                        <div className="absolute top-44 left-80 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-1650"></div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-8 right-8 bg-gray-700 rounded-full h-6">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-200 ease-out relative overflow-hidden"
                      style={{
                        width: `${Math.min(animatedPercentage, 100)}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                      <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-hidden p-2">
                {displayedUsers.map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={user.profileImageUrl}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                        {user.studyTime >= CRON_TIME_3 ? (
                          <Image
                            src="/crown/3.png"
                            alt="crown"
                            width={50}
                            height={50}
                            className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-8 h-8"
                          />
                        ) : user.studyTime >= CRON_TIME_2 ? (
                          <Image
                            src="/crown/2.png"
                            alt="crown"
                            width={50}
                            height={50}
                            className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-8 h-8"
                          />
                        ) : user.studyTime >= CRON_TIME_1 ? (
                          <Image
                            src="/crown/1.png"
                            alt="crown"
                            width={50}
                            height={50}
                            className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-8 h-8"
                          />
                        ) : null}
                      </div>
                      <span className="text-white font-medium truncate max-w-[300px] text-3xl">
                        {user.name}
                      </span>
                    </div>

                    <div className="text-white font-bold flex items-center text-4xl">
                      {user.isStudying ? (
                        <span className="text-green-400 w-32 text-center text-2xl mr-4 animate-pulse">
                          Focusing
                        </span>
                      ) : user.studyTime > 0 ? (
                        <span className="text-blue-400 w-32 text-center text-2xl mr-4">
                          Finished
                        </span>
                      ) : null}
                      <span>{formatTime(user.studyTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {users.length > 0 &&
              !showPersonalProgress &&
              !(showProgressBar && showProgressBarState) &&
              totalPages > 1 && (
                <div className="text-white text-center mt-3 text-xl">
                  {userPageIndex + 1} / {totalPages}
                </div>
              )}

            {users.length > 0 &&
              !showPersonalProgress &&
              !(showProgressBar && showProgressBarState) && (
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <div className="flex justify-center items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/crown/1.png"
                        alt="Bronze Crown"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span className="text-white text-sm">30min+</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/crown/2.png"
                        alt="Silver Crown"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span className="text-white text-sm">60min+</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/crown/3.png"
                        alt="Gold Crown"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span className="text-white text-sm">120min+</span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
