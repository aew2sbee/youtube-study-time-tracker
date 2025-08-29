import { NextRequest, NextResponse } from 'next/server';
import { YouTubeLiveChatMessage, LiveChatResponse } from '@/types/youtube';
import { User } from '@/types/users';
import { google } from 'googleapis';
import { CHAT_MESSAGE, isEndMessage, isStartMessage } from '@/lib/liveChatMessage';
import { calcTimeJP, convertHHMMSS } from '@/lib/calcTime';
import { logger } from '@/utils/logger';
import { getTotalTimeSec } from '@/db/user';
import { getOAuth2Client } from '@/utils/googleClient';

// 公式ドキュメント：https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list?hl=ja

// このコードブロックはビルド時（npm run build）に一度だけ実行され、指定されたチャンネルの現在のライブ配信のvideoIdとliveChatIdを取得します。
const YOUTUBE = await google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
const channel = await YOUTUBE.search.list({part: ['id'], channelId: process.env.CHANNEL_ID, eventType: 'live', type: ['video'], maxResults: 1});
// 環境変数 VIDEO_ID があればそれを使用。なければ従来どおりチャンネルのライブ検索結果から取得
const videoId = (process.env.VIDEO_ID?.trim() || channel.data.items![0].id!.videoId) as string;
logger.info(`videoId - ${videoId}`);
const response = await YOUTUBE.videos.list({ part: ['liveStreamingDetails'], id: [videoId] });
const video = response.data.items?.[0];
const LIVE_CHAT_ID = video?.liveStreamingDetails?.activeLiveChatId;
logger.info(`liveChatId - ${LIVE_CHAT_ID}`);

// OAuth2クライアントの設定（初期化時は削除）
const oauth2Client = await getOAuth2Client();
const youtubeWithOAuth = google.youtube({ version: 'v3', auth: oauth2Client });

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
    const user: User = await request.json();
    const totalTimeSec = await getTotalTimeSec(user.channelId);
    const message = `@${user.name}: 累計は${calcTimeJP(totalTimeSec)}👏 ` + CHAT_MESSAGE[Math.floor(Math.random() * CHAT_MESSAGE.length)];

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!LIVE_CHAT_ID) {
      return NextResponse.json({ error: 'No live chat found' }, { status: 404 });
    }

    logger.info(`Attempting to post comment: ${message}`);

    const result = await youtubeWithOAuth.liveChatMessages.insert({
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
