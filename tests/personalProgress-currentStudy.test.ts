import { PERSONAL_STUDY_PROGRESS } from '../src/constants/personalProgress';

describe('個人進捗定数 - 現在の勉強内容追加テスト', () => {
  test('currentStudyプロパティが存在する', () => {
    expect(PERSONAL_STUDY_PROGRESS.currentStudy).toBeDefined();
    expect(typeof PERSONAL_STUDY_PROGRESS.currentStudy).toBe('string');
  });

  test('currentStudyに適切な値が設定されている', () => {
    expect(PERSONAL_STUDY_PROGRESS.currentStudy).toBe('基本情報技術者試験(FE)');
    expect(PERSONAL_STUDY_PROGRESS.currentStudy.length).toBeGreaterThan(0);
  });

  test('全ての必要なプロパティが存在する', () => {
    expect(PERSONAL_STUDY_PROGRESS).toHaveProperty('totalTime');
    expect(PERSONAL_STUDY_PROGRESS).toHaveProperty('examDate');
    expect(PERSONAL_STUDY_PROGRESS).toHaveProperty('testScore');
    expect(PERSONAL_STUDY_PROGRESS).toHaveProperty('updateDate');
    expect(PERSONAL_STUDY_PROGRESS).toHaveProperty('currentStudy');
  });

  test('currentStudyが日本語文字列である', () => {
    // 日本語文字が含まれているかチェック
    const hasJapanese = /[ひらがなカタカナ漢字]/.test(PERSONAL_STUDY_PROGRESS.currentStudy);
    expect(hasJapanese).toBe(true);
  });
});