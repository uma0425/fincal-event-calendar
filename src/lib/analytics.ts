import { PrismaClient, Event, EventType } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsData {
  totalEvents: number;
  totalViews: number;
  totalFavorites: number;
  totalShares: number;
  newEvents: number;
  activeUsers: number;
  categoryStats: {
    [key in EventType]: number;
  };
  popularEvents: Array<{
    id: string;
    title: string;
    viewCount: number;
    favoriteCount: number;
    shareCount: number;
  }>;
  monthlyStats: Array<{
    month: string;
    events: number;
    views: number;
    favorites: number;
  }>;
  popularKeywords: Array<{
    keyword: string;
    count: number;
  }>;
}

// イベント閲覧を記録
export async function recordEventView(eventId: string, userId?: string, ipAddress?: string, userAgent?: string) {
  try {
    // 閲覧履歴を記録
    await prisma.eventView.create({
      data: {
        eventId,
        userId,
        ipAddress,
        userAgent,
      },
    });

    // イベントの閲覧数を更新
    await prisma.event.update({
      where: { id: eventId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error recording event view:', error);
  }
}

// イベントお気に入り数を更新
export async function updateEventFavoriteCount(eventId: string, increment: boolean) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        favoriteCount: {
          increment: increment ? 1 : -1,
        },
      },
    });
  } catch (error) {
    console.error('Error updating favorite count:', error);
  }
}

// イベントシェア数を更新
export async function updateEventShareCount(eventId: string) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error updating share count:', error);
  }
}

// 人気イベントを取得
export async function getPopularEvents(limit: number = 10) {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'published',
      },
      select: {
        id: true,
        title: true,
        viewCount: true,
        favoriteCount: true,
        shareCount: true,
        type: true,
        startAt: true,
        organizer: true,
      },
      orderBy: [
        { viewCount: 'desc' },
        { favoriteCount: 'desc' },
        { shareCount: 'desc' },
      ],
      take: limit,
    });

    return events;
  } catch (error) {
    console.error('Error getting popular events:', error);
    return [];
  }
}

// 月別統計を取得
export async function getMonthlyStats(months: number = 6) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const stats = await prisma.event.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
        status: 'published',
      },
      _count: {
        id: true,
      },
    });

    // 月別に集計
    const monthlyData = new Map<string, number>();
    
    stats.forEach((stat) => {
      const month = stat.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyData.set(month, (monthlyData.get(month) || 0) + stat._count.id);
    });

    return Array.from(monthlyData.entries()).map(([month, count]) => ({
      month,
      events: count,
    }));
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    return [];
  }
}

// カテゴリ別統計を取得
export async function getCategoryStats() {
  try {
    const stats = await prisma.event.groupBy({
      by: ['type'],
      where: {
        status: 'published',
      },
      _count: {
        id: true,
      },
    });

    const categoryStats = {
      seminar: 0,
      webinar: 0,
      meetup: 0,
      workshop: 0,
      other: 0,
    };

    stats.forEach((stat) => {
      categoryStats[stat.type] = stat._count.id;
    });

    return categoryStats;
  } catch (error) {
    console.error('Error getting category stats:', error);
    return {
      seminar: 0,
      webinar: 0,
      meetup: 0,
      workshop: 0,
      other: 0,
    };
  }
}

// 総合統計を取得
export async function getOverallStats(): Promise<AnalyticsData> {
  try {
    const [
      totalEvents,
      totalViews,
      totalFavorites,
      totalShares,
      newEvents,
      popularEvents,
      monthlyStats,
      categoryStats,
    ] = await Promise.all([
      // 総イベント数
      prisma.event.count({
        where: { status: 'published' },
      }),
      // 総閲覧数
      prisma.event.aggregate({
        where: { status: 'published' },
        _sum: { viewCount: true },
      }),
      // 総お気に入り数
      prisma.event.aggregate({
        where: { status: 'published' },
        _sum: { favoriteCount: true },
      }),
      // 総シェア数
      prisma.event.aggregate({
        where: { status: 'published' },
        _sum: { shareCount: true },
      }),
      // 今月の新規イベント数
      prisma.event.count({
        where: {
          status: 'published',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // 人気イベント
      getPopularEvents(10),
      // 月別統計
      getMonthlyStats(6),
      // カテゴリ別統計
      getCategoryStats(),
    ]);

    return {
      totalEvents,
      totalViews: totalViews._sum.viewCount || 0,
      totalFavorites: totalFavorites._sum.favoriteCount || 0,
      totalShares: totalShares._sum.shareCount || 0,
      newEvents,
      activeUsers: 0, // TODO: 実装
      categoryStats,
      popularEvents,
      monthlyStats,
      popularKeywords: [], // TODO: 実装
    };
  } catch (error) {
    console.error('Error getting overall stats:', error);
    return {
      totalEvents: 0,
      totalViews: 0,
      totalFavorites: 0,
      totalShares: 0,
      newEvents: 0,
      activeUsers: 0,
      categoryStats: {
        seminar: 0,
        webinar: 0,
        meetup: 0,
        workshop: 0,
        other: 0,
      },
      popularEvents: [],
      monthlyStats: [],
      popularKeywords: [],
    };
  }
}

// キーワードを記録
export async function recordKeyword(keyword: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.popularKeyword.upsert({
      where: {
        keyword_date: {
          keyword,
          date: today,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        keyword,
        count: 1,
        date: today,
      },
    });
  } catch (error) {
    console.error('Error recording keyword:', error);
  }
}

// 人気キーワードを取得
export async function getPopularKeywords(limit: number = 10) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const keywords = await prisma.popularKeyword.findMany({
      where: {
        date: today,
      },
      orderBy: {
        count: 'desc',
      },
      take: limit,
    });

    return keywords.map((k) => ({
      keyword: k.keyword,
      count: k.count,
    }));
  } catch (error) {
    console.error('Error getting popular keywords:', error);
    return [];
  }
}
