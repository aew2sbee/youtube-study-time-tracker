import { StudyRecord, YouTubeChat } from '@/types/chat';
import { MESSAGE } from '../constant/chat';

const NOT_FOUND = -1 as const;

export const calculateStudyTime = (
  utcDate: Date,
  messages: YouTubeChat[]
): StudyRecord[] => {
  const studyRecordList: StudyRecord[] = [];

  if (messages.length === 0) return studyRecordList;
  // messagesからユニークなdisplayNameを抽出する
  const uniqueUserList = getUniqueDisplayNames(messages);
  for (const user of uniqueUserList) {
    const startIndex = messages.findLastIndex(
      (msg) =>
        msg.displayName === user &&
        msg.displayMessage.toLowerCase() === MESSAGE.START
    );
    const endIndex = messages.findLastIndex(
      (msg) =>
        msg.displayName === user &&
        msg.displayMessage.toLowerCase() === MESSAGE.END
    );
    if (startIndex === NOT_FOUND || startIndex <= endIndex) {
      continue; // 開始または終了メッセージが見つからない、または順序が正しくない場合はスキップ
    }
    if (endIndex === NOT_FOUND) {
      studyRecordList.push({
        user: user,
        displayStudyTime: calcTimeDiff(
          new Date(messages[startIndex].publishedAt),
          utcDate
        ),
      });
      break;
    }
    if (startIndex >= endIndex) {
      studyRecordList.push({
        user: user,
        displayStudyTime: calcTimeDiff(
          new Date(messages[startIndex].publishedAt),
          new Date(messages[endIndex].publishedAt)
        ),
      });
      break;
    }
  }
  return studyRecordList;
};

const getUniqueDisplayNames = (messages: YouTubeChat[]): Set<string> => {
  const uniqueUserList = new Set<string>();

  for (const message of messages) {
    if (!uniqueUserList.has(message.displayName)) {
      uniqueUserList.add(message.displayName);
    }
  }

  return uniqueUserList;
};

// 現在時刻から時間を取得する
const calcTimeDiff = (startPublishedAt: Date, endPublishedAt: Date): string => {
  const diffMs = endPublishedAt.getTime() - startPublishedAt.getTime(); // 差分（ミリ秒）
  // ミリ秒から時間・分・秒に変換
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  return hours === 0 ? `${minutes}min` : `${hours}h ${minutes}min`;
};
