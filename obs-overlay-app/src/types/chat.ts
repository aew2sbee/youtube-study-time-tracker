export type YouTubeChat = {
  displayName: string;
  displayMessage: string;
  publishedAt: Date;
};

export type StudyRecord = {
  [userName: string]: {
    start: Date | null; // ISO 8601形式のタイムスタンプ
    end: Date | null;
  };
};