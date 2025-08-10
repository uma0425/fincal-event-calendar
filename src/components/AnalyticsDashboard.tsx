'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData } from '@/lib/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics?type=overall');
      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const getCategoryLabel = (type: string) => {
    const labels = {
      seminar: 'セミナー',
      webinar: 'ウェビナー',
      meetup: 'ミートアップ',
      workshop: 'ワークショップ',
      other: 'その他',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-6">統計ダッシュボード</h2>
      
      {/* 主要指標 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(analyticsData.totalEvents)}
          </div>
          <div className="text-sm text-gray-600">総イベント数</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(analyticsData.totalViews)}
          </div>
          <div className="text-sm text-gray-600">総閲覧数</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(analyticsData.totalFavorites)}
          </div>
          <div className="text-sm text-gray-600">総お気に入り数</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {formatNumber(analyticsData.newEvents)}
          </div>
          <div className="text-sm text-gray-600">今月の新規</div>
        </div>
      </div>

      {/* カテゴリ別統計 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別イベント数</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analyticsData.categoryStats).map(([type, count]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(count)}
              </div>
              <div className="text-sm text-gray-600">
                {getCategoryLabel(type)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 人気イベント */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">人気イベント TOP 5</h3>
        <div className="space-y-3">
          {analyticsData.popularEvents.slice(0, 5).map((event, index) => (
            <div key={event.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 line-clamp-1">
                    {event.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {event.organizer}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatNumber(event.viewCount)} 回閲覧
                </div>
                <div className="text-xs text-gray-600">
                  {formatNumber(event.favoriteCount)} お気に入り
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 月別統計 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">月別イベント数</h3>
        <div className="space-y-2">
          {analyticsData.monthlyStats.map((stat) => (
            <div key={stat.month} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900">
                {stat.month}
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(stat.events)} 件
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
