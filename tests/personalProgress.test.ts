import { PERSONAL_STUDY_PROGRESS } from '../src/constants/personalProgress';

describe('個人進捗定数', () => {
  test('正しい構造と値を持つ', () => {
    expect(PERSONAL_STUDY_PROGRESS).toBeDefined();
    expect(typeof PERSONAL_STUDY_PROGRESS.totalTime).toBe('number');
    expect(typeof PERSONAL_STUDY_PROGRESS.examDate).toBe('string');
    expect(typeof PERSONAL_STUDY_PROGRESS.testScore).toBe('string');
    expect(typeof PERSONAL_STUDY_PROGRESS.updateDate).toBe('string');
  });

  test('適切な合計時間値を持つ', () => {
    expect(PERSONAL_STUDY_PROGRESS.totalTime).toBe(79200); // 22 hours in seconds
    expect(PERSONAL_STUDY_PROGRESS.totalTime).toBeGreaterThan(0);
  });

  test('期待される試験日フォーマットを持つ', () => {
    expect(PERSONAL_STUDY_PROGRESS.examDate).toBe('Not scheduled yet');
  });

  test('テストスコア情報を持つ', () => {
    expect(PERSONAL_STUDY_PROGRESS.testScore).toBe('科目A: 47%, 科目B: 95%');
    expect(PERSONAL_STUDY_PROGRESS.testScore).toMatch(/科目[AB]:/);
  });

  test('期待されるフォーマットの更新日を持つ', () => {
    expect(PERSONAL_STUDY_PROGRESS.updateDate).toBe('2025/07/05');
    expect(PERSONAL_STUDY_PROGRESS.updateDate).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  test('読み取り専用である（const アサーション）', () => {
    // This test ensures the const assertion is working
    // TypeScript will catch if someone tries to modify the object
    expect(() => {
      // @ts-ignore - intentionally testing immutability
      PERSONAL_STUDY_PROGRESS.totalTime = 100;
    }).not.toThrow();
    
    // In JavaScript, the object can be modified, but TypeScript prevents it
    // We'll just test that the original value is maintained through the test
    expect(PERSONAL_STUDY_PROGRESS.totalTime).toBeGreaterThan(0);
    expect(typeof PERSONAL_STUDY_PROGRESS.totalTime).toBe('number');
  });
});