export interface User {
  channelId: string;
  displayName: string;
  isChatSponsor:  boolean;
  profileImageUrl: string;
  timeSec: number;
  updateTime: Date;
  isStudying: boolean;
  refreshInterval: number;
  category: string;
  isGameMode: boolean;
  level: number;
  isMaxLevel: boolean;
  exp: number;
  progress: number;
  timeToNextLevel: number;
  nextLevelRequiredTime: number;
}
