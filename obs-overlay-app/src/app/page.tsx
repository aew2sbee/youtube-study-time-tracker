'use client'; // Reactのクライアントコンポーネントとして動かす場合

import React, { useEffect, useState } from 'react';
import { fillterChatMessages } from './lib/format';
import { calculateStudyTime } from './lib/calculateTime';
import { StudyRecord } from '@/types/chat';

export default function Page() {
  const utcDate = new Date();
  const [messages, setMessages] = useState<StudyRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0); // 現在の表示インデックス
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveChat = async () => {
    try {
      const res = await fetch('/api/youtube');
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      const startOnlyMsg = fillterChatMessages(data);
      console.log('Fetched messages:', startOnlyMsg);
      const studyRecord = calculateStudyTime(utcDate, startOnlyMsg);
      setMessages(studyRecord);
    } catch (err: any) {
      setError(err.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初回実行
    fetchLiveChat();

    // 30分ごとに実行
    const interval = setInterval(() => {
      fetchLiveChat();
    }, 15 * 60 * 1000); // 30分 = 30 * 60 * 1000 ミリ秒

    // クリーンアップ処理
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 10秒ごとに次の3件を表示
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 3) % messages.length);
    }, 3 * 1000); // 3秒 = 3 * 1000 ミリ秒

    // クリーンアップ処理
    return () => clearInterval(interval);
  }, [messages]);

  if (loading)
    return (
      <p className="text-center text-gray-500">Loading chat messages...</p>
    );
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="mx-auto bg-transparent shadow-md rounded-lg p-6">
        <h1 className="font-bold text-white mb-4">
          Today's Study Time
        </h1>
        {/* <h2 className="font-bold text-white mb-4">
          (Real-Time Updates Every 15 Minutes)
        </h2> */}
        <ul className="space-y-1">
          {messages.slice(currentIndex, currentIndex + 3).map((msg, idx) => (
            <li
              key={idx}
              className="flex items-center gap-x-2 bg-transparent p-16 rounded-lg shadow-sm"
            >
              <div className="text-white pr-16">{msg.user}</div>
              <div className="font-medium text-white">{msg.displayStudyTime}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
