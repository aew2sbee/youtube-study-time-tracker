import { useState, useEffect, useCallback } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';

// Mock data for testing
const createMockUsers = (): Map<string, StudyTimeUser> => {
  const mockUsers = new Map<string, StudyTimeUser>();
  
  mockUsers.set('田中太郎', {
    name: '田中太郎',
    studyTime: 7200, // 2 hours
    profileImageUrl: 'https://yt3.ggpht.com/ToBVHdJPmTSckqWsesfbs8OxH6kBd-V-81pP8BLysaXnLwVfOjFF9pA05HGdiuTRJjYwuVZ_yA=s88-c-k-c0x00ffffff-no-rj',
    startTime: undefined,
    isStudying: false,
  });
  
  mockUsers.set('佐藤花子', {
    name: '佐藤花子',
    studyTime: 5400, // 1.5 hours
    profileImageUrl: 'https://yt3.ggpht.com/ToBVHdJPmTSckqWsesfbs8OxH6kBd-V-81pP8BLysaXnLwVfOjFF9pA05HGdiuTRJjYwuVZ_yA=s88-c-k-c0x00ffffff-no-rj',
    startTime: new Date(Date.now() - 1800000), // started 30 minutes ago
    isStudying: true,
  });
  
  mockUsers.set('山田次郎', {
    name: '山田次郎',
    studyTime: 3600, // 1 hour
    profileImageUrl: 'https://yt3.ggpht.com/ToBVHdJPmTSckqWsesfbs8OxH6kBd-V-81pP8BLysaXnLwVfOjFF9pA05HGdiuTRJjYwuVZ_yA=s88-c-k-c0x00ffffff-no-rj',
    startTime: undefined,
    isStudying: false,
  });
  
  mockUsers.set('鈴木一郎', {
    name: '鈴木一郎',
    studyTime: 1800, // 30 minutes
    profileImageUrl: 'https://yt3.ggpht.com/ToBVHdJPmTSckqWsesfbs8OxH6kBd-V-81pP8BLysaXnLwVfOjFF9pA05HGdiuTRJjYwuVZ_yA=s88-c-k-c0x00ffffff-no-rj',
    startTime: new Date(Date.now() - 600000), // started 10 minutes ago
    isStudying: true,
  });
  
  mockUsers.set('高橋美咲', {
    name: '高橋美咲',
    studyTime: 2700, // 45 minutes
    profileImageUrl: 'https://yt3.ggpht.com/ToBVHdJPmTSckqWsesfbs8OxH6kBd-V-81pP8BLysaXnLwVfOjFF9pA05HGdiuTRJjYwuVZ_yA=s88-c-k-c0x00ffffff-no-rj',
    startTime: undefined,
    isStudying: false,
  });
  
  mockUsers.set('伊藤健太', {
    name: '伊藤健太',
    studyTime: 900, // 15 minutes
    profileImageUrl: 'https://yt3.ggpht.com/ToBVHdJPmTSckqWsesfbs8OxH6kBd-V-81pP8BLysaXnLwVfOjFF9pA05HGdiuTRJjYwuVZ_yA=s88-c-k-c0x00ffffff-no-rj',
    startTime: new Date(Date.now() - 300000), // started 5 minutes ago
    isStudying: true,
  });
  
  return mockUsers;
};

export const useStudyTime = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(createMockUsers());
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [nextPageToken, setNextPageToken] = useState<string>('');

  const updateStudyTime = useCallback((messages: YouTubeLiveChatMessage[]) => {
    const now = new Date();
    
    setUsers(prevUsers => {
      const newUsers = new Map(prevUsers);
      
      messages.forEach(message => {
        const existingUser = newUsers.get(message.authorDisplayName);
        const currentTime = new Date(message.publishedAt);
        const messageText = message.displayMessage.toLowerCase().trim();
        
        if (existingUser) {
          if (messageText === 'start') {
            // 勉強開始
            if (!existingUser.isStudying) {
              existingUser.startTime = currentTime;
              existingUser.isStudying = true;
            }
          } else if (messageText === 'end') {
            // 勉強終了
            if (existingUser.isStudying && existingUser.startTime) {
              const studyDuration = Math.floor((currentTime.getTime() - existingUser.startTime.getTime()) / 1000);
              if (studyDuration > 0) {
                existingUser.studyTime += studyDuration;
              }
              existingUser.isStudying = false;
              existingUser.startTime = undefined;
            }
          }
        } else {
          // 新規ユーザー
          const isStarting = messageText === 'start';
          newUsers.set(message.authorDisplayName, {
            name: message.authorDisplayName,
            studyTime: 0,
            profileImageUrl: message.profileImageUrl,
            startTime: isStarting ? currentTime : undefined,
            isStudying: isStarting,
          });
        }
      });
      
      return newUsers;
    });
    
    setLastUpdateTime(now);
  }, []);

  const fetchLiveChatMessages = useCallback(async () => {
    try {
      const url = `/api/youtube${nextPageToken ? `?pageToken=${nextPageToken}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API error:', data.error);
        return 10000; // Retry in 10 seconds on API error
      }
      
      if (data.messages && data.messages.length > 0) {
        updateStudyTime(data.messages);
      }
      
      if (data.nextPageToken) {
        setNextPageToken(data.nextPageToken);
      }
      
      return data.pollingIntervalMillis || 5000;
    } catch (error) {
      console.error('Error fetching live chat messages:', error);
      return 10000; // Retry in 10 seconds on error
    }
  }, [nextPageToken, updateStudyTime]);

  // Temporarily disable API polling to show mock data
  // useEffect(() => {
  //   let timeoutId: NodeJS.Timeout;
    
  //   const poll = async () => {
  //     const interval = await fetchLiveChatMessages();
  //     timeoutId = setTimeout(poll, interval);
  //   };
    
  //   poll();
    
  //   return () => {
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //     }
  //   };
  // }, [fetchLiveChatMessages]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatUpdateTime = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getSortedUsers = (): StudyTimeUser[] => {
    return Array.from(users.values()).sort((a, b) => b.studyTime - a.studyTime);
  };

  return {
    users: getSortedUsers(),
    lastUpdateTime,
    formatTime,
    formatUpdateTime,
  };
};