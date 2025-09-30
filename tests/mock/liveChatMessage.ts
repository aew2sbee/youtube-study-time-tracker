import { YouTubeLiveChatMessage } from "@/types/youtube";

export const SAMPLE_MESSAGE: YouTubeLiveChatMessage = {
  channelId: 'testChannelId001',
  authorDisplayName: 'testUser001',
  displayMessage: 'sample message',
  id: 'testMessageId',
  publishedAt: '2025-01-01T00:00:00.000Z',
  profileImageUrl: 'http://example.com/sampleProfileImageUrl.png',
} as const;
