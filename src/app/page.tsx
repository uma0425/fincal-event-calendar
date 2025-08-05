'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Event } from '@prisma/client';
import EventCard from '@/components/EventCard';
import LazyEventList from '@/components/LazyEventList';
import { getCachedEvents } from '@/lib/cache';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // カテゴリリストをメモ化
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(events.map(event => event.type)));
    return ['all', ...uniqueCategories];
  }, [events]);

  // フィルタリングされたイベントをメモ化
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = selectedCategory === 'all' || event.type === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchTerm]);

  // イベントデータを取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getCachedEvents();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError('イベントの取得に失敗しました');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // イベントカードのレンダリング関数
  const renderEvent = (event: Event) => (
    <EventCard
      key={event.id}
      event={event}
      onClick={() => {
        // イベント詳細ページへの遷移
        window.location.href = `/events/${event.id}`;
      }}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">イベントを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">FinCal</h1>
              <p className="text-gray-600">フィンランドのイベントカレンダー</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/submit'}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                イベント投稿
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルター */}
        <div className="mb-8 space-y-4">
          {/* 検索バー */}
          <div className="relative">
            <input
              type="text"
              placeholder="イベントを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* カテゴリフィルター */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>
        </div>

        {/* イベントリスト */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {filteredEvents.length}件のイベント
            </h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">イベントが見つかりません</h3>
              <p className="text-gray-600">
                検索条件を変更するか、新しいイベントを投稿してください。
              </p>
            </div>
          ) : (
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            }>
              <LazyEventList
                events={filteredEvents}
                renderEvent={renderEvent}
                itemsPerPage={9}
                threshold={200}
              />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
} 