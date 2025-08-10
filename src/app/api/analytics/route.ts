import { NextRequest, NextResponse } from 'next/server';
import { getOverallStats, getPopularEvents, getCategoryStats, getMonthlyStats } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'overall':
        const overallStats = await getOverallStats();
        return NextResponse.json(overallStats);

      case 'popular':
        const limit = parseInt(searchParams.get('limit') || '10');
        const popularEvents = await getPopularEvents(limit);
        return NextResponse.json(popularEvents);

      case 'category':
        const categoryStats = await getCategoryStats();
        return NextResponse.json(categoryStats);

      case 'monthly':
        const months = parseInt(searchParams.get('months') || '6');
        const monthlyStats = await getMonthlyStats(months);
        return NextResponse.json(monthlyStats);

      default:
        const stats = await getOverallStats();
        return NextResponse.json(stats);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
