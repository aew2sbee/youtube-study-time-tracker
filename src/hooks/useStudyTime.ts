import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';
import { parameter } from '@/config/system';
import { calcTotalStudyTime } from '@/utils/calc';
import { buildApiUrl, createMessageId, createNewUser, handleExistingUser, isValidStudyMessage } from './utils';

export const useStudyTime = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(new Map());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [nextPageToken, setNextPageToken] = useState<string>('');
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const updateStudyTime = useCallback((messages: YouTubeLiveChatMessage[]) => {
    const now = new Date();

    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);

      messages.forEach((message) => {
        const messageText = message.displayMessage.toLowerCase().trim();

        if (!isValidStudyMessage(messageText)) return;

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
      if (isValidStudyMessage(messageText)) {
        const messageId = createMessageId(message, messageText);
        processedMessagesRef.current.add(messageId);
      }
    });
    setCurrentTime(now);
  }, []);


  const fetchLiveChatMessages = useCallback(async (): Promise<number> => {
    try {
      const url = buildApiUrl(nextPageToken);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('API error:', data.error);
        // レートリミットエラーの場合は長めの間隔で再試行
        if (data.error.includes('request was sent too soon') || data.error.includes('rate limit')) {
          return parameter.API_POLLING_INTERVAL * 2;
        }
        return parameter.API_POLLING_INTERVAL;
      }

      if (data.messages?.length > 0) {
        updateStudyTime(data.messages);
      }

      if (data.nextPageToken) {
        setNextPageToken(data.nextPageToken);
      }

      return parameter.API_POLLING_INTERVAL;
    } catch (error) {
      console.error('Error fetching live chat messages:', error);
      // HTTPエラーの場合も長めの間隔で再試行
      if (error instanceof Error && error.message.includes('403')) {
        return parameter.API_POLLING_INTERVAL * 3;
      }
      return parameter.API_POLLING_INTERVAL;
    }
  }, [updateStudyTime, nextPageToken]);

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

  const totalStudyTime = calcTotalStudyTime(Array.from(users.values()));

  return {
    currentTime,
    users,
    totalStudyTime,
  };
};

