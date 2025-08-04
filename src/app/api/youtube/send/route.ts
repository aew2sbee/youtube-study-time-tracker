import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });

    // 配信の情報を取得してliveChatIdを取得
    const videoResponse = await youtube.videos.list({
      part: ['liveStreamingDetails'],
      id: [process.env.VIDEO_ID!],
    });

    const video = videoResponse.data.items?.[0];
    const liveChatId = video?.liveStreamingDetails?.activeLiveChatId;

    if (!liveChatId) {
      return NextResponse.json({ error: 'No active live chat found' }, { status: 404 });
    }

    // ライブチャットにメッセージを送信
    const insertResponse = await youtube.liveChatMessages.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          liveChatId,
          type: 'textMessageEvent',
          textMessageDetails: {
            messageText: message,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      messageId: insertResponse.data.id,
      message: 'Message sent successfully',
    });

  } catch (error) {
    console.error('Error sending live chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send live chat message' },
      { status: 500 }
    );
  }
}