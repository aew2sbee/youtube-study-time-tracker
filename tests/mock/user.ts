import { User } from "@/types/users";

export const SAMPLE_USER_001: User = {
  channelId: 'testChannelId001',
  name: 'testUser001',
  timeSec: 0,
  profileImageUrl: 'http://example.com/sampleProfileImageUrl.png',
  updateTime: new Date('2025-01-01T00:00:00.000Z'),
  isStudying: false,
} as const;

export const SAMPLE_USER_002: User = {
  channelId: 'testChannelId002',
  name: 'testUser002',
  timeSec: 200,
  profileImageUrl: 'http://example.com/sampleProfileImageUrl.png',
  updateTime: new Date('2025-01-01T02:00:00.000Z'),
  isStudying: false,
} as const;

export const SAMPLE_USER_003: User = {
  channelId: 'testChannelId003',
  name: 'testUser',
  timeSec: 300,
  profileImageUrl: 'http://example.com/sampleProfileImageUrl.png',
  updateTime: new Date('2025-01-01T03:00:00.000Z'),
  isStudying: false,
} as const;

