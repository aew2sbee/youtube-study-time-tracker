import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/users';
import { logger } from '@/utils/logger';
import { saveLog } from '@/db/study';

export async function POST(request: NextRequest) {
  try {
    const user: User = await request.json();
    await saveLog(user);
    logger.info(`User data saved - ${user.name} ${user.timeSec} seconds`);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    logger.error(`Error saving user data - ${error}`);
    return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
  }
}
