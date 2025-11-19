import { google } from 'googleapis';
import { logger } from '@/server/lib/logger';
import { parameter } from '@/config/system';

const OAUTH_CALLBACK_URL = 'http://localhost:3000/api/oauth/callback';

/**
 * Build時に初期化されるLIVE_CHAT_ID
 */
export let LIVE_CHAT_ID = '';

/**
 * Build時に初期化されるYouTube APIクライアント（API KEY認証）
 */
export let YOUTUBE: ReturnType<typeof google.youtube> | null = null;

/**
 * Build時に初期化されるOAuth2クライアント
 */
export let oauth2Client: InstanceType<typeof google.auth.OAuth2> | null = null;

/**
 * Build時に初期化されるYouTube APIクライアント（OAuth認証）
 */
export let youtubeWithOAuth: ReturnType<typeof google.youtube> | null = null;

/**
 * YouTube API初期化関数
 * build時にVIDEO_IDからLIVE_CHAT_IDを取得し、OAuth2クライアントを初期化する
 */
const initYouTubeAPI = async (): Promise<void> => {
  try {
    // YouTube APIクライアントの初期化（API KEY認証）
    YOUTUBE = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });

    // LIVE_CHAT_IDの取得
    const response = await YOUTUBE.videos.list({
      part: ['liveStreamingDetails'],
      id: [process.env.VIDEO_ID!.trim()]
    });

    const video = response.data.items?.[0];
    LIVE_CHAT_ID = video?.liveStreamingDetails?.activeLiveChatId || '';

    if (!LIVE_CHAT_ID) {
      logger.error('LIVE_CHAT_IDが取得できませんでした。環境変数 VIDEO_ID の設定や配信中かを確認してください。');
    } else {
      logger.info(`LIVE_CHAT_ID - ${LIVE_CHAT_ID}`);
    }

    // OAuth2クライアントの初期化
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      OAUTH_CALLBACK_URL,
    );

    if (process.env.GOOGLE_REFRESH_TOKEN) {
      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }

    youtubeWithOAuth = google.youtube({ version: 'v3', auth: oauth2Client });
    logger.info('OAuth2クライアントの初期化が完了しました');
  } catch (error) {
    logger.error(`YouTube API初期化に失敗しました - ${error}`);
  }
};

// Build時に初期化を実行
await initYouTubeAPI();

/**
 * YouTubeライブチャットにコメントを投稿する
 * @param message - 投稿するメッセージ
 * @param userName - ユーザー名（ログ用）
 */
export const postYouTubeComment = async (
  message: string,
  userName: string
): Promise<void> => {
  if (!parameter.IS_COMMENT_ENABLED) {
    logger.info('コメント投稿は無効化されています');
    return;
  }

  if (!LIVE_CHAT_ID) {
    logger.error('Live Chat IDが設定されていません');
    return;
  }

  if (!youtubeWithOAuth) {
    logger.error('OAuth2クライアントが初期化されていません');
    return;
  }

  try {
    logger.info(`${userName}のコメント投稿を試行中: ${message}`);

    await youtubeWithOAuth.liveChatMessages.insert({
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

    logger.info(`${userName}のコメント投稿に成功しました`);
  } catch (error) {
    logger.error(`${userName}のコメント投稿に失敗しました - ${error}`);
    throw error;
  }
};