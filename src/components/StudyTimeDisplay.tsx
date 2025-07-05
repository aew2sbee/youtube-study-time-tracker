import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StudyTimeUser } from '@/types/youtube';

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
  };
}

const USERS_PER_PAGE = 3;
const TRANSITION_DURATION = 1 * 1000; // フェードトランジション時間（ミリ秒）
const PAGE_DISPLAY_INTERVAL = 10 * 1000; // ページ表示間隔（ミリ秒）

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
  const usersPerPage = USERS_PER_PAGE;
  const totalPages = Math.ceil(users.length / usersPerPage);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
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

    return () => clearInterval(interval);
  }, [totalPages, users.length, showProgressBar]);

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
    <div className={`w-screen h-screen p-2 flex justify-start items-end transition-opacity duration-1000 ${
      isTransitioning ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="w-full max-w-2xl flex flex-col justify-end h-full">
        <div className="p-4 mb-2 h-96">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-white">
              {showPersonalProgress
                ? 'My Study Progress'
                : showProgressBarState
                ? `Everyone's Total Time`
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

          <div className="flex flex-col h-80">
            {showPersonalProgress ? (
              <div className="flex-1 flex flex-col justify-start pt-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium text-2xl">
                      Total Time
                    </span>
                    <span className="text-white font-bold text-2xl">
                      {formatTime(personalProgress.totalTime)}
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
              <div className="flex-1 flex flex-col justify-start pt-16 space-y-6">
                <div className="text-white text-center text-5xl font-bold">
                  {formatTime(getTotalStudyTime())}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-8">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-8 rounded-full transition-all duration-1000 relative overflow-hidden"
                    style={{
                      width: `${Math.min(
                        (getTotalStudyTime() / targetStudyTime) * 100,
                        100
                      )}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                  </div>
                </div>
                <div className="text-white text-center text-lg">
                  Target: {formatTime(targetStudyTime)} (
                  {Math.floor((getTotalStudyTime() / targetStudyTime) * 100)}%
                  Achieved)
                </div>
              </div>
            ) : (
              <div className="space-y-1 flex-1 overflow-hidden">
                {displayedUsers.map((user) => (
                  <div key={user.name} className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={user.profileImageUrl}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="text-white font-medium truncate max-w-[300px] text-3xl">
                        {user.name}
                      </span>
                    </div>

                    <div
                      className="text-white font-bold flex items-center text-4xl"
                    >
                      {user.isStudying ? (
                        <span className="text-green-400 w-32 text-center text-2xl mr-8 animate-pulse">
                          Focusing
                        </span>
                      ) : user.studyTime > 0 ? (
                        <span className="text-blue-400 w-32 text-center text-2xl mr-8">
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
          </div>
        </div>
      </div>
    </div>
  );
};
