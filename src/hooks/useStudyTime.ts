import { useState, useEffect, useCallback } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';

const API_POLLING_INTERVAL = 600000; // 10分間隔 (10 * 60 * 1000 ms)

export const useStudyTime = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(new Map());
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
          if (messageText.includes('start')) {
            // 勉強開始
            if (!existingUser.isStudying) {
              existingUser.startTime = currentTime;
              existingUser.isStudying = true;
            }
          } else if (messageText.includes('end')) {
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
          const isStarting = messageText.includes('start');
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
        return API_POLLING_INTERVAL;
      }
      
      if (data.messages && data.messages.length > 0) {
        updateStudyTime(data.messages);
      }
      
      if (data.nextPageToken) {
        setNextPageToken(data.nextPageToken);
      }
      
      return API_POLLING_INTERVAL;
    } catch (error) {
      console.error('Error fetching live chat messages:', error);
      return API_POLLING_INTERVAL;
    }
  }, [updateStudyTime]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const poll = async () => {
      const interval = await fetchLiveChatMessages();
      timeoutId = setTimeout(poll, interval);
    };
    
    poll();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds === 0) {
      return '--:--';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatUpdateTime = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getSortedUsers = (): StudyTimeUser[] => {
    // return Array.from(users.values()).sort((a, b) => b.studyTime - a.studyTime);
    return Array.from(users.values())
      .filter(user => user.studyTime > 0 || user.isStudying)
      .sort((a, b) => b.studyTime - a.studyTime);
  };

  return {
    users: getSortedUsers(),
    lastUpdateTime,
    formatTime,
    formatUpdateTime,
  };
};