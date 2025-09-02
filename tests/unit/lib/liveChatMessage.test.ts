import * as sut from '@/lib/liveChatMessage';

// テスト観点
// - 完全一致で true
// - 大文字小文字の違いと前後スペースを無視して true
// - 部分一致や類似語は false、空文字は false
describe('liveChatMessage のユーティリティ', () => {
  describe('isStartMessage', () => {
    it('キーワードと完全一致なら true を返す', () => {
      expect(sut.isStartMessage('start')).toBe(true);
    });

    it('大文字小文字を無視し、前後スペースをトリムして true を返す', () => {
      expect(sut.isStartMessage(' START ')).toBe(true);
      expect(sut.isStartMessage('Start')).toBe(true);
      expect(sut.isStartMessage('START')).toBe(true);
    });

    it('一致しない文字列や類似語は false を返す', () => {
      expect(sut.isStartMessage('restart')).toBe(false);
      expect(sut.isStartMessage('start!')).toBe(false);
      expect(sut.isStartMessage('end')).toBe(false);
      expect(sut.isStartMessage('')).toBe(false);
    });
  });

  describe('isEndMessage', () => {
    it('キーワードと完全一致なら true を返す', () => {
      expect(sut.isEndMessage('end')).toBe(true);
    });

    it('大文字小文字を無視し、前後スペースをトリムして true を返す', () => {
      expect(sut.isEndMessage(' END ')).toBe(true);
      expect(sut.isEndMessage('End')).toBe(true);
      expect(sut.isEndMessage('END')).toBe(true);
    });

    it('一致しない文字列や類似語は false を返す', () => {
      expect(sut.isEndMessage('ending')).toBe(false);
      expect(sut.isEndMessage('the end')).toBe(false);
      expect(sut.isEndMessage('start')).toBe(false);
      expect(sut.isEndMessage('')).toBe(false);
    });
  });
});
