'use client';

import { useState, useEffect } from 'react';
import { useFavorites } from '@/contexts/FavoriteContext';
import EventCard from '@/components/EventCard';
import { Event } from '@prisma/client';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteEvents = async () => {
      if (favorites.length === 0) {
        setFavoriteEvents([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          const events = data.events || [];
          // eventsが配列でない場合は空配列を使用
          const safeEvents = Array.isArray(events) ? events : [];
          // お気に入りに含まれるイベントのみをフィルタリング
          const filteredEvents = safeEvents.filter((event: Event) => 
            favorites.includes(event.id)
          );
          setFavoriteEvents(filteredEvents);
          console.log('お気に入りイベント:', filteredEvents.length, '件');
          console.log('お気に入りID:', favorites);
        } else {
          throw new Error('イベントの取得に失敗しました');
        }
      } catch (error) {
        console.error('お気に入りイベント取得エラー:', error);
        setError('お気に入りイベントの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteEvents();
  }, [favorites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            お気に入りイベント
          </h1>
          <p className="text-gray-600">
            {favoriteEvents.length}件のイベントがお気に入りに登録されています
          </p>
        </div>

        {/* イベント一覧 */}
        {favoriteEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              お気に入りイベントがありません
            </h3>
            <p className="text-gray-600 mb-6">
              イベントをお気に入りに登録すると、ここに表示されます
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              イベント一覧を見る
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 