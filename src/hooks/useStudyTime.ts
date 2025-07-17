import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';
import { PERSONAL_STUDY_PROGRESS } from '@/constants/personalProgress';
import { ADDITIONAL_STUDY_TIME, TARGET_STUDY_TIME, SHOW_PROGRESS_BAR } from '@/constants/config';

const START_STUDY_KEYWORDS = 'start';
const END_STUDY_KEYWORDS = 'end';

const API_POLLING_INTERVAL = 5 * 60 * 1000; // 5分間隔 (5 * 60 * 1000 ms)



export const useStudyTime = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(new Map());
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [nextPageToken, setNextPageToken] = useState<string>('');
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const updateStudyTime = useCallback((messages: YouTubeLiveChatMessage[]) => {
    const now = new Date();

    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);

      messages.forEach((message) => {
        const messageText = message.displayMessage.toLowerCase().trim();

        // startとendを含まないメッセージはスキップ
        if (messageText !== START_STUDY_KEYWORDS && messageText !== END_STUDY_KEYWORDS) return

        // 処理済みメッセージをスキップ
        const messageId = `${message.authorDisplayName}-${message.publishedAt}-${messageText}`;
        if (processedMessagesRef.current.has(messageId)) return;

        const existingUser = newUsers.get(message.authorDisplayName);
        const currentTime = new Date(message.publishedAt);

        if (existingUser) {
          if (messageText === START_STUDY_KEYWORDS) {
            // 勉強開始
            if (!existingUser.isStudying) {
              newUsers.set(message.authorDisplayName, {
                ...existingUser,
                startTime: currentTime,
                isStudying: true,
              });
            }
          } else if (messageText === END_STUDY_KEYWORDS) {
            // 勉強終了
            if (existingUser.isStudying && existingUser.startTime) {
              const studyDuration = Math.floor(
                (currentTime.getTime() - existingUser.startTime.getTime()) / 1000);
              const additionalTime = studyDuration > 0 ? studyDuration : 0;
              newUsers.set(message.authorDisplayName, {
                ...existingUser,
                studyTime: existingUser.studyTime + additionalTime,
                isStudying: false,
                startTime: undefined,
              });
            }
          }
        } else {
          // 新規ユーザー
          const isStarting = messageText === START_STUDY_KEYWORDS;
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

    // 処理済みメッセージを更新
    messages.forEach(message => {
      const messageText = message.displayMessage.toLowerCase().trim();
      if (messageText === START_STUDY_KEYWORDS || messageText === END_STUDY_KEYWORDS) {
        const messageId = `${message.authorDisplayName}-${message.publishedAt}-${messageText}`;
        processedMessagesRef.current.add(messageId);
      }
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
  }, [fetchLiveChatMessages]);

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0h 0min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString()}h ${minutes.toString()}min`;
  };

  const formatUpdateTime = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const getSortedUsers = (): StudyTimeUser[] => {
    const now = new Date();
    return Array.from(users.values())
      .filter((user) => user.studyTime > 0 || user.isStudying)
      .map((user) => {
        // リアルタイム計算: 勉強中の場合は現在時刻までの時間を追加
        if (user.isStudying && user.startTime) {
          const currentStudyTime = Math.floor(
            (now.getTime() - user.startTime.getTime()) / 1000
          );
          return {
            ...user,
            studyTime: user.studyTime + currentStudyTime,
          };
        }
        return user;
      })
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

  const getNextUpdateTime = (): Date => {
    const nextUpdate = new Date(lastUpdateTime.getTime() + API_POLLING_INTERVAL);
    return nextUpdate;
  };

  return {
    users: getSortedUsers(),
    nextUpdateTime: getNextUpdateTime(),
    formatTime,
    formatUpdateTime,
    getTotalStudyTime,
    targetStudyTime: TARGET_STUDY_TIME,
    showProgressBar: SHOW_PROGRESS_BAR,
    personalProgress: PERSONAL_STUDY_PROGRESS,
  };
};
