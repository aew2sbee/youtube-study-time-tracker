import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/users';
import { youtube_v3 } from 'googleapis';
import { calcTime, convertHHMMSS } from '@/lib/calcTime';
import { isCategoryMessage, isEndMessage, isStartMessage, REFRESH_MESSAGE, START_MESSAGE } from '@/server/lib/messages';
import { logger } from '@/server/lib/logger';
import { liveChatId, youtube, youtubeWithOAuth } from '@/server/lib/youtubeHelper';
import { parameter } from '@/config/system';
import { getStudyTimeStatsByChannelId } from '@/server/repositories/studyRepository';

// 公式ドキュメント：https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list?hl=ja

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

  if (!youtubeWithOAuth) {
    logger.error('OAuth2クライアントが初期化されていません');
    isProcessingQueue = false;
    return;
  }

  try {
    while (commentQueue.length > 0) {
      const item = commentQueue.shift();
      if (!item) break;

      try {
        logger.info(`${item.userName}のキューからコメント投稿を処理中`);

        await youtubeWithOAuth.liveChatMessages.insert({
          part: ['snippet'],
          requestBody: {
            snippet: {
              liveChatId: liveChatId,
              type: 'textMessageEvent',
              textMessageDetails: {
                messageText: item.message,
              },
            },
          },
        });

        logger.info(`${item.userName}のコメント投稿に成功しました`);
      } catch (error) {
        logger.error(`${item.userName}のコメント投稿に失敗しました - ${error}`);
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

    if (!liveChatId) return NextResponse.json({ error: 'No live chat found' }, { status: 404 });

    if (!youtube) {
      logger.error('YouTube APIクライアントが初期化されていません');
      return NextResponse.json({ error: 'YouTube API client not initialized' }, { status: 500 });
    }

    // レート制御：YouTubeの推奨間隔より早い呼び出しはキャッシュを返す
    const now = Date.now();
    if (0 < nextFetchAvailableAt && now < nextFetchAvailableAt) {
      logger.warn(`YouTube APIで指定されたミリ秒よりも短い間隔で呼び出されました - ${nextFetchAvailableAt - now} ms`);
      return NextResponse.json({ messages: [] });
    }

    const liveChatMessages = await youtube.liveChatMessages.list({
      liveChatId: liveChatId,
      part: ['snippet', 'authorDetails'],
      pageToken: nextPageToken || undefined,
      maxResults: 200,
    });

    const messages: youtube_v3.Schema$LiveChatMessage[] =
      liveChatMessages.data.items
        ?.filter((item) => {
          const displayMessage = item.snippet?.displayMessage || '';
          return isStartMessage(displayMessage) || isEndMessage(displayMessage) || isCategoryMessage(displayMessage);
        }) || [];

    nextPageToken = liveChatMessages.data.nextPageToken || undefined;

    // 次回フェッチ可能時刻を設定（YouTubeの推奨間隔）
    const pollingInterval = liveChatMessages.data.pollingIntervalMillis ?? 5000; // デフォルトは5秒
    nextFetchAvailableAt = Date.now() + pollingInterval;

    messages.forEach((message) => {
      logger.info(
        `message received - ${convertHHMMSS(message.snippet?.publishedAt || '')} ${message.authorDetails?.displayName} ${
          message.snippet?.displayMessage
        }`,
      );
    });

    return NextResponse.json({ messages });
  } catch (error) {
    logger.error(`ライブチャットメッセージの取得に失敗しました - ${error}`);
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
      message = `@${user.displayName}: ${START_MESSAGE}`;
      // リフレッシュ
    } else if (flag === parameter.REFRESH_FLAG) {
      message = `@${user.displayName}: ${REFRESH_MESSAGE}`;
      // 停止
    } else if (flag === parameter.END_FLAG) {
      const stats = await getStudyTimeStatsByChannelId(user.channelId);
      message = `@${user.displayName}さん お疲れ様でした👏 今日は${calcTime(user.timeSec)}集中しました!! これまでに合計${stats.totalDays}日間集中してなんと${calcTime(stats.totalTime)}も頑張りました!! ▶ 📅 過去7日間実績は、${stats.last7Days}日で${calcTime(stats.last7DaysTime)} 📆 過去28日間は、${stats.last28Days}日で${calcTime(stats.last28DaysTime)} この配信がお役に立ったなら、高評価をお願いします👍 また集中したい時は、ぜひ配信にお越しください。`;
    } else {
      logger.error(`flagが不正です - ${flag}`);
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!liveChatId) {
      return NextResponse.json({ error: 'No live chat found' }, { status: 404 });
    }

    logger.info(`コメント投稿を試行中: ${message}`);

    if (!parameter.IS_COMMENT_ENABLED) {
      logger.info('コメント投稿は無効化されています');
      return NextResponse.json({ success: true, message: 'Commenting is disabled' });
    }

    // コメントをキューに追加
    commentQueue.push({
      message,
      userName: user.displayName,
    });

    logger.info(`${user.displayName}のコメントをキューに追加しました。キューの長さ: ${commentQueue.length}`);

    // ワーカーを起動（既に動いている場合はスキップされる）
    processCommentQueue().catch((error) => {
      logger.error(`コメントキューワーカーでエラーが発生しました - ${error}`);
    });

    return NextResponse.json({
      success: true,
      message: message,
      queued: true,
    });
  } catch (error) {
    logger.error(`コメントの投稿に失敗しました - ${error}`);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
