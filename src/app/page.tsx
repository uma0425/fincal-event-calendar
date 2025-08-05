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
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // イベントデータを取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/events');
        
        if (!response.ok) {
          if (response.status === 503) {
            // データベース接続エラーの場合、空の配列を設定
            setEvents([]);
            setError('データベース接続が設定されていません。サンプルデータを表示しています。');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          if (data.success) {
            setEvents(data.data || []);
          } else {
            setEvents([]);
            setError(data.error || 'イベントの取得に失敗しました');
          }
        }
      } catch (err) {
        console.error('イベント取得エラー:', err);
        setEvents([]);
        setError('イベントの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // カテゴリ（イベントタイプ）を取得
  const categories = useMemo(() => {
    if (!events || events.length === 0) return [];
    const types = [...new Set(events.map(event => event.type))];
    return types.map(type => ({
      value: type,
      label: type === 'seminar' ? 'セミナー' :
             type === 'webinar' ? 'ウェビナー' :
             type === 'meetup' ? 'ミートアップ' :
             type === 'workshop' ? 'ワークショップ' : 'その他'
    }));
  }, [events]);

  // フィルタリングされたイベント
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      const matchesType = !selectedType || event.type === selectedType;
      const matchesPrefecture = !selectedPrefecture || event.prefecture === selectedPrefecture;
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesPrefecture && matchesSearch;
    });
  }, [events, selectedType, selectedPrefecture, searchQuery]);

  // サンプルデータ（データベース接続エラー時用）
  const sampleEvents: Event[] = [
    {
      id: 'sample-1',
      title: 'FinTech セミナー 2024',
      description: '最新のFinTechトレンドについて学ぶセミナーです。',
      startAt: new Date('2024-12-15T10:00:00Z'),
      endAt: new Date('2024-12-15T12:00:00Z'),
      type: 'seminar',
      organizer: 'FinTech協会',
      place: '東京国際フォーラム',
      registerUrl: null,
      fee: 0,
      target: 'FinTech関係者',
      imageUrl: null,
      prefecture: '東京都',
      status: 'published',
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      maxParticipants: 100,
      location: '東京国際フォーラム'
    },
    {
      id: 'sample-2',
      title: 'ブロックチェーン技術ワークショップ',
      description: 'ブロックチェーン技術の基礎から応用まで実践的に学べます。',
      startAt: new Date('2024-12-20T14:00:00Z'),
      endAt: new Date('2024-12-20T17:00:00Z'),
      type: 'workshop',
      organizer: 'ブロックチェーン研究所',
      place: '大阪ビジネスパーク',
      registerUrl: null,
      fee: 5000,
      target: '開発者',
      imageUrl: null,
      prefecture: '大阪府',
      status: 'published',
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      maxParticipants: 30,
      location: '大阪ビジネスパーク'
    }
  ];

  // 表示するイベント（エラー時はサンプルデータ）
  const displayEvents = error && events.length === 0 ? sampleEvents : filteredEvents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">FinCal</div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">イベント</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">カレンダー</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">お気に入り</a>
                <a href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">管理者</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
              </button>
              <a href="/submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                イベント投稿
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 検索バー */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="イベントを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* カテゴリフィルター */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedType('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                すべて
              </button>
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedType(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === category.value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* イベントリスト */}
        <div className="space-y-8">
          {/* 人気のイベント */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">人気のイベント</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : displayEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayEvents.slice(0, 6).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">イベントが見つかりません</h3>
                <p className="mt-1 text-sm text-gray-500">検索条件を変更するか、新しいイベントを投稿してください。</p>
              </div>
            )}
          </section>

          {/* すべてのイベント */}
          {displayEvents.length > 6 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">すべてのイベント</h2>
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              }>
                <LazyEventList 
                  events={displayEvents.slice(6)} 
                  renderEvent={(event) => <EventCard key={event.id} event={event} />}
                />
              </Suspense>
            </section>
          )}
        </div>
      </main>
    </div>
  );
} 