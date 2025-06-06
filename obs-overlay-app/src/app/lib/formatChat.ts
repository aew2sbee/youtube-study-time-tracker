import { YouTubeChat } from '@/types/chat';

type TimeRecord = {
  startTime: Date | undefined;
  endTime: Date | undefined;
}

type StudyRecord = {
  user: string; // ユーザー名
  displayStudyTime: string; // 勉強開始時間
  studyTimeSeconds: number; // 勉強終了時間
  timeRecord: TimeRecord[]; // 勉強終了時間
};

export const calculateStudyTime = (utcDate: Date, messages: YouTubeChat[]): StudyRecord[] => {
  const studyRecordList: StudyRecord[] = [];

  for (const msg of messages) {
    const { displayName, displayMessage, publishedAt } = msg;
    const lowerMessage = displayMessage.toLowerCase();

    if (lowerMessage.includes('study start')) {
      const existingRecord =
        studyRecordList.find((record) => record.user === displayName) ?? false;
      if (existingRecord) {
        existingRecord.displayStudyTime = lowerMessage
          .replace('study start', '')
          .trim();
        existingRecord.studyTimeSeconds = publishedAt;
      } else {
        studyRecordList.push({
          user: displayName,
          displayStudyTime: calcTimeDiff(utcDate, publishedAt),
          studyTimeSeconds: 0,
          timeRecord.push()
        });
      }
    }
    if (lowerMessage.includes('study end')) {
      const index = studyRecordList.findIndex(
        (record) => record.user === displayName
      );
      if (index !== -1) {
        studyRecordList[index].displayStudyTime = calcTimeDiff(utcDate, publishedAt);
        studyRecordList[index].studyTimeSeconds = calcTimeDiff(utcDate, publishedAt);
      }

      const studyRecord = studyRecordList.find(
        (record) => record.user === displayName
      );

      const lastStart = userSessions[displayName]?.pop(); // 最後のstartを取り出す
      if (lastStart) {
        const diffMs = publishedAt.getTime() - lastStart.getTime();
        const diffMin = Math.floor(diffMs / 1000 / 60);
      }
    }
  }
};

// 現在時刻から時間を取得する
const calcTimeDiff = (utcDate: Date, publishedAt: Date): string => {
  const diffMs = utcDate.getTime() - publishedAt.getTime(); // 差分（ミリ秒）
  // ミリ秒から時間・分・秒に変換
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  return `${hours}時間 ${minutes}分`;
};
