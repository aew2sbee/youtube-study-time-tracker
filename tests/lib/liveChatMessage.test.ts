import { isStartMessage, isEndMessage } from '@/lib/liveChatMessage';

describe('liveChatMessage utils', () => {
  describe('isStartMessage', () => {
    it('returns true for exact keyword', () => {
      expect(isStartMessage('start')).toBe(true);
    });

    it('is case-insensitive and trims spaces', () => {
      expect(isStartMessage(' START ')).toBe(true);
      expect(isStartMessage('Start')).toBe(true);
      expect(isStartMessage('START')).toBe(true);
    });

    it('returns false for non-matching or similar strings', () => {
      expect(isStartMessage('restart')).toBe(false);
      expect(isStartMessage('start!')).toBe(false);
      expect(isStartMessage('end')).toBe(false);
      expect(isStartMessage('')).toBe(false);
    });
  });

  describe('isEndMessage', () => {
    it('returns true for exact keyword', () => {
      expect(isEndMessage('end')).toBe(true);
    });

    it('is case-insensitive and trims spaces', () => {
      expect(isEndMessage(' END ')).toBe(true);
      expect(isEndMessage('End')).toBe(true);
      expect(isEndMessage('END')).toBe(true);
    });

    it('returns false for non-matching or similar strings', () => {
      expect(isEndMessage('ending')).toBe(false);
      expect(isEndMessage('the end')).toBe(false);
      expect(isEndMessage('start')).toBe(false);
      expect(isEndMessage('')).toBe(false);
    });
  });
});
