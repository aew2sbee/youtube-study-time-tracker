import { NextResponse } from 'next/server';
import { getCurrentMonthTotalTime } from '../../../../database/lowdb';

export async function GET() {
  try {
    const now = new Date();
    const currentMonthTotalTime = await getCurrentMonthTotalTime(now);

    return NextResponse.json({
      success: true,
      currentMonthTotalTime,
    });
  } catch (error) {
    console.error('Error getting monthly time:', error);
    return NextResponse.json({ error: 'Failed to get monthly time' }, { status: 500 });
  }
}
