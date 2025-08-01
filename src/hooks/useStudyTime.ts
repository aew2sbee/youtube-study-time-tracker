import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';
import { PERSONAL_STUDY_PROGRESS } from '@/constants/personalProgress';
import { ADDITIONAL_STUDY_TIME, TARGET_STUDY_TIME, SHOW_PROGRESS_BAR } from '@/constants/config';
import { calcStudyDuration } from '@/utils/calc';
import { isEndStudyMessage, isStartStudyMessage } from '@/utils/message';

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
        if (!isStartStudyMessage(messageText) && !isEndStudyMessage(messageText)) return;

        // 処理済みメッセージをスキップ
        const messageId = `${message.authorDisplayName}-${message.publishedAt}-${messageText}`;
        if (processedMessagesRef.current.has(messageId)) return;

        const existingUser = newUsers.get(message.authorDisplayName);
        const currentTime = new Date(message.publishedAt);

        if (existingUser) {
          if (isStartStudyMessage(messageText)) {
            // 勉強開始
            if (!existingUser.isStudying) {
              newUsers.set(message.authorDisplayName, {
                ...existingUser,
                startTime: currentTime,
                isStudying: true,
              });
            }
          } else if (isEndStudyMessage(messageText)) {
            // 勉強終了
            if (existingUser.isStudying && existingUser.startTime) {
              const studyDuration = calcStudyDuration(currentTime, existingUser.startTime);
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
          const isStarting = isStartStudyMessage(messageText);
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
    messages.forEach((message) => {
      const messageText = message.displayMessage.toLowerCase().trim();
      if (isStartStudyMessage(messageText) || isEndStudyMessage(messageText)) {
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
