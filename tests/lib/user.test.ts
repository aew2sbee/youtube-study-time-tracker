import * as sut from '@/lib/user';
import type { YouTubeLiveChatMessage } from '@/types/youtube';
import type { User } from '@/types/users';

// logger の副作用を抑止（呼び出し有無だけ確認できるように）
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('src/lib/user.ts のユーティリティ関数', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startTime', () => {
    it('メッセージから正しいユーザー情報を生成し、学習開始状態にする', () => {
      // 準備(Arrange)
      const testPublishedAt = '2025-01-01T00:00:00.000Z';
      const testMessage: YouTubeLiveChatMessage = {
        id: 'testId',
        channelId: 'testChannelId',
        authorDisplayName: 'testUser',
        displayMessage: 'start',
        publishedAt: testPublishedAt,
        profileImageUrl: 'http://example.com/sampleProfileImageUrl.png',
      } as const;

      // 実行(Act)
      const u = sut.startTime(testMessage);

      // 確認(Assert)
      expect(u.channelId).toBe(testMessage.channelId);
      expect(u.name).toBe(testMessage.authorDisplayName);
      expect(u.profileImageUrl).toBe(testMessage.profileImageUrl);
      expect(u.timeSec).toBe(0);
      expect(u.isStudying).toBe(true);
      expect(u.updateTime.getTime()).toBe(new Date(testPublishedAt).getTime());
    });
  });

  // describe('restartTime', () => {
  //   it('学習中フラグを true にし、updateTime を指定した開始時刻に更新する（timeSec は維持）', () => {
  //     const base: User = {
  //       channelId: 'ch_2',
  //       name: 'Hanako',
  //       timeSec: 120,
  //       profileImageUrl: '',
  //       updateTime: new Date('2025-01-01T00:00:00.000Z'),
  //       isStudying: false,
  //     };

  //     const newStart = new Date('2025-01-01T01:23:45.000Z');
  //     const u = sut.restartTime(base, newStart);

  //     expect(u.isStudying).toBe(true);
  //     expect(u.updateTime.getTime()).toBe(newStart.getTime());
  //     expect(u.timeSec).toBe(120);
  //   });
  // });

  // describe('stopTime', () => {
  //   it('updateTime がある場合は経過時間を加算して停止状態にする', () => {
  //     const start = new Date('2025-01-01T00:00:00.000Z');
  //     const end = new Date(start.getTime() + 90 * 1000); // 90 秒後
  //     const base: User = {
  //       channelId: 'ch_3',
  //       name: 'Jiro',
  //       timeSec: 10,
  //       profileImageUrl: '',
  //       updateTime: start,
  //       isStudying: true,
  //     };

  //     const u = stopTime(base, end);

  //     expect(u.isStudying).toBe(false);
  //     expect(u.updateTime.getTime()).toBe(end.getTime());
  //     expect(u.timeSec).toBe(10 + 90); // 90 秒加算
  //   });

  //   it('updateTime がない場合は変更せずに返す', () => {
  //     const base: User = {
  //       channelId: 'ch_4',
  //       name: 'Shiro',
  //       timeSec: 50,
  //       profileImageUrl: '',
  //       updateTime: undefined as unknown as Date,
  //       isStudying: true,
  //     };

  //     const end = new Date('2025-01-01T00:10:00.000Z');
  //     const u = stopTime(base, end);

  //     // 参照が同じ（そのまま返す）
  //     expect(u).toBe(base);
  //     expect(u.timeSec).toBe(50);
  //     expect(u.isStudying).toBe(true);
  //   });
  // });

  // describe('updateTime', () => {
  //   it('updateTime がある場合は経過時間を加算し、updateTime を現在時刻に更新する', () => {
  //     const prev = new Date('2025-01-01T00:00:00.000Z');
  //     const now = new Date(prev.getTime() + 30 * 1000); // 30 秒後
  //     const base: User = {
  //       channelId: 'ch_5',
  //       name: 'Miki',
  //       timeSec: 5,
  //       profileImageUrl: '',
  //       updateTime: prev,
  //       isStudying: true,
  //     };

  //     const u = updateTime(base, now);

  //     expect(u.updateTime.getTime()).toBe(now.getTime());
  //     expect(u.timeSec).toBe(5 + 30);
  //   });

  //   it('updateTime がない場合は変更せずに返す', () => {
  //     const base: User = {
  //       channelId: 'ch_6',
  //       name: 'Rika',
  //       timeSec: 40,
  //       profileImageUrl: '',
  //       updateTime: undefined as unknown as Date,
  //       isStudying: false,
  //     };

  //     const now = new Date('2025-01-01T00:05:00.000Z');
  //     const u = updateTime(base, now);

  //     expect(u).toBe(base);
  //     expect(u.timeSec).toBe(40);
  //   });
  // });
});
