export interface YouTubeLiveChatMessage {
  id: string;
  channelId: string;
  authorDisplayName: string;
  displayMessage: string;
  publishedAt: string;
  profileImageUrl: string;
}

export interface LiveChatResponse {
  messages: YouTubeLiveChatMessage[];
}
