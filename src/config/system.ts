export const parameter = {
  START_STUDY_KEYWORDS: 'start',
  END_STUDY_KEYWORDS: 'end',
  IS_COMMENT_ENABLED: false,
  API_POLLING_INTERVAL: 1 * 60 * 1000, // 1分間隔
  CRON_TIME_SILVER: 30 * 60, // 30分（秒）
  CRON_TIME_GOLD: 1 * 60 * 60, // 1時間（秒）
  USERS_PER_PAGE: 10, // 1ページあたりのユーザー数
  TRANSITION_DURATION: 1 * 1000, // フェードトランジション時間（ミリ秒）
  PAGE_DISPLAY_INTERVAL: 30 * 1000, // ページ表示間隔（ミリ秒）
  REFRESH_INTERVAL_TIME: 1 * 60 * 60 + 1 * 50 * 60, // 1時間50分（秒）- リフレッシュメッセージのタイミング
  REFRESH_FLAG: 'refresh',
  END_FLAG: 'end',
  START_FLAG: 'start',
} as const;
