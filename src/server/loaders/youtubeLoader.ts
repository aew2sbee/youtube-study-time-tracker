import { youtube_v3 } from 'googleapis';
import { youtube, liveChatId } from '@/server/lib/youtubeHelper';
import { logger } from '@/server/lib/logger';

/**
 * YouTubeライブチャットメッセージを取得する（Loader - 副作用なし）
 * @returns ライブチャットメッセージ一覧
 */
export const getLiveChatMessages = async (): Promise<youtube_v3.Schema$LiveChatMessage[]> => {
  if (!liveChatId) {
    logger.warn('liveChatIdが設定されていません');
    return [];
  }

  if (!youtube) {
    logger.error('YouTube APIクライアントが初期化されていません');
    return [];
  }

  try {
    const messages = await getLiveChatMessages();

    logger.info(`getLiveChatMessages: ${messages.length}件のメッセージを取得しました`);
    return messages;
  } catch (error) {
    logger.error(`ライブチャットメッセージの取得に失敗しました - ${error}`);
    return [];
  }
};
