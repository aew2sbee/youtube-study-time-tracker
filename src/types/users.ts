export interface User {
  channelId: string;
  name: string;
  timeSec: number;
  profileImageUrl: string;
  startTime: Date | undefined;
  isStudying: boolean;
}