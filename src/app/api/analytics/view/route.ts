import { NextRequest, NextResponse } from 'next/server';
import { recordEventView } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const { eventId, userId, ipAddress, userAgent } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'イベントIDが必要です' },
        { status: 400 }
      );
    }

    await recordEventView(eventId, userId, ipAddress, userAgent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event view recording error:', error);
    return NextResponse.json(
      { error: '閲覧記録に失敗しました' },
      { status: 500 }
    );
  }
}
