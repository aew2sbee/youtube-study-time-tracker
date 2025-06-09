import { logWithTimestamp } from 'app/lib/logger'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID

export async function GET() {
  try {
    logWithTimestamp('Starting YouTube API request...')

    if (!YOUTUBE_API_KEY) {
      logWithTimestamp('Environment variables of youtube api key is not defined')
      return NextResponse.json({ error: 'Environment variables of youtube api key is not defined' }, { status: 400 })
    }

    if (!YOUTUBE_CHANNEL_ID) {
      logWithTimestamp('Environment variables of youtube channel id is not defined')
      return NextResponse.json({ error: 'Environment variables of youtube channel id is not defined' }, { status: 400 })
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: YOUTUBE_API_KEY
    })

    logWithTimestamp('Fetching live broadcasts...')
    const searchRes = await youtube.search.list({
      part: 'id', // 修正: 配列ではなく文字列
      channelId: YOUTUBE_CHANNEL_ID, // 修正: 配列ではなく文字列
      eventType: 'live', // 修正: 配列ではなく文字列
      type: 'video', // 修正: 配列ではなく文字列
      maxResults: 1
    })
    logWithTimestamp(`Search response: ${JSON.stringify(searchRes.data)}`)

    if (!searchRes.data.items || searchRes.data.items.length === 0) {
      logWithTimestamp('No live broadcasts found')
      return NextResponse.json({ error: 'No live broadcasts found' }, { status: 404 })
    }

    const VIDEO_ID = searchRes.data.items[0].id?.videoId
    logWithTimestamp(`Found VIDEO_ID: ${VIDEO_ID}`)

    if (!VIDEO_ID) {
      logWithTimestamp('VIDEO_ID not found')
      return NextResponse.json({ error: 'VIDEO_ID not found' }, { status: 404 })
    }

    return NextResponse.json({ videoId: VIDEO_ID })
  } catch (error) {
    logWithTimestamp(`YouTube API error: ${error}`)
    return NextResponse.json({ error: 'Failed to fetch VIDEO_ID' }, { status: 500 })
  }
}