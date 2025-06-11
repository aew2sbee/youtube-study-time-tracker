import { logWithTimestamp } from 'lib/logger'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_ID = 'UCDV95uUZlqOmxJ0hONnoALw'

export async function GET() {
  try {
    logWithTimestamp('START: YouTube API request...')

    if (!YOUTUBE_API_KEY) {
      logWithTimestamp('Environment variables of youtube api key is not defined')
      return NextResponse.json({ error: 'Environment variables of youtube api key is not defined' }, { status: 401 })
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: YOUTUBE_API_KEY
    })

    logWithTimestamp('Fetching live broadcasts...')

    const searchRes = await youtube.search.list({
      part: ['snippet'],
      channelId: YOUTUBE_CHANNEL_ID,
      eventType: 'live',
      type: ['video'],
      maxResults: 1
    })

    const searchList = searchRes.data?.items ?? []

    if (searchList.length === 0) {
      logWithTimestamp('No live broadcasts found')
      return NextResponse.json({ error: 'No live broadcasts found' }, { status: 404 })
    }

    const VIDEO_ID = searchList[0]?.id?.videoId
    logWithTimestamp(`Found VIDEO_ID: ${VIDEO_ID}`)

    if (!VIDEO_ID) {
      logWithTimestamp('VIDEO_ID not found')
      return NextResponse.json({ error: 'VIDEO_ID not found' }, { status: 404 })
    }

    const videoRes = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [VIDEO_ID]
    })

    if (!videoRes.data.items || videoRes.data.items.length === 0) {
      logWithTimestamp('Video not found or not a live stream')
      return NextResponse.json({ error: 'Video not found or not a live stream' }, { status: 404 })
    }
    const liveChatId = videoRes.data.items?.[0]?.liveStreamingDetails?.activeLiveChatId
    logWithTimestamp(`Live chat ID: ${liveChatId}`)

    if (!liveChatId) {
      logWithTimestamp('Live chat ID not found')
      return NextResponse.json({}, { status: 204 })
    }

    logWithTimestamp('Fetching live chat messages...')
    const chatRes = await youtube.liveChatMessages.list({
      part: ['snippet', 'authorDetails'],
      liveChatId,
      maxResults: 200
    })

    if (!chatRes.data.items || chatRes.data.items.length === 0) {
      logWithTimestamp('No chat messages found')
      return NextResponse.json({ error: 'No chat messages found' }, { status: 404 })
    }

    const chatList = chatRes.data?.items ?? []

    const res = chatList.map((item) => ({
      displayName: item.authorDetails!.displayName,
      displayMessage: item.snippet!.displayMessage,
      publishedAt: item.snippet!.publishedAt
    }))
    logWithTimestamp(`Extracted ${res.length} chat messages`)

    return NextResponse.json(res)
  } catch (error: unknown) {
    if (error instanceof Error) {
      logWithTimestamp(`YouTube API error: ${error.message}`)
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      logWithTimestamp('YouTube API error: Unknown error')
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
    }
  } finally {
    logWithTimestamp('END: YouTube API request completed')
  }
}
