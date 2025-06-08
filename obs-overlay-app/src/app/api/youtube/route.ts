import { YouTubeChat } from '@/types/chat';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const VIDEO_ID = process.env.VIDEO_ID;

const logWithTimestamp = (message: string) =>
  console.log(`[${new Date().toISOString()}] ${message}`);

export async function GET() {
  try {
    logWithTimestamp('Starting YouTube API request...');
    const youtube = google.youtube({
      version: 'v3',
      auth: YOUTUBE_API_KEY,
    });

    logWithTimestamp('Fetching video details...');
    const videoRes = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [VIDEO_ID],
    });
    logWithTimestamp(`Video response: ${JSON.stringify(videoRes.data)}`);

    if (!videoRes.data.items || videoRes.data.items.length === 0) {
      logWithTimestamp('Video not found or not a live stream');
      return NextResponse.json(
        { error: 'Video not found or not a live stream' },
        { status: 404 }
      );
    }
    const liveChatId =
      videoRes.data.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
    logWithTimestamp(`Live chat ID: ${liveChatId}`);

    if (!liveChatId) {
      logWithTimestamp('Live chat ID not found');
      return NextResponse.json(
        { error: 'Live chat ID not found' },
        { status: 404 }
      );
    }

    logWithTimestamp('Fetching live chat messages...');
    const chatRes = await youtube.liveChatMessages.list({
      part: ['snippet', 'authorDetails'],
      liveChatId,
      maxResults: 200,
    });
    logWithTimestamp(`Chat response: ${JSON.stringify(chatRes.data)}`);

    if (!chatRes.data.items || chatRes.data.items.length === 0) {
      logWithTimestamp('No chat messages found');
      return NextResponse.json(
        { error: 'No chat messages found' },
        { status: 404 }
      );
    }
    const items = chatRes.data.items;

    const extracted: YouTubeChat[] = items.map((item) => ({
      displayName: item.authorDetails!.displayName,
      displayMessage: item.snippet!.displayMessage,
      publishedAt: item.snippet!.publishedAt,
    }));
    logWithTimestamp(`Extracted chat messages: ${JSON.stringify(extracted)}`);

    return NextResponse.json(extracted);
  } catch (error) {
    logWithTimestamp(`YouTube API error: ${error}`);
    return NextResponse.json(
      { error: 'Failed to fetch live chat' },
      { status: 500 }
    );
  }
}
