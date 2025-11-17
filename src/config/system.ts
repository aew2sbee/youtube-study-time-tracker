export const parameter = {
  ALLOW_WORDS: ['仕事', '作業', '読書', '受験', '資格', '試験', '勉強', '宿題', 'テスト'] as readonly string[],
  START_STUDY_KEYWORDS: 'start',
  END_STUDY_KEYWORDS: 'end',
  IS_COMMENT_ENABLED: true, // YouTube コメント投稿の有効/無効
  IS_DATABASE_ENABLED: true, // データベース保存の有効/無効
  API_POLLING_INTERVAL: 1 * 60 * 1000, // 1分間隔
  USERS_PER_PAGE: 10, // 1ページあたりのユーザー数
  TRANSITION_DURATION: 1 * 1000, // フェードトランジション時間（ミリ秒）
  PAGE_DISPLAY_INTERVAL: 30 * 1000, // ページ表示間隔（ミリ秒）
  REFRESH_INTERVAL_TIME: (1 * 60 * 60) + (1 * 50 * 60), // 1時間50分（秒）- リフレッシュメッセージのタイミング
  REFRESH_FLAG: 'refresh',
  END_FLAG: 'end',
  START_FLAG: 'start',
} as const;
