import { NextRequest, NextResponse } from 'next/server';
import { YouTubeLiveChatMessage, LiveChatResponse } from '@/types/youtube';

// Dynamic import to ensure googleapis is only loaded on server side
const getYoutube = async () => {
  const { google } = await import('googleapis');
  return google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });
};


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get('pageToken');
  
  try {
    const youtube = await getYoutube();
    const liveChatId = await getLiveChatId();
    if (!liveChatId) {
      return NextResponse.json({ error: 'No live chat found' }, { status: 404 });
    }

    const response = await youtube.liveChatMessages.list({
      liveChatId,
      part: ['snippet', 'authorDetails'],
      pageToken: pageToken || undefined,
    });

    const messages: YouTubeLiveChatMessage[] = response.data.items?.map((item) => ({
      id: item.id || '',
      authorDisplayName: item.authorDetails?.displayName || '',
      displayMessage: item.snippet?.displayMessage || '',
      publishedAt: item.snippet?.publishedAt || '',
      profileImageUrl: item.authorDetails?.profileImageUrl || '',
    })) || [];

    const result: LiveChatResponse = {
      messages,
      nextPageToken: response.data.nextPageToken || undefined,
      pollingIntervalMillis: response.data.pollingIntervalMillis || 5000,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching live chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch live chat messages' }, { status: 500 });
  }
}

async function getLiveChatId() {
  try {
    const youtube = await getYoutube();
    const response = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [process.env.VIDEO_ID!],
    });

    const video = response.data.items?.[0];
    return video?.liveStreamingDetails?.activeLiveChatId;
  } catch (error) {
    console.error('Error getting live chat ID:', error);
    return null;
  }
}