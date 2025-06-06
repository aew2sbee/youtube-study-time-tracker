import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const VIDEO_ID = process.env.VIDEO_ID;

export async function GET() {
  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: YOUTUBE_API_KEY,
    });

    // 1) ライブ配信の動画情報から liveChatId を取得
    const videoRes = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [VIDEO_ID],
    });
    // console.log('Video response:', videoRes);
    const liveChatId =
      videoRes.data.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
    console.log('liveChatId:', liveChatId);

    if (!liveChatId) {
      return NextResponse.json(
        { error: 'Live chat ID not found' },
        { status: 404 }
      );
    }

    // 2) liveChatMessages.list でチャット取得
    const chatRes = await youtube.liveChatMessages.list({
      part: ['snippet', 'authorDetails'],
      liveChatId,
      maxResults: 200,
    });
    const items = chatRes.data.items;

    const extracted = items.map((item) => ({
      displayName: item.authorDetails.displayName,
      displayMessage: item.snippet.displayMessage,
      publishedAtJst: convertToJST(item.snippet.publishedAt),
    }));
    console.log('Chat response:', extracted);
    return NextResponse.json(extracted);
  } catch (error) {
    console.error('YouTube API error', error);
    return NextResponse.json(
      { error: 'Failed to fetch live chat' },
      { status: 500 }
    );
  }
}

/**
 * UTC日時文字列を日本標準時(JST)のDateオブジェクトに変換する
 * @param {string} utcString - UTC形式の日時文字列
 * @returns {Date} JSTの日時を表すDateオブジェクト
 */
const convertToJST = (utcString: string): Date => {
  const utcDate = new Date(utcString);
  const jstTimestamp = utcDate.getTime() + 9 * 60 * 60 * 1000;
  return new Date(jstTimestamp);
};
