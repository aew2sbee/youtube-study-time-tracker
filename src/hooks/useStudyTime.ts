import { useState, useEffect, useCallback } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';

const START_STUDY_KEYWORDS = 'start';
const END_STUDY_KEYWORDS = 'end';

const API_POLLING_INTERVAL = 600000; // 10分間隔 (10 * 60 * 1000 ms)
const ADDITIONAL_STUDY_TIME = 3600; // 追加の勉強時間（秒）- 1時間
const TARGET_STUDY_TIME = 7200; // 目標勉強時間（秒）- 2時間
const SHOW_PROGRESS_BAR = true; // みんなの勉強時間表示の表示/非表示

// 個人の勉強進捗データ
const PERSONAL_STUDY_PROGRESS = {
  totalTime: 21 * 60 * 60, // 個人の累積勉強時間（秒）- 4時間
  examDate: 'Not scheduled yet', // 受験日
  testScore: '科目A: 47%, 科目B: 95%', // テスト結果
  updateDate: '2025/07/03', // 更新日
} as const;


export const useStudyTime = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(new Map());
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [nextPageToken, setNextPageToken] = useState<string>('');

  const updateStudyTime = useCallback((messages: YouTubeLiveChatMessage[]) => {
    const now = new Date();

    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);

      messages.forEach((message) => {
        const existingUser = newUsers.get(message.authorDisplayName);
        const currentTime = new Date(message.publishedAt);
        const messageText = message.displayMessage.toLowerCase().trim();

        if (existingUser) {
          if (messageText.includes(START_STUDY_KEYWORDS)) {
            // 勉強開始
            if (!existingUser.isStudying) {
              existingUser.startTime = currentTime;
              existingUser.isStudying = true;
            }
          } else if (messageText.includes(END_STUDY_KEYWORDS)) {
            // 勉強終了
            if (existingUser.isStudying && existingUser.startTime) {
              const studyDuration = Math.floor(
                (currentTime.getTime() - existingUser.startTime.getTime()) /
                  1000
              );
              if (studyDuration > 0) {
                existingUser.studyTime += studyDuration;
              }
              existingUser.isStudying = false;
              existingUser.startTime = undefined;
            }
          }
        } else {
          // 新規ユーザー
          const isStarting = messageText.includes(START_STUDY_KEYWORDS);
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
      const url = `/api/youtube${
        nextPageToken ? `?pageToken=${nextPageToken}` : ''
      }`;
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
  }, [fetchLiveChatMessages]);

  const formatTime = (seconds: number): string => {
    if (seconds === 0) {
      return '--:--';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  };

  const formatUpdateTime = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const getSortedUsers = (): StudyTimeUser[] => {
    // return Array.from(users.values()).sort((a, b) => b.studyTime - a.studyTime);
    return Array.from(users.values())
      .filter((user) => user.studyTime > 0 || user.isStudying)
      .sort((a, b) => b.studyTime - a.studyTime);
  };

  const getTotalStudyTime = (): number => {
    const usersTotal = Array.from(users.values())
      .filter((user) => user.studyTime > 0 || user.isStudying)
      .reduce((total, user) => {
        let userTime = user.studyTime;
        // 現在勉強中の場合は経過時間も追加
        if (user.isStudying && user.startTime) {
          const currentTime = Math.floor(
            (new Date().getTime() - user.startTime.getTime()) / 1000
          );
          userTime += currentTime;
        }
        return total + userTime;
      }, 0);

    // 追加の勉強時間を合算
    return usersTotal + ADDITIONAL_STUDY_TIME;
  };

  return {
    users: getSortedUsers(),
    lastUpdateTime,
    formatTime,
    formatUpdateTime,
    getTotalStudyTime,
    targetStudyTime: TARGET_STUDY_TIME,
    showProgressBar: SHOW_PROGRESS_BAR,
    personalProgress: PERSONAL_STUDY_PROGRESS,
  };
};
