import { isStartMessage, isEndMessage } from '@/lib/liveChatMessage';

// テスト観点
// - 完全一致で true
// - 大文字小文字の違いと前後スペースを無視して true
// - 部分一致や類似語は false、空文字は false
describe('liveChatMessage のユーティリティ', () => {
  describe('isStartMessage', () => {
    it('キーワードと完全一致なら true を返す', () => {
      expect(isStartMessage('start')).toBe(true);
    });

    it('大文字小文字を無視し、前後スペースをトリムして true を返す', () => {
      expect(isStartMessage(' START ')).toBe(true);
      expect(isStartMessage('Start')).toBe(true);
      expect(isStartMessage('START')).toBe(true);
    });

    it('一致しない文字列や類似語は false を返す', () => {
      expect(isStartMessage('restart')).toBe(false);
      expect(isStartMessage('start!')).toBe(false);
      expect(isStartMessage('end')).toBe(false);
      expect(isStartMessage('')).toBe(false);
    });
  });

  describe('isEndMessage', () => {
    it('キーワードと完全一致なら true を返す', () => {
      expect(isEndMessage('end')).toBe(true);
    });

    it('大文字小文字を無視し、前後スペースをトリムして true を返す', () => {
      expect(isEndMessage(' END ')).toBe(true);
      expect(isEndMessage('End')).toBe(true);
      expect(isEndMessage('END')).toBe(true);
    });

    it('一致しない文字列や類似語は false を返す', () => {
      expect(isEndMessage('ending')).toBe(false);
      expect(isEndMessage('the end')).toBe(false);
      expect(isEndMessage('start')).toBe(false);
      expect(isEndMessage('')).toBe(false);
    });
  });
});
