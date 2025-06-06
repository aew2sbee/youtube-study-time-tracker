'use client'; // Reactのクライアントコンポーネントとして動かす場合

import React, { useEffect, useState } from 'react';
import { fillterChatMessages } from './lib/format';
import { calculateStudyTime } from './lib/calculateTime';
import { StudyRecord } from '@/types/chat';

export default function Page() {
  const utcDate = new Date();
  const [messages, setMessages] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveChat() {
      try {
        const res = await fetch('/api/youtube');
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        // 取得データが items 配列として来ている想定なら、
        // 必要なフィールドだけ抽出
        if (res) {
          // setMessages(calculateStudyTime(utcDate, res));
          const data = await res.json();
          const startOnlyMsg = fillterChatMessages(data);
          console.log('Fetched messages:', startOnlyMsg);
          const studyRecord = calculateStudyTime(utcDate, startOnlyMsg);
          setMessages(studyRecord);
        } else {
          setError('Invalid data format');
        }
      } catch (err: any) {
        setError(err.message || 'Fetch error');
      } finally {
        setLoading(false);
      }
    }

    fetchLiveChat();
  }, []);

  if (loading) return <p>Loading chat messages...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <h1>This Week Study Time Ranking</h1>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.user}</strong><p>{msg.displayStudyTime}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
