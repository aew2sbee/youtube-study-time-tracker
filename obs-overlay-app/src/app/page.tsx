'use client'; // Reactのクライアントコンポーネントとして動かす場合

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fillterChatMessages } from './lib/format';
import { calculateStudyTime } from './lib/calculateTime';
import { StudyRecord } from '@/types/chat';

export default function Page() {
  const utcDate = useMemo(() => new Date(), []); // utcDate をメモ化
  const [record, setRecord] = useState<StudyRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0); // 現在の表示インデックス
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveChat = useCallback(async () => {
    try {
      const res = await fetch('/api/youtube');
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      const fillteredMessages = fillterChatMessages(data);
      const studyRecord = calculateStudyTime(utcDate, fillteredMessages);
      setRecord(studyRecord);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [utcDate]); // utcDate はメモ化されているため依存関係が安定

  useEffect(() => {
    // 初回実行
    fetchLiveChat();

    // タイマー設定
    const fetchInterval = setInterval(() => {
      fetchLiveChat();
    }, 15 * 60 * 1000); // 15分 = 15 * 60 * 1000 ミリ秒

    const displayInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 3) % record.length);
    }, 3 * 1000); // 3秒 = 3 * 1000 ミリ秒

    // クリーンアップ処理
    return () => {
      clearInterval(fetchInterval);
      clearInterval(displayInterval);
    };
  }, [fetchLiveChat, record.length]); // fetchLiveChat を依存関係に追加

  if (loading)
    return <p className="text-center text-white">Loading chat messages...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <main className="min-h-screen bg-transparent p-12">
      <div className="mx-auto bg-transparent p-6">
        <h1 className="font-bold text-white mb-4">Study Time for Today</h1>
        <ul className="space-y-1">
          {record.slice(currentIndex, currentIndex + 3).map((msg, idx) => (
            <li
              key={idx}
              className="flex items-center gap-x-2 bg-transparent p-16"
            >
              <div className="text-white pr-16">{msg.user}</div>
              <div className="font-medium text-white">
                {msg.displayStudyTime}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
