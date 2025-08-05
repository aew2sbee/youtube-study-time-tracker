import { NextRequest, NextResponse } from 'next/server';
import { savedb } from '../../../../database/lowdb';


export async function POST(request: NextRequest) {
  try {
    const { displayedUsers, totalStudyTime } = await request.json();
    // ファイルに書き込み
    const now = new Date();
    await savedb(now, displayedUsers, totalStudyTime);

    return NextResponse.json({ success: true, message: 'Data saved successfully' });

  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}