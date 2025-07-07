import { YouTubeLiveChatMessage, StudyTimeUser, LiveChatResponse } from '../src/types/youtube';

describe('Type definitions', () => {
  test('YouTubeLiveChatMessage should have correct structure', () => {
    const message: YouTubeLiveChatMessage = {
      id: 'test-id',
      authorDisplayName: 'TestUser',
      displayMessage: 'Hello world',
      publishedAt: '2025-01-01T10:00:00Z',
      profileImageUrl: 'https://example.com/avatar.jpg',
    };

    expect(message.id).toBe('test-id');
    expect(message.authorDisplayName).toBe('TestUser');
    expect(message.displayMessage).toBe('Hello world');
    expect(message.publishedAt).toBe('2025-01-01T10:00:00Z');
    expect(message.profileImageUrl).toBe('https://example.com/avatar.jpg');
  });

  test('StudyTimeUser should have correct structure', () => {
    const user: StudyTimeUser = {
      name: 'TestUser',
      studyTime: 3600,
      profileImageUrl: 'https://example.com/avatar.jpg',
      startTime: new Date('2025-01-01T10:00:00Z'),
      isStudying: true,
    };

    expect(user.name).toBe('TestUser');
    expect(user.studyTime).toBe(3600);
    expect(user.profileImageUrl).toBe('https://example.com/avatar.jpg');
    expect(user.startTime).toBeInstanceOf(Date);
    expect(user.isStudying).toBe(true);
  });

  test('StudyTimeUser should work without optional fields', () => {
    const user: StudyTimeUser = {
      name: 'TestUser',
      studyTime: 0,
      profileImageUrl: 'https://example.com/avatar.jpg',
      isStudying: false,
    };

    expect(user.name).toBe('TestUser');
    expect(user.studyTime).toBe(0);
    expect(user.startTime).toBeUndefined();
    expect(user.isStudying).toBe(false);
  });

  test('LiveChatResponse should have correct structure', () => {
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

  test('LiveChatResponse should work without optional fields', () => {
    const response: LiveChatResponse = {
      messages: [],
      pollingIntervalMillis: 5000,
    };

    expect(response.messages).toHaveLength(0);
    expect(response.nextPageToken).toBeUndefined();
    expect(response.pollingIntervalMillis).toBe(5000);
  });
});