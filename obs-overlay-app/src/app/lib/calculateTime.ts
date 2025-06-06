import { StudyRecord, YouTubeChat } from '@/types/chat';

export const calculateStudyTime = (
  utcDate: Date,
  messages: YouTubeChat[]
): StudyRecord[] => {
  const studyRecordList: StudyRecord[] = [];

  for (const msg of messages) {
    const { displayName, publishedAt } = msg;

    studyRecordList.push({
      user: displayName,
      displayStudyTime: calcTimeDiff(utcDate, new Date(publishedAt)),
    });
  }
  return studyRecordList;
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
