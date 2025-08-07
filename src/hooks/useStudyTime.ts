import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';
import { parameter } from '@/config/system';
import { calcTotalStudyTime, calcUsersStudyTime } from '@/utils/calc';
import { createMessageId, createNewUser, handleExistingUser } from './utils';

export const useStudyTime = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(new Map());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const updateStudyTime = useCallback((messages: YouTubeLiveChatMessage[]) => {
    const now = new Date();

    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);

      messages.forEach((message) => {
        const messageText = message.displayMessage.toLowerCase().trim();

        const messageId = createMessageId(message, messageText);
        if (processedMessagesRef.current.has(messageId)) return;

        const existingUser = newUsers.get(message.authorDisplayName);

        if (existingUser) {
          const updatedUser = handleExistingUser(existingUser, message, messageText);
          newUsers.set(message.authorDisplayName, updatedUser);
        } else {
          const newUser = createNewUser(message, messageText);
          newUsers.set(message.authorDisplayName, newUser);
        }
      });

      return newUsers;
    });

    messages.forEach((message) => {
      const messageText = message.displayMessage.toLowerCase().trim();
      const messageId = createMessageId(message, messageText);
      processedMessagesRef.current.add(messageId);
    });
    setCurrentTime(now);
  }, []);

  const fetchLiveChatMessages = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch('/api/youtube');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('API error:', data.error);
        return parameter.API_POLLING_INTERVAL;
      }

      if (data.messages && data.messages.length > 0) {
        updateStudyTime(data.messages);
      }

      return parameter.API_POLLING_INTERVAL;
    } catch (error) {
      console.error('Error fetching live chat messages:', error);
      return parameter.API_POLLING_INTERVAL;
    }
  }, [updateStudyTime]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const poll = async () => {
      if (!isMounted) return;

      const interval = await fetchLiveChatMessages();

      if (isMounted) {
        timeoutId = setTimeout(poll, interval);
      }
    };

    // 初回実行を少し遅延させる
    timeoutId = setTimeout(poll, 1000);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayedUsers = calcUsersStudyTime(currentTime, Array.from(users.values()));
  const totalStudyTime = calcTotalStudyTime(Array.from(users.values()));

  return {
    currentTime,
    displayedUsers,
    totalStudyTime,
  };
};
