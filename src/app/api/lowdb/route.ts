import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/users';
import { saveJson, getUserData } from '@/utils/lowdb';

export async function POST(request: NextRequest) {
  try {
    const user: User = await request.json();
    await saveJson(user);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userData = await getUserData();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 });
  }
}