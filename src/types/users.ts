export interface User {
  channelId: string;
  displayName: string;
  isChatSponsor:  boolean;
  profileImageUrl: string;
  timeSec: number;
  updateTime: Date;
  isStudying: boolean;
  refreshInterval: number;
  isGameMode: boolean;
  exp: number;
  level: number;
  isMaxLevel: boolean;
  hp: number;
  progress: number;
  timeToNextLevel: number;
  nextLevelRequiredTime: number;
}
