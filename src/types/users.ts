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
  totalDays: number;
  totalSec: number;
  last7Days: number;
  last7DaysSec: number;
  last28Days: number;
  last28DaysSec: number;
}
