import { google, youtube_v3 } from 'googleapis';
import { logger } from '@/server/lib/logger';
import { isAllowMessage } from './messages';
import { LiveChatMessage } from '@/types/youtube';

const OAUTH_CALLBACK_URL = 'http://localhost:3000/api/oauth/callback';

/**
 * Build時に初期化される
 * - ライブ配信のビデオID
 * - ライブ配信のチャットID
 * - YouTube APIクライアント（API KEY認証）
 * - OAuth2クライアント
 * - YouTube APIクライアント（OAuth認証）
 * - nextPageToken
 */
export const videoId: string = process.env.VIDEO_ID!.trim();
export let liveChatId: string = '';
export let nextPageToken: string = '';
export let youtube: ReturnType<typeof google.youtube> | null = null;
export let oauth2Client: InstanceType<typeof google.auth.OAuth2> | null = null;
export let youtubeWithOAuth: ReturnType<typeof google.youtube> | null = null;

/**
 * YouTube API初期化関数
 * build時にVIDEO_IDからliveChatIdを取得し、OAuth2クライアントを初期化する
 */
const initYouTubeAPI = async (): Promise<void> => {
  try {
    // VIDEO_IDのチェック
    if (!videoId) {
      logger.error('VIDEO_IDが設定されていません。環境変数 VIDEO_ID を確認してください。');
      return;
    }

    // YouTube APIクライアントの初期化（API KEY認証）
    youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });

    // liveChatIdの取得
    const response = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    liveChatId = video?.liveStreamingDetails?.activeLiveChatId || '';

    if (!liveChatId) {
      logger.error('liveChatIdが取得できませんでした。環境変数 VIDEO_ID の設定や配信中かを確認してください。');
    } else {
      logger.info(`liveChatId - ${liveChatId}`);
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

/**
 * YouTubeライブチャットにコメントを投稿する
 * @param message - 投稿するメッセージ
 * @param userName - ユーザー名（ログ用）
 */
export const postYouTubeComment = async (message: string, userName: string): Promise<void> => {
  if (!liveChatId) {
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
          liveChatId: liveChatId,
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

/**
 * YouTubeライブチャットメッセージを取得する（元のメッセージ含む）
 * @returns 元のメッセージと変換後のメッセージのペア
 */
export const getLiveChatMessages = async (): Promise<LiveChatMessage[]> => {
  if (!liveChatId) {
    logger.warn('liveChatIdが設定されていません');
    return [];
  }

  if (!youtube) {
    logger.error('YouTube APIクライアントが初期化されていません');
    return [];
  }

  try {
    const liveChatMessages = await youtube.liveChatMessages.list({
      liveChatId: liveChatId,
      part: ['snippet', 'authorDetails'],
      pageToken: nextPageToken || undefined,
      maxResults: 200,
    });

    // nextPageTokenを更新
    nextPageToken = liveChatMessages.data.nextPageToken || '';

    const messages: youtube_v3.Schema$LiveChatMessage[] =
      liveChatMessages.data.items?.filter((item) => isAllowMessage(item.snippet?.displayMessage || '')) || [];

    const result: LiveChatMessage[] = messages.map((item) => ({
      channelId: item.authorDetails?.channelId || '',
      displayName: removeMentionPrefix(item.authorDetails?.displayName || ''),
      profileImageUrl: item.authorDetails?.profileImageUrl || '',
      displayMessage: item.snippet?.displayMessage || '',
      isChatSponsor: item.authorDetails?.isChatSponsor || false,
      publishedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : new Date(),
    }));

    logger.info(`${messages.length}件のメッセージを取得しました`);
    return result;
  } catch (error) {
    logger.error(`ライブチャットメッセージの取得に失敗しました - ${error}`);
    return [];
  }
};

/**
 * メッセージの先頭に付与されている@を削除します。
 * @param {string} displayName - 処理するメッセージテキスト
 * @returns {string} @が削除されたメッセージ
 * @example
 * removeMentionPrefix('@username') // => 'username'
 */
const removeMentionPrefix = (displayName: string): string =>
  displayName.startsWith('@') ? displayName.slice(1) : displayName;

// Build時に初期化を実行
await initYouTubeAPI();
