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

  describe('removeMentionPrefix', () => {
    it('先頭に@が付いている場合は@を削除する', () => {
      expect(sut.removeMentionPrefix('@username')).toBe('username');
      expect(sut.removeMentionPrefix('@user123')).toBe('user123');
    });

    it('先頭に@が付いている場合は@のみを削除し、後続の文字列は保持する', () => {
      expect(sut.removeMentionPrefix('@username こんにちは')).toBe('username こんにちは');
      expect(sut.removeMentionPrefix('@user123 テストメッセージ')).toBe('user123 テストメッセージ');
    });

    it('先頭に@が付いていない場合はそのまま返す', () => {
      expect(sut.removeMentionPrefix('こんにちは')).toBe('こんにちは');
      expect(sut.removeMentionPrefix('start')).toBe('start');
      expect(sut.removeMentionPrefix('end')).toBe('end');
    });

    it('メッセージ途中の@は削除しない', () => {
      expect(sut.removeMentionPrefix('メール送信先は @test です')).toBe('メール送信先は @test です');
    });

    it('空文字列の場合はそのまま返す', () => {
      expect(sut.removeMentionPrefix('')).toBe('');
    });

    it('@だけの場合は空文字を返す', () => {
      expect(sut.removeMentionPrefix('@')).toBe('');
    });

    it('実際のYouTubeライブチャットのメンション形式を正しく処理する', () => {
      expect(sut.removeMentionPrefix('@がんばろ-e6z')).toBe('がんばろ-e6z');
      expect(sut.removeMentionPrefix('@aew2sbee')).toBe('aew2sbee');
    });
  });
});
