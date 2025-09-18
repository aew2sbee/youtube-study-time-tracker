import { User } from "@/types/users";

export const SAMPLE_USER: User = {
  channelId: 'testChannelId',
  name: 'testUser',
  timeSec: 0,
  profileImageUrl: 'http://example.com/sampleProfileImageUrl.png',
  updateTime: new Date('2025-01-01T00:00:00.000Z'),
  isStudying: false,
  refreshInterval: 0,
} as const;

