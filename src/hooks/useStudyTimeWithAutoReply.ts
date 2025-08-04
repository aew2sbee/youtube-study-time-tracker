import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';
import { parameter } from '@/config/system';
import { calcTotalStudyTime, calcUsersStudyTime } from '@/utils/calc';
import { buildApiUrl, createMessageId, createNewUser, handleExistingUser, isValidStudyMessage } from './utils';
import { useStudyTimePersistence } from './useStudyTimePersistence';
import { sendEndStudyMessage } from '@/utils/liveChatSender';

export const useStudyTimeWithAutoReply = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(new Map());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [nextPageToken, setNextPageToken] = useState<string>('');
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const repliedUsersRef = useRef<Set<string>>(new Set());
  
  const { isLoaded, saveUsers, loadUsers } = useStudyTimePersistence();

  useEffect(() => {
    const initializeUsers = async () => {
      const savedUsers = await loadUsers();
      if (savedUsers.size > 0) {
        setUsers(savedUsers);
      }
    };
    initializeUsers();
  }, [loadUsers]);

  const handleEndMessage = useCallback(async (message: YouTubeLiveChatMessage) => {
    const userKey = `${message.authorDisplayName}_${new Date().toDateString()}`;
    
    // 同じ日に同じユーザーに対して既に返信済みかチェック
    if (repliedUsersRef.current.has(userKey)) {
      return;
    }

    try {
      const success = await sendEndStudyMessage(message.authorDisplayName);
      if (success) {
        repliedUsersRef.current.add(userKey);
        console.log(`Auto-reply sent to ${message.authorDisplayName}`);
      }
    } catch (error) {
      console.error('Failed to send auto-reply:', error);
    }
  }, []);

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

        // 'end'コメントの場合、自動返信を送信
        if (messageText === parameter.END_STUDY_KEYWORDS) {
          handleEndMessage(message);
        }
      });

      saveUsers(newUsers);
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
  }, [saveUsers, handleEndMessage]);

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
        return parameter.API_POLLING_INTERVAL;
      }

      if (data.messages && data.messages.length > 0) {
        updateStudyTime(data.messages);
      }

      if (data.nextPageToken) {
        setNextPageToken(data.nextPageToken);
      }

      return parameter.API_POLLING_INTERVAL;
    } catch (error) {
      console.error('Error fetching live chat messages:', error);
      return parameter.API_POLLING_INTERVAL;
    }
  }, [nextPageToken, updateStudyTime]);

  useEffect(() => {
    if (!isLoaded) return;

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const poll = async () => {
      if (!isMounted) return;

      const interval = await fetchLiveChatMessages();

      if (isMounted) {
        timeoutId = setTimeout(poll, interval);
      }
    };

    timeoutId = setTimeout(poll, 1000);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const displayedUsers = calcUsersStudyTime(currentTime, Array.from(users.values()));
  const totalStudyTime = calcTotalStudyTime(Array.from(users.values()));

  return {
    currentTime,
    displayedUsers,
    totalStudyTime,
    isLoaded,
  };
};