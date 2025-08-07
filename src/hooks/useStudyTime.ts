import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyTimeUser, YouTubeLiveChatMessage } from '@/types/youtube';
import { parameter } from '@/config/system';
import { calcTotalStudyTime, calcUsersStudyTime } from '@/utils/calc';
import { buildApiUrl, createMessageId, createNewUser, handleExistingUser, isValidStudyMessage, isEndStudyMessage } from './utils';

export const useStudyTime = () => {
  const [users, setUsers] = useState<Map<string, StudyTimeUser>>(new Map());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentMonthTotalTime, setMonthTotalTime] = useState<number>(0);
  const [nextPageToken, setNextPageToken] = useState<string>('');
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // 月別合計時間を取得する関数
  const fetchMonthlyTime = useCallback(async () => {
    try {
      const response = await fetch('/api/get-monthly-time');
      if (response.ok) {
        const data = await response.json();
        setMonthTotalTime(data.currentMonthTotalTime);
      }
    } catch (error) {
      console.error('Error fetching monthly time:', error);
    }
  }, []);

  // 初期化時に月別合計時間を取得
  useEffect(() => {
    fetchMonthlyTime();
  }, [fetchMonthlyTime]);

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

        // endメッセージの場合、自動でお疲れ様コメントを送信
        if (isEndStudyMessage(messageText)) {
          sendPraiseComment(users);
        }
      }
    });
    setCurrentTime(now);
  }, [sendPraiseComment]);

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

  // データを保存する関数
  const saveData = useCallback(async () => {
    try {
      const response = await fetch('/api/save-lowdb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentTime,
          displayedUsers,
          totalStudyTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      // 保存後に月別合計時間を更新
      await fetchMonthlyTime();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [currentTime, displayedUsers, totalStudyTime, fetchMonthlyTime]);

  // データが更新されたときに保存
  useEffect(() => {
    if (displayedUsers.length > 0) {
      saveData();
    }
  }, [displayedUsers, saveData]);

  return {
    currentTime,
    displayedUsers,
    currentMonthTotalTime,
  };
};
