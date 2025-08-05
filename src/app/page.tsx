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
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* ロゴ */}
            <div className="flex items-center">
              <div className="text-blue-600 text-2xl font-bold">FinCal</div>
              <span className="ml-2 text-gray-600 text-sm">フィンランドのイベントカレンダー</span>
            </div>

            {/* ナビゲーション */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                ホーム
              </a>
              <a href="/calendar" className="text-gray-600 hover:text-blue-600 transition-colors">
                カレンダー
              </a>
              <a href="/favorites" className="text-gray-600 hover:text-blue-600 transition-colors">
                お気に入り
              </a>
            </nav>

            {/* アクションボタン */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/submit'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                イベント投稿
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索バー */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="イベントを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* カテゴリフィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>
        </div>

        {/* イベントセクション */}
        <div className="space-y-8">
          {/* 人気のイベント */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                人気のイベント
              </h2>
              <span className="text-gray-500 text-sm">
                {filteredEvents.length}件のイベント
              </span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">イベントが見つかりません</h3>
                <p className="text-gray-600 mb-4">
                  検索条件を変更するか、新しいイベントを投稿してください。
                </p>
                <button
                  onClick={() => window.location.href = '/submit'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  イベントを投稿
                </button>
              </div>
            ) : (
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
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
                  itemsPerPage={12}
                  threshold={200}
                />
              </Suspense>
            )}
          </section>
        </div>
      </main>
    </div>
  );
} 