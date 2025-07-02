export interface YouTubeLiveChatMessage {
  id: string;
  authorDisplayName: string;
  displayMessage: string;
  publishedAt: string;
  profileImageUrl: string;
}

export interface StudyTimeUser {
  name: string;
  studyTime: number; // in seconds
  profileImageUrl: string;
  startTime?: Date;
  isStudying: boolean;
}

export interface LiveChatResponse {
  messages: YouTubeLiveChatMessage[];
  nextPageToken?: string;
  pollingIntervalMillis: number;
}