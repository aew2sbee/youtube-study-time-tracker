import { NextRequest, NextResponse } from 'next/server';
import { YouTubeLiveChatMessage, LiveChatResponse } from '@/types/youtube';
import { User } from '@/types/users';
import { google } from 'googleapis';
import { CHAT_MESSAGE, isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { calcTimeJP, calcUserTotalTime, convertHHMMSS } from '@/lib/calcTime';
import { logger } from '@/utils/logger';
import { getUserData } from '@/utils/lowdb';
import { getOAuth2Client } from '@/utils/googleClient';

// 公式ドキュメント：https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list?hl=ja

const YOUTUBE = await google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
const response = await YOUTUBE.videos.list({ part: ['liveStreamingDetails'], id: [process.env.VIDEO_ID!] });
const video = response.data.items?.[0];
const LIVE_CHAT_ID = video?.liveStreamingDetails?.activeLiveChatId;
logger.info(`liveChatId - ${LIVE_CHAT_ID}`);

let nextPageToken: string | undefined;

export async function GET() {
  try {
    logger.info(`nextPageToken - ${nextPageToken}`);

    if (!LIVE_CHAT_ID) return NextResponse.json({ error: 'No live chat found' }, { status: 404 });

    const liveChatMessages = await YOUTUBE.liveChatMessages.list({
      liveChatId: LIVE_CHAT_ID,
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
      logger.info(
        `message received - ${convertHHMMSS(message.publishedAt)} ${message.authorDisplayName} ${
          message.displayMessage
        }`,
      );
    });

    const result: LiveChatResponse = { messages };

    return NextResponse.json(result);
  } catch (error) {
    logger.error(`Error fetching live chat messages - ${error}`);
    return NextResponse.json({ error: 'Failed to fetch live chat messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const oauth2Client = getOAuth2Client();
    // refresh_token から access_token を自動生成
    const tokens = await oauth2Client.getAccessToken();
    console.log("Generated access token:", tokens.token);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const user: User = await request.json();
    const userLog = await getUserData(user);
    const totalTimeSec = calcUserTotalTime(userLog);
    const message = `@${user.name} これまでの累計は${calcTimeJP(totalTimeSec)}でした👏 ` + CHAT_MESSAGE[Math.floor(Math.random() * CHAT_MESSAGE.length)];

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!LIVE_CHAT_ID) {
      return NextResponse.json({ error: 'No live chat found' }, { status: 404 });
    }

    logger.info(`Attempting to post comment: ${message}`);

    const result = await youtube.liveChatMessages.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          liveChatId: LIVE_CHAT_ID,
          type: 'textMessageEvent',
          textMessageDetails: {
            messageText: message,
          },
        },
      },
    });

    logger.info(`Comment posted successfully: ${message}`);

    return NextResponse.json({
      success: true,
      messageId: result.data.id,
      message: message
    });
  } catch (error) {
    logger.error(`Error posting comment - ${error}`);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
