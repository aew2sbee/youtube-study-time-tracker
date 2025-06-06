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
        if (res) {
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

  if (loading) return <p className="text-center text-gray-500">Loading chat messages...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-4xl mx-auto bg-transparent shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Today's Study Time</h1>
        <h2 className="text-l font-bold text-white mb-4">(Real-Time Updates Every 30 Minutes)</h2>
        <ul className="space-y-4">
          {messages.map((msg, idx) => (
            <li
              key={idx}
              className="flex items-center gap-x-2 bg-transparent p-4 rounded-lg shadow-sm hover:bg-gray-100"
            >
              <div className="text-lg font-medium text-white">{msg.user}</div>
              <div className="text-sm text-white">{msg.displayStudyTime}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}