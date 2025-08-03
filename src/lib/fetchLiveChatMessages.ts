import { parameter } from '@/config/system'; // 必要に応じて定数の場所を調整
import { YouTubeLiveChatMessage } from '@/types/youtube';

export const fetchLiveChatMessages = async (
  nextPageToken: string,
  updateStudyTime: (messages: YouTubeLiveChatMessage[]) => void,
) => {
  try {
    const url = `/api/youtube${nextPageToken ? `?pageToken=${nextPageToken}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('API error:', data.error);
      return system.API_POLLING_INTERVAL;
    }

    if (data.messages && data.messages.length > 0) {
      updateStudyTime(data.messages);
    }

    if (data.nextPageToken) {
      // nextPageTokenの更新はuseStudyTime内で行うため、ここでは何もしない
    }

    return system.API_POLLING_INTERVAL;
  } catch (error) {
    console.error('Error fetching live chat messages:', error);
    return system.API_POLLING_INTERVAL;
  }
};
