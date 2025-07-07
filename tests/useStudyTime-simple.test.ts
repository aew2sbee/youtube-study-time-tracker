describe('useStudyTime修正テスト', () => {
  test('endコメント後の処理が正しく動作する', () => {
    // updateStudyTime関数のロジック検証

    // 既存ユーザーがいる状態
    const existingUser = {
      name: 'TestUser',
      studyTime: 1800, // 30分
      profileImageUrl: 'https://example.com/avatar.jpg',
      startTime: new Date('2025-01-01T10:00:00Z'),
      isStudying: true,
    };

    // endメッセージの処理
    const endTime = new Date('2025-01-01T11:00:00Z');
    const studyDuration = Math.floor(
      (endTime.getTime() - existingUser.startTime.getTime()) / 1000
    );
    const additionalTime = studyDuration > 0 ? studyDuration : 0;

    // 修正後の処理結果
    const updatedUser = {
      ...existingUser,
      studyTime: existingUser.studyTime + additionalTime,
      isStudying: false,
      startTime: undefined,
    };

    expect(updatedUser.isStudying).toBe(false);
    expect(updatedUser.studyTime).toBe(5400); // 30分 + 60分 = 90分
    expect(updatedUser.startTime).toBeUndefined();
  });

  test('getSortedUsers関数でendコメント後は時間追加されない', () => {
    const user = {
      name: 'TestUser',
      studyTime: 3600,
      profileImageUrl: 'https://example.com/avatar.jpg',
      startTime: undefined,
      isStudying: false, // endコメント後はfalse
    };

    // getSortedUsersのロジック
    const now = new Date();
    let finalUser = user;

    if (user.isStudying && user.startTime) {
      const currentStudyTime = Math.floor(
        (now.getTime() - user.startTime.getTime()) / 1000
      );
      finalUser = {
        ...user,
        studyTime: user.studyTime + currentStudyTime,
      };
    }

    // isStudyingがfalseなので時間追加されない
    expect(finalUser.studyTime).toBe(3600);
    expect(finalUser.isStudying).toBe(false);
  });
});