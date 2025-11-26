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
  level: number;
  isMaxLevel: boolean;
  exp: number;
  maxHp: number;
  hp: number;
  progress: number;
  timeToNextLevel: number;
  nextLevelRequiredTime: number;
}
