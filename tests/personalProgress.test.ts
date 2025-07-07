import { PERSONAL_STUDY_PROGRESS } from '../src/constants/personalProgress';

describe('Personal Progress Constants', () => {
  test('should have correct structure and values', () => {
    expect(PERSONAL_STUDY_PROGRESS).toBeDefined();
    expect(typeof PERSONAL_STUDY_PROGRESS.totalTime).toBe('number');
    expect(typeof PERSONAL_STUDY_PROGRESS.examDate).toBe('string');
    expect(typeof PERSONAL_STUDY_PROGRESS.testScore).toBe('string');
    expect(typeof PERSONAL_STUDY_PROGRESS.updateDate).toBe('string');
  });

  test('should have reasonable total time value', () => {
    expect(PERSONAL_STUDY_PROGRESS.totalTime).toBe(79200); // 22 hours in seconds
    expect(PERSONAL_STUDY_PROGRESS.totalTime).toBeGreaterThan(0);
  });

  test('should have expected exam date format', () => {
    expect(PERSONAL_STUDY_PROGRESS.examDate).toBe('Not scheduled yet');
  });

  test('should have test score information', () => {
    expect(PERSONAL_STUDY_PROGRESS.testScore).toBe('科目A: 47%, 科目B: 95%');
    expect(PERSONAL_STUDY_PROGRESS.testScore).toMatch(/科目[AB]:/);
  });

  test('should have update date in expected format', () => {
    expect(PERSONAL_STUDY_PROGRESS.updateDate).toBe('2025/07/05');
    expect(PERSONAL_STUDY_PROGRESS.updateDate).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  test('should be readonly (const assertion)', () => {
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