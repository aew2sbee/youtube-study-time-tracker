export interface User {
  channelId: string;
  name: string;
  studyTime: number; // in seconds
  profileImageUrl: string;
  startTime: Date | undefined;
  isStudying: boolean;
}