import { NextResponse } from 'next/server';
import { YouTubeLiveChatMessage, LiveChatResponse } from '@/types/youtube';
import { google } from 'googleapis';
import { isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { parameter } from '@/config/system';
import { convertHHMM } from '@/lib/clacTime';
import { logger } from '@/utils/logger';

// 公式ドキュメント：https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list?hl=ja
let nextPageToken: string | undefined;

export async function GET() {
  try {
    const { youtube, liveChatId } = await getYoutubeClientAndLiveChatId();
    logger.info(`liveChatId: ${liveChatId}`);
    logger.info(`nextPageToken: ${nextPageToken}`);

    if (!liveChatId) return NextResponse.json({ error: 'No live chat found' }, { status: 404 });

    const liveChatMessages = await youtube.liveChatMessages.list({
      liveChatId,
      part: ['snippet', 'authorDetails'],
      pageToken: nextPageToken || undefined,
      maxResults: 200,
    });

    const messages: YouTubeLiveChatMessage[] =
      liveChatMessages.data.items
        ?.filter((item) => {
          const displayMessage = item.snippet?.displayMessage || '';
          return isStartMessage(displayMessage) || isEndMessage(displayMessage);
        })
        .map((item) => ({
          id: item.id || '',
          channelId: item.authorDetails?.channelId || '',
          authorDisplayName: item.authorDetails?.displayName || '',
          displayMessage: item.snippet?.displayMessage || '',
          publishedAt: item.snippet?.publishedAt || '',
          profileImageUrl: item.authorDetails?.profileImageUrl || '',
        })) || [];

    nextPageToken = liveChatMessages.data.nextPageToken || undefined;

    messages.forEach((message) => {
      logger.info(`message received: ${convertHHMM(message.publishedAt)} ${message.authorDisplayName} ${message.displayMessage}`);
    });

    const result: LiveChatResponse = {
      messages,
      pollingIntervalMillis: liveChatMessages.data.pollingIntervalMillis || parameter.API_POLLING_INTERVAL,
    };

    return NextResponse.json(result);
  } catch (error) {
    logger.error(`Error fetching live chat messages: ${error}`);
    return NextResponse.json({ error: 'Failed to fetch live chat messages' }, { status: 500 });
  }
}

const getYoutubeClientAndLiveChatId = async () => {
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
  return { youtube, liveChatId };
};
