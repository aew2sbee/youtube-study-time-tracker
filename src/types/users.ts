export interface User {
  channelId: string;
  name: string;
  timeSec: number;
  profileImageUrl: string;
  updateTime: Date;
  isStudying: boolean;
  refreshInterval: number;
  category: string;
}
