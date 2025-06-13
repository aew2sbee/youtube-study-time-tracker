import { StudyRecord, YouTubeChat } from 'types/youtube'
import { MESSAGE } from '../constant/youtube'
import { logWithTimestamp } from './logger'

const NOT_FOUND = -1 as const

/**
 * YouTube チャットメッセージから"start" or "end"のみをフィルターする
 * @param {YouTubeChat[]} youTubeChat - YouTube チャットの配列
 * @returns {YouTubeChat[]} "start" or "end"のみYouTube チャットの配列
 */
export const fillterChatMessages = (youTubeChat: YouTubeChat[]): YouTubeChat[] => {
  const fillteredMessages = youTubeChat.filter(
    (item) => item.displayMessage.toLowerCase() === MESSAGE.START || item.displayMessage.toLowerCase() === MESSAGE.END
  )
  logWithTimestamp(`Filtered messages count: ${fillteredMessages.length}`)
  return fillteredMessages
}

/**
 * YouTubeチャットメッセージから勉強時間を計算する
 * @param {Date} utcDate - 現在時刻(UTC)
 * @param {YouTubeChat[]} messages - YouTube チャットの配列
 * @returns {StudyRecord[]} ユーザーごとの勉強時間の配列
 */
export const calculateStudyTime = (utcDate: Date, messages: YouTubeChat[]): StudyRecord[] => {
  const studyRecordList: StudyRecord[] = []

  if (messages.length === 0) {
    logWithTimestamp('No messages found in the YouTube chat.')
    return studyRecordList
  }
  // messagesからユニークなdisplayNameを抽出する
  const uniqueUserList = getUniqueDisplayNames(messages)
  console.log(messages)
  logWithTimestamp(`Unique users found: ${uniqueUserList.length}`)
  for (const user of uniqueUserList) {
    logWithTimestamp(`Calculating study time for user: ${user}`)
    const startIndex = messages.findLastIndex(
      (msg) => msg.displayName === user && msg.displayMessage.toLowerCase() === MESSAGE.START
    )
    const endIndex = messages.findLastIndex(
      (msg) => msg.displayName === user && msg.displayMessage.toLowerCase() === MESSAGE.END
    )
    console.log(user, startIndex, endIndex)
    if (startIndex === NOT_FOUND) {
      continue // 開始または終了メッセージが見つからない、または順序が正しくない場合はスキップ
    }
    if (endIndex === NOT_FOUND) {
      studyRecordList.push({
        user: user,
        displayStudyTime: calcTimeDiff(new Date(messages[startIndex].publishedAt), utcDate)
      })
      continue
    }
    studyRecordList.push({
      user: user,
      displayStudyTime: calcTimeDiff(
        new Date(messages[startIndex].publishedAt),
        new Date(messages[endIndex].publishedAt)
      )
    })
  }
  logWithTimestamp(`Calculated study records: ${studyRecordList.length}`)
  return studyRecordList
}

/**
 * Extracts unique display names from an array of YouTube chat messages.
 * @param {YouTubeChat[]} messages - Array of YouTube chat messages.
 * @returns {string[]} Array of unique display names.
 */
const getUniqueDisplayNames = (messages: YouTubeChat[]): string[] => {
  const uniqueUserList = new Set<string>()

  for (const message of messages) {
    if (!uniqueUserList.has(message.displayName)) {
      uniqueUserList.add(message.displayName)
    }
  }

  logWithTimestamp(`Unique display names extracted: ${uniqueUserList.size}`)
  return Array.from(uniqueUserList) // Convert Set to Array to avoid iteration issues
}

/**
 * Calculates the time difference between two dates and formats it as a string.
 * @param {Date} startPublishedAt - Start date.
 * @param {Date} endPublishedAt - End date.
 * @returns {string} Formatted time difference (e.g., "2h 30min").
 */
const calcTimeDiff = (startPublishedAt: Date, endPublishedAt: Date): string => {
  const diffMs = endPublishedAt.getTime() - startPublishedAt.getTime() // 差分（ミリ秒）
  // ミリ秒から時間・分・秒に変換
  const diffSec = Math.floor(diffMs / 1000)
  const hours = Math.floor(diffSec / 3600)
  const minutes = Math.floor((diffSec % 3600) / 60)
  return hours === 0 ? `${minutes}min` : `${hours}h ${minutes}min`
}
