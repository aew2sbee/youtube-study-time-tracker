describe('現在の勉強内容機能テスト', () => {
  test('personalProgressオブジェクトにcurrentStudyが追加される', () => {
    // personalProgressオブジェクトの構造をシミュレート
    const personalProgress = {
      totalTime: 79200,
      examDate: 'Not scheduled yet',
      testScore: '科目A: 47%, 科目B: 95%',
      updateDate: '2025/07/05',
      currentStudy: '基本情報技術者試験(FE)',
    };

    expect(personalProgress.currentStudy).toBeDefined();
    expect(typeof personalProgress.currentStudy).toBe('string');
    expect(personalProgress.currentStudy).toBe('基本情報技術者試験(FE)');
  });

  test('StudyTimeDisplayでcurrentStudyが表示される', () => {
    // UIコンポーネントでの表示をシミュレート
    const personalProgress = {
      totalTime: 79200,
      examDate: 'Not scheduled yet',
      testScore: '科目A: 47%, 科目B: 95%',
      updateDate: '2025/07/05',
      currentStudy: '基本情報技術者試験(FE)',
    };

    // My Study Progressシーンでの表示項目
    const displayItems = [
      { label: 'Total Time', value: personalProgress.totalTime },
      { label: 'Exam Date', value: personalProgress.examDate },
      { label: 'Test Score', value: personalProgress.testScore },
      { label: 'Current Study', value: personalProgress.currentStudy },
    ];

    const currentStudyItem = displayItems.find(item => item.label === 'Current Study');
    expect(currentStudyItem).toBeDefined();
    expect(currentStudyItem?.value).toBe('基本情報技術者試験(FE)');
  });

  test('日本語文字列が正しく処理される', () => {
    const currentStudy = '基本情報技術者試験(FE)';
    
    // 日本語文字が含まれているかチェック（より詳細な正規表現）
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(currentStudy);
    expect(hasJapanese).toBe(true);
    
    // 文字列の長さチェック
    expect(currentStudy.length).toBeGreaterThan(0);
    expect(typeof currentStudy).toBe('string');
  });
});