import { YouTubeChat } from '@/types/chat';
import { MESSAGE } from '../constant/chat';



export const fillterChatMessages = (
  youTubeChat: YouTubeChat[]
): YouTubeChat[] => {
  const fillteredMessages = youTubeChat.filter(
    (item) =>
      item.displayMessage.toLowerCase() === MESSAGE.START ||
      item.displayMessage.toLowerCase() === MESSAGE.END
  );
  return fillteredMessages;
};
