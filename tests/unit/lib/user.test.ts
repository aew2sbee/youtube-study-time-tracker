import * as sut from '@/lib/user';
import { SAMPLE_USER } from '../../mock/user';
import { SAMPLE_MESSAGE } from '../../mock/liveChatMessage';

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
      const expectedValue = {
        ...SAMPLE_USER,
        isStudying: true,
        timeSec: 0,
      };

      // 実行(Act)
      const result = sut.startTime(SAMPLE_MESSAGE);

      // 確認(Assert)
      expect(result).toEqual(expectedValue);
    });
  });
  describe('stopTime', () => {
    it('計測を停止するユーザーがある場合は経過時間を加算して停止状態にする', () => {
      // 準備(Arrange)
      const beforeUser = SAMPLE_USER;
      const endTime = new Date(SAMPLE_USER.updateTime.getTime() + 100 * 1000); // 100 秒後
      const expectedValue = { ...SAMPLE_USER, isStudying: false, timeSec: 100, updateTime: endTime };

      // 実行(Act)
      const result = sut.stopTime(beforeUser, endTime);

      // 確認(Assert)
      expect(result).toEqual(expectedValue);
    });
  });

  describe('restartTime', () => {
    it('学習中フラグを true にし、updateTime を指定した開始時刻に更新する（timeSec は維持）', () => {
      // 準備(Arrange)
      const restartTime = new Date('2025-01-01T01:23:45.000Z');
      const beforeUser = { ...SAMPLE_USER, isStudying: false, timeSec: 100 }; // 停止中、100 秒経過
      const expectedValue = { ...SAMPLE_USER, isStudying: true, timeSec: 100, updateTime: restartTime };

      // 実行(Act)
      const result = sut.restartTime(beforeUser, restartTime);

      // 確認(Assert)
      expect(result).toEqual(expectedValue);
    });
  });
  describe('updateTime', () => {
    it('updateTime を現在時刻に更新する', () => {
      // 準備(Arrange)
      const currentTime = new Date('2025-01-01T00:01:00.000Z');
      const beforeUser = { ...SAMPLE_USER, isStudying: true, timeSec: 100 };
      const expectedValue = {
        ...beforeUser,
        isStudying: true,
        timeSec: 160,
        updateTime: currentTime,
        refreshInterval: 60,
      };

      // 実行(Act)
      const result = sut.updateTime(beforeUser, currentTime);

      // 確認(Assert)
      expect(result).toEqual(expectedValue);
    });
  });
  describe('resetRefresh', () => {
    it('refreshInterval を 0 にリセットする', () => {
      // 準備(Arrange)
      const beforeUser = { ...SAMPLE_USER, refreshInterval: 300 };
      const expectedValue = { ...beforeUser, refreshInterval: 0 };

      // 実行(Act)
      const result = sut.resetRefresh(beforeUser);

      // 確認(Assert)
      expect(result).toEqual(expectedValue);
    });
  });
});
