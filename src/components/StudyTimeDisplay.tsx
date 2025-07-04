import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StudyTimeUser } from '@/types/youtube';

interface StudyTimeDisplayProps {
  users: StudyTimeUser[];
  formatTime: (seconds: number) => string;
  lastUpdateTime: Date;
  formatUpdateTime: (date: Date) => string;
}

export const StudyTimeDisplay = ({
  users,
  formatTime,
  lastUpdateTime,
  formatUpdateTime,
}: StudyTimeDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const usersPerPage = 3;
  const totalPages = Math.ceil(users.length / usersPerPage);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
        setIsTransitioning(false);
      }, 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, [totalPages]);

  const displayedUsers = users.slice(
    currentPage * usersPerPage,
    (currentPage + 1) * usersPerPage
  );

  return (
    <div className="w-screen h-screen p-2 flex justify-start items-end">
      <div className="w-full max-w-2xl flex flex-col justify-end h-full">
        <div className="p-4 mb-2 min-h-fit">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-white">
              Study Time Tracker
            </h1>
            <div className="text-white text-2xl">
              Updated: {mounted ? formatUpdateTime(lastUpdateTime) : '--:--'}
            </div>
          </div>
          
          <div className="flex flex-col">
            {displayedUsers.length === 0 ? (
              <div className="text-white text-center text-2xl flex-1 flex items-center justify-center">
                Waiting for comments...
              </div>
            ) : (
              <div className={`space-y-3 flex-1 transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {displayedUsers.map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        src={user.profileImageUrl}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="text-white font-medium truncate max-w-[300px]" style={{fontSize: '40px'}}>
                        {user.name}
                      </span>
                    </div>
                    
                    <div className="text-white font-bold flex items-center space-x-3" style={{fontSize: '40px'}}>
                      {user.isStudying ? (
                        <span className="text-green-400 animate-pulse w-24 text-center" style={{fontSize: '24px'}}>Studying</span>
                      ) : user.studyTime > 0 ? (
                        <span className="text-blue-400 w-24 text-center" style={{fontSize: '24px'}}>Finished</span>
                      ) : null}
                      <span>{formatTime(user.studyTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="text-white text-center mt-3 text-xl">
                {currentPage + 1} / {totalPages}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};