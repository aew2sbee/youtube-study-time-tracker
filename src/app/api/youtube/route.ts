import { NextRequest, NextResponse } from 'next/server';
import { YouTubeLiveChatMessage, LiveChatResponse } from '@/types/youtube';
import { google } from 'googleapis';
import { parameter } from '@/config/system';

// 公式ドキュメント：https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list?hl=ja

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken');

  try {
    const youtube = await google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });
    const response = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [process.env.VIDEO_ID!],
    });
    const video = response.data.items?.[0];
    const liveChatId = video?.liveStreamingDetails?.activeLiveChatId;
    if (!liveChatId) {
      return NextResponse.json({ error: 'No live chat found' }, { status: 404 });
    }

    const liveChatMessages = await youtube.liveChatMessages.list({
      liveChatId,
      part: ['snippet', 'authorDetails'],
      pageToken: pageToken || undefined,
    });

    const messages: YouTubeLiveChatMessage[] =
      liveChatMessages.data.items?.map((item) => ({
        id: item.id || '',
        channelId: item.authorDetails?.channelId || '',
        authorDisplayName: item.authorDetails?.displayName || '',
        displayMessage: item.snippet?.displayMessage || '',
        publishedAt: item.snippet?.publishedAt || '',
        profileImageUrl: item.authorDetails?.profileImageUrl || '',
      })) || [];

    const result: LiveChatResponse = {
      messages,
      nextPageToken: liveChatMessages.data.nextPageToken || undefined,
      pollingIntervalMillis: liveChatMessages.data.pollingIntervalMillis || parameter.API_POLLING_INTERVAL,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching live chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch live chat messages' }, { status: 500 });
  }
}
