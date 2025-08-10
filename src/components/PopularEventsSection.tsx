'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PopularEvent {
  id: string;
  title: string;
  viewCount: number;
  favoriteCount: number;
  shareCount: number;
  type: string;
  startAt: string;
  organizer: string;
}

interface PopularEventsSectionProps {
  className?: string;
}

export default function PopularEventsSection({ className = '' }: PopularEventsSectionProps) {
  const [popularEvents, setPopularEvents] = useState<PopularEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularEvents();
  }, []);

  const fetchPopularEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics?type=popular&limit=6');
      if (response.ok) {
        const data = await response.json();
        setPopularEvents(data);
      }
    } catch (error) {
      console.error('Error fetching popular events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      seminar: 'セミナー',
      webinar: 'ウェビナー',
      meetup: 'ミートアップ',
      workshop: 'ワークショップ',
      other: 'その他',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      seminar: 'bg-blue-100 text-blue-800',
      webinar: 'bg-purple-100 text-purple-800',
      meetup: 'bg-orange-100 text-orange-800',
      workshop: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('ja-JP', { month: 'short' }),
      day: date.getDate(),
      time: date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
  };

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🔥 人気イベント</h2>
            <p className="text-gray-600">多くの方に注目されているイベント</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (popularEvents.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🔥 人気イベント</h2>
          <p className="text-gray-600">多くの方に注目されているイベント</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularEvents.map((event, index) => {
            const formattedDate = formatDate(event.startAt);
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(event.type)}`}>
                        {getTypeLabel(event.type)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formattedDate.month} {formattedDate.day}日
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    {event.organizer}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span>👁️ {event.viewCount.toLocaleString()}</span>
                      <span>❤️ {event.favoriteCount.toLocaleString()}</span>
                      <span>📤 {event.shareCount.toLocaleString()}</span>
                    </div>
                    <span className="text-blue-600 font-medium">詳細を見る →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/popular"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            もっと見る
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
