export const parameter = {
  START_STUDY_KEYWORDS: 'start',
  END_STUDY_KEYWORDS: 'end',
  API_POLLING_INTERVAL: 1 * 60 * 1000, // 1分間隔
  TARGET_STUDY_TIME: 550 * 60 * 60, // 目標勉強時間（秒:h * m + sec ）- 100時間
  SHOW_PROGRESS_BAR: true, // 進捗バーの表示/非表示
  CRON_TIME_SILVER: 30 * 60, // 30分（秒）
  CRON_TIME_GOLD: 1 * 60 * 60, // 1時間（秒）
  USERS_PER_PAGE: 3, // 1ページあたりのユーザー数
  TRANSITION_DURATION: 1 * 1000, // フェードトランジション時間（ミリ秒）
  PAGE_DISPLAY_INTERVAL: 10 * 1000, // ページ表示間隔（ミリ秒）
} as const;