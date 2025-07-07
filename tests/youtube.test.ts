// Simple test for YouTube API types and basic structure
import { YouTubeLiveChatMessage, LiveChatResponse } from '../src/types/youtube';

describe('YouTube API 型', () => {
  test('正しいメッセージ構造を持つ', () => {
    const message: YouTubeLiveChatMessage = {
      id: 'test-id',
      authorDisplayName: 'TestUser',
      displayMessage: 'start studying',
      publishedAt: '2025-01-01T10:00:00Z',
      profileImageUrl: 'https://example.com/avatar.jpg',
    };

    expect(message.id).toBe('test-id');
    expect(message.authorDisplayName).toBe('TestUser');
    expect(message.displayMessage).toBe('start studying');
    expect(message.publishedAt).toBe('2025-01-01T10:00:00Z');
    expect(message.profileImageUrl).toBe('https://example.com/avatar.jpg');
  });

  test('正しいレスポンス構造を持つ', () => {
    const response: LiveChatResponse = {
      messages: [
        {
          id: 'msg1',
          authorDisplayName: 'User1',
          displayMessage: 'Hello',
          publishedAt: '2025-01-01T10:00:00Z',
          profileImageUrl: 'https://example.com/avatar1.jpg',
        },
      ],
      nextPageToken: 'token123',
      pollingIntervalMillis: 5000,
    };

    expect(response.messages).toHaveLength(1);
    expect(response.nextPageToken).toBe('token123');
    expect(response.pollingIntervalMillis).toBe(5000);
  });

  test('勉強キーワードを含むメッセージを処理する', () => {
    const startMessage: YouTubeLiveChatMessage = {
      id: 'start-msg',
      authorDisplayName: 'StudyUser',
      displayMessage: 'start studying now',
      publishedAt: '2025-01-01T10:00:00Z',
      profileImageUrl: 'https://example.com/avatar.jpg',
    };

    const endMessage: YouTubeLiveChatMessage = {
      id: 'end-msg',
      authorDisplayName: 'StudyUser',
      displayMessage: 'end studying',
      publishedAt: '2025-01-01T11:00:00Z',
      profileImageUrl: 'https://example.com/avatar.jpg',
    };

    expect(startMessage.displayMessage.toLowerCase()).toContain('start');
    expect(endMessage.displayMessage.toLowerCase()).toContain('end');
  });
});