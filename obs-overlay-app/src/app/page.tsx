'use client'; // Reactのクライアントコンポーネントとして動かす場合

import React, { useEffect, useState } from 'react';
import { calculateStudyTime } from './lib/formatChat';
import { saveJson } from './lib/saveChat';
import { readJson } from './lib/json';
import { fillterChatMessages, formatChatMessages } from './lib/format';

type ChatMessage = {
  displayName: string;
  displayMessage: string;
  publishedAt: string;
};

export default function Page() {
  const utcDate = new Date();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
          fillterChatMessages(res);
          formatChatMessages(res);
          saveJson(utcDate, res);
          readJson(utcDate).then((data) => {
            setMessages(data);
          });
        } else if (Array.isArray(res)) {
          setMessages(res.map((msg: any) => ({
            displayName: msg.displayName,
            displayMessage: msg.displayMessage,
            publishedAt: new Date(msg.publishedAtJst).toISOString(),
          })));
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
            <strong>{msg.displayName}</strong> [{new Date(msg.publishedAt).toLocaleTimeString('ja-JP')}]:{' '}
            {msg.displayMessage}
          </li>
        ))}
      </ul>
    </main>
  );
}
