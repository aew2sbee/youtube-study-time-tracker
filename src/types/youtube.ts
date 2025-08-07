export interface YouTubeLiveChatMessage {
  id: string;
  channelId: string;
  authorDisplayName: string;
  displayMessage: string;
  publishedAt: string;
  profileImageUrl: string;
}

export interface StudyTimeUser {
  channelId: string;
  name: string;
  studyTime: number; // in seconds
  profileImageUrl: string;
  startTime?: Date;
  isStudying: boolean;
}

export interface LiveChatResponse {
  messages: YouTubeLiveChatMessage[];
  pollingIntervalMillis: number;
}