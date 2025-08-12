import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/users';
import { saveJson, getUserData } from '@/utils/lowdb';
import { logger } from '@/utils/logger';

export async function GET() {
  try {
    const users = await getUserData();
    return NextResponse.json(users);
  } catch (error) {
    logger.error(`Error fetching user data - ${error}`);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user: User = await request.json();
    logger.info(`API received user data - ${user.name} ${user.timeSec} seconds`);

    await saveJson(user);
    logger.info(`API successfully saved user data - ${user.name}`);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    logger.error(`Error saving user data - ${error}`);
    return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
  }
}