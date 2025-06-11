'use client'

import { useEffect, useState, useCallback } from 'react'
import { fillterChatMessages, calculateStudyTime } from '../lib/youtube'
import { StudyRecord } from 'types/youtube'

const YOUTUBE_API_INTERVAL = 15 * 60 * 1000 // 15 minutes
const DISPLAY_MESSAGES_INTERVAL = 5 * 1000 // 5 seconds

export default function Page() {
  const [record, setRecord] = useState<StudyRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiveChat = useCallback(async () => {
    const utcDate = new Date()
    try {
      const res = await fetch('/api/youtube')
      if (!res.ok) throw new Error(`Error: ${res.status}`)
      const data = await res.json()
      const fillteredMessages = fillterChatMessages(data)
      const studyRecord = calculateStudyTime(utcDate, fillteredMessages)
      setRecord(studyRecord)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLiveChat()

    const fetchInterval = setInterval(() => {
      fetchLiveChat()
    }, YOUTUBE_API_INTERVAL)

    const displayInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 3) % record.length)
    }, DISPLAY_MESSAGES_INTERVAL)

    return () => {
      clearInterval(fetchInterval)
      clearInterval(displayInterval)
    }
  }, [fetchLiveChat, record.length])

  if (loading) return <p className="text-center text-white">Loading chat messages...</p>
  if (error) return <p className="text-center text-red-500">Error: {error}</p>

  return (
    <main className="min-h-screen bg-transparent p-12">
      <div className="mx-auto bg-transparent p-6">
        <h1 className="font-bold text-white mb-4">Study Time for Today</h1>
        <ul className="space-y-1">
          {record.length === 0 ? (
            <li className="text-white">There are currently no participants.</li>
          ) : (
            record.slice(currentIndex, currentIndex + 3).map((msg, idx) => (
              <li key={idx} className="flex items-center gap-x-2 bg-transparent px-16">
                <div className="text-white pr-16">{msg.user}</div>
                <div className="font-medium text-white">{msg.displayStudyTime}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  )
}
