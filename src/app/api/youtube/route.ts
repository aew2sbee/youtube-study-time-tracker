import { NextRequest, NextResponse } from 'next/server';
import { YouTubeLiveChatMessage, LiveChatResponse } from '@/types/youtube';
import { User } from '@/types/users';
import { google } from 'googleapis';
import { calcTime, convertHHMMSS } from '@/lib/calcTime';
import { isCategoryMessage, isEndMessage, isStartMessage, REFRESH_MESSAGE, removeMentionPrefix, START_MESSAGE } from '@/lib/liveChatMessage';
import { logger } from '@/utils/logger';
import { getOAuth2Client } from '@/utils/googleClient';
import { parameter } from '@/config/system';
import { getStudyTimeStatsByChannelId } from '@/db/study';

// 公式ドキュメント：https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list?hl=ja

// このコードブロックはビルド時（npm run build）に一度だけ実行され、指定されたチャンネルの現在のライブ配信のvideoIdとliveChatIdを取得します。
const YOUTUBE = await google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
const response = await YOUTUBE.videos.list({ part: ['liveStreamingDetails'], id: [process.env.VIDEO_ID!.trim()] });
const video = response.data.items?.[0];
const LIVE_CHAT_ID = video?.liveStreamingDetails?.activeLiveChatId;
if (!LIVE_CHAT_ID) logger.error('LIVE_CHAT_IDが取得できませんでした。環境変数 VIDEO_ID の設定や配信中かを確認してください。');
logger.info(`liveChatId - ${LIVE_CHAT_ID}`);

// OAuth2クライアントの設定（初期化時は削除）
const oauth2Client = await getOAuth2Client();
const youtubeWithOAuth = google.youtube({ version: 'v3', auth: oauth2Client });

let nextPageToken: string | undefined;
// レート制御用：次回フェッチ可能な時刻（ms）
let nextFetchAvailableAt = 0;

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

// コメント投稿キュー管理
type CommentQueueItem = {
  message: string;
  userName: string;
};

const commentQueue: CommentQueueItem[] = [];
let isProcessingQueue = false;

// キューを処理するワーカー関数
async function processCommentQueue() {
  if (isProcessingQueue) return; // 既に処理中の場合はスキップ
  isProcessingQueue = true;

  try {
    while (commentQueue.length > 0) {
      const item = commentQueue.shift();
      if (!item) break;

      try {
        logger.info(`Processing queued comment for: ${item.userName}`);

        const result = await youtubeWithOAuth.liveChatMessages.insert({
          part: ['snippet'],
          requestBody: {
            snippet: {
              liveChatId: LIVE_CHAT_ID,
              type: 'textMessageEvent',
              textMessageDetails: {
                messageText: item.message,
              },
            },
          },
        });

        logger.info(`Comment posted successfully: ${item.userName}`);
      } catch (error) {
        logger.error(`Error posting comment for ${item.userName} - ${error}`);
      }

      // 次の投稿まで1秒待機（キューに残りがある場合のみ）
      if (commentQueue.length > 0) {
        await sleep(1000);
      }
    }
  } finally {
    isProcessingQueue = false;
  }
}

export async function GET() {
  try {
    logger.info(`nextPageToken - ${nextPageToken}`);

    if (!LIVE_CHAT_ID) return NextResponse.json({ error: 'No live chat found' }, { status: 404 });

    // レート制御：YouTubeの推奨間隔より早い呼び出しはキャッシュを返す
    const now = Date.now();
    if (0 < nextFetchAvailableAt && now < nextFetchAvailableAt) {
      logger.warn(`YouTube APIで指定されたミリ秒よりも短い間隔で呼び出されました - ${nextFetchAvailableAt - now} ms`);
      return NextResponse.json({ messages: [] } as LiveChatResponse);
    }

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
          return isStartMessage(displayMessage) || isEndMessage(displayMessage) || isCategoryMessage(displayMessage);
        })
        .map((item) => ({
          id: item.id || '',
          channelId: item.authorDetails?.channelId || '',
          authorDisplayName: removeMentionPrefix(item.authorDetails?.displayName || ''),
          displayMessage: item.snippet?.displayMessage || '',
          publishedAt: item.snippet?.publishedAt || '',
          profileImageUrl: item.authorDetails?.profileImageUrl || '',
        })) || [];

    nextPageToken = liveChatMessages.data.nextPageToken || undefined;

    // 次回フェッチ可能時刻を設定（YouTubeの推奨間隔）
    const pollingInterval = liveChatMessages.data.pollingIntervalMillis ?? 5000; // デフォルトは5秒
    nextFetchAvailableAt = Date.now() + pollingInterval;

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
    let message = '';
    const body = await request.json();
    const user: User = body.user;
    const flag: string = body.flag;

    // 開始
    if (flag === parameter.START_FLAG) {
      message = `@${user.name}: ${START_MESSAGE}`;
      // リフレッシュ
    } else if (flag === parameter.REFRESH_FLAG) {
      message = `@${user.name}: ${REFRESH_MESSAGE}`;
      // 停止
    } else if (flag === parameter.END_FLAG) {
      const stats = await getStudyTimeStatsByChannelId(user.channelId);
      message = `@${user.name}さん お疲れ様でした👏 今日は${calcTime(user.timeSec)}集中しました!! これまでに合計${stats.totalDays}日間集中してなんと${calcTime(stats.totalTime)}も頑張りました!! ▶ 📅 過去7日間実績は、${stats.last7Days}日で${calcTime(stats.last7DaysTime)} 📆 過去28日間は、${stats.last28Days}日で${calcTime(stats.last28DaysTime)}`;
    } else {
      logger.error(`flagが不正です - ${flag}`);
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!LIVE_CHAT_ID) {
      return NextResponse.json({ error: 'No live chat found' }, { status: 404 });
    }

    logger.info(`Attempting to post comment: ${message}`);

    if (!parameter.IS_COMMENT_ENABLED) {
      logger.info('コメント投稿は無効化されています');
      return NextResponse.json({ success: true, message: 'Commenting is disabled' });
    }

    // コメントをキューに追加
    commentQueue.push({
      message,
      userName: user.name,
    });

    logger.info(`Comment queued for ${user.name}. Queue length: ${commentQueue.length}`);

    // ワーカーを起動（既に動いている場合はスキップされる）
    processCommentQueue().catch((error) => {
      logger.error(`Error in comment queue worker - ${error}`);
    });

    return NextResponse.json({
      success: true,
      message: message,
      queued: true,
    });
  } catch (error) {
    logger.error(`Error posting comment - ${error}`);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
