'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Event } from '@prisma/client';
import EventCard from '@/components/EventCard';
import LazyEventList from '@/components/LazyEventList';
import CalendarView from '@/components/CalendarView';
import { getCachedEvents } from '@/lib/cache';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // カテゴリをメモ化
  const categories = useMemo(() => {
    const cats = ['all', 'seminar', 'webinar', 'meetup', 'workshop', 'other'];
    const labels = {
      'all': 'すべて',
      'seminar': 'セミナー',
      'webinar': 'ウェビナー',
      'meetup': 'ミートアップ',
      'workshop': 'ワークショップ',
      'other': 'その他',
    };
    return cats.map(cat => ({ value: cat, label: labels[cat as keyof typeof labels] }));
  }, []);

  // フィルタリングされたイベントをメモ化
  const filteredEvents = useMemo(() => {
    // eventsが配列でない場合は空配列を使用
    const safeEvents = Array.isArray(events) ? events : [];
    
    if (selectedCategory === 'all') {
      return safeEvents;
    }
    return safeEvents.filter(event => event.type === selectedCategory);
  }, [events, selectedCategory]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('イベント取得開始');
        
        // テスト用：強制的にサンプルデータを表示
        console.log('テスト用：サンプルデータを強制表示');
        const sampleEvents: Event[] = [
          {
            id: 'sample-1',
            title: '会計士交流会',
            description: '会計士同士の情報交換とネットワーキング',
            startAt: new Date('2024-12-15T19:00:00+09:00'),
            endAt: new Date('2024-12-15T21:00:00+09:00'),
            type: 'meetup',
            organizer: '日本会計士協会',
            place: '東京会館',
            registerUrl: 'https://example.com',
            fee: 0,
            target: '会計士',
            imageUrl: 'https://via.placeholder.com/800x400/2563eb/ffffff?text=会計士交流会',
            prefecture: '東京都',
            status: 'published',
            maxParticipants: 50,
            location: '東京会館',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: null
          },
          {
            id: 'sample-2',
            title: 'FinTechセミナー',
            description: '最新のFinTechトレンドについて学ぶセミナー',
            startAt: new Date('2024-12-20T14:00:00+09:00'),
            endAt: new Date('2024-12-20T16:00:00+09:00'),
            type: 'seminar',
            organizer: 'FinTech協会',
            place: '東京国際フォーラム',
            registerUrl: 'https://example.com',
            fee: 5000,
            target: 'FinTech関係者',
            imageUrl: 'https://via.placeholder.com/800x400/10b981/ffffff?text=FinTechセミナー',
            prefecture: '東京都',
            status: 'published',
            maxParticipants: 100,
            location: '東京国際フォーラム',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: null
          },
          {
            id: 'sample-3',
            title: 'ブロックチェーン技術ワークショップ',
            description: 'ブロックチェーン技術の基礎から応用まで実践的に学べます',
            startAt: new Date('2024-12-25T10:00:00+09:00'),
            endAt: new Date('2024-12-25T17:00:00+09:00'),
            type: 'workshop',
            organizer: 'ブロックチェーン研究所',
            place: '大阪ビジネスパーク',
            registerUrl: 'https://example.com',
            fee: 8000,
            target: '開発者',
            imageUrl: 'https://via.placeholder.com/800x400/8b5cf6/ffffff?text=ブロックチェーン技術ワークショップ',
            prefecture: '大阪府',
            status: 'published',
            maxParticipants: 30,
            location: '大阪ビジネスパーク',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: null
          }
        ];
        console.log('サンプルイベントを設定:', sampleEvents.length);
        setEvents(sampleEvents);
        setError('テスト用：サンプルデータを表示しています。');
        setLoading(false);
        return;

        // 以下は一時的にコメントアウト
        /*
        const cachedEvents = await getCachedEvents();
        if (cachedEvents) {
          console.log('キャッシュからイベントを取得:', cachedEvents.length);
          setEvents(cachedEvents);
          setLoading(false);
          return;
        }

        console.log('APIからイベントを取得中...');
        const response = await fetch('/api/events');
        console.log('APIレスポンスステータス:', response.status);
        
        if (response.status === 503) {
          console.log('データベース接続エラー - サンプルデータを表示');
          // データベース接続エラーの場合、サンプルデータを表示
          const sampleEvents: Event[] = [
            {
              id: 'sample-1',
              title: '会計士交流会',
              description: '会計士同士の情報交換とネットワーキング',
              startAt: new Date('2024-12-15T19:00:00+09:00'),
              endAt: new Date('2024-12-15T21:00:00+09:00'),
              type: 'meetup',
              organizer: '日本会計士協会',
              place: '東京会館',
              registerUrl: 'https://example.com',
              fee: 0,
              target: '会計士',
              imageUrl: 'https://via.placeholder.com/800x400/2563eb/ffffff?text=会計士交流会',
              prefecture: '東京都',
              status: 'published',
              maxParticipants: 50,
              location: '東京会館',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: null
            },
            {
              id: 'sample-2',
              title: 'FinTechセミナー',
              description: '最新のFinTechトレンドについて学ぶセミナー',
              startAt: new Date('2024-12-20T14:00:00+09:00'),
              endAt: new Date('2024-12-20T16:00:00+09:00'),
              type: 'seminar',
              organizer: 'FinTech協会',
              place: '東京国際フォーラム',
              registerUrl: 'https://example.com',
              fee: 5000,
              target: 'FinTech関係者',
              imageUrl: 'https://via.placeholder.com/800x400/10b981/ffffff?text=FinTechセミナー',
              prefecture: '東京都',
              status: 'published',
              maxParticipants: 100,
              location: '東京国際フォーラム',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: null
            },
            {
              id: 'sample-3',
              title: 'ブロックチェーン技術ワークショップ',
              description: 'ブロックチェーン技術の基礎から応用まで実践的に学べます',
              startAt: new Date('2024-12-25T10:00:00+09:00'),
              endAt: new Date('2024-12-25T17:00:00+09:00'),
              type: 'workshop',
              organizer: 'ブロックチェーン研究所',
              place: '大阪ビジネスパーク',
              registerUrl: 'https://example.com',
              fee: 8000,
              target: '開発者',
              imageUrl: 'https://via.placeholder.com/800x400/8b5cf6/ffffff?text=ブロックチェーン技術ワークショップ',
              prefecture: '大阪府',
              status: 'published',
              maxParticipants: 30,
              location: '大阪ビジネスパーク',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: null
            }
          ];
          console.log('サンプルイベントを設定:', sampleEvents.length);
          setEvents(sampleEvents);
          setError('データベース接続が設定されていません。サンプルデータを表示しています。');
        } else if (response.ok) {
          const data = await response.json();
          console.log('APIレスポンス:', data);
          const events = data.events || data.data || [];
          console.log('取得したイベント数:', events.length);
          setEvents(events);
        } else {
          console.error('APIエラー:', response.status, response.statusText);
          throw new Error('イベントの取得に失敗しました');
        }
        */
      } catch (error) {
        console.error('イベント取得エラー:', error);
        setError('イベントの取得に失敗しました');
      } finally {
        console.log('ローディング完了');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const renderEvent = (event: Event) => (
    <EventCard key={event.id} event={event} />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">FinCal</h1>
              <span className="ml-2 text-sm text-gray-500">イベントカレンダー</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/favorites"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                お気に入り
              </a>
              <a
                href="/submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                イベント投稿
              </a>
              <a
                href="/admin"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                管理画面
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 説明書き */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            FinCal ― みんなでつくる、みんなのイベント表
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            誰でもサクッと投稿・シェアできるオープンカレンダーです。勉強会から交流会まで、最新の会計・ファイナンス系イベントがひと目でわかります。
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
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

        {/* 表示モード切り替え */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex bg-white rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              リスト表示
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              カレンダー表示
            </button>
          </div>
        </div>

        {/* イベント表示 */}
        {viewMode === 'list' ? (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          }>
            <LazyEventList
              events={filteredEvents}
              renderEvent={renderEvent}
            />
          </Suspense>
        ) : (
          <CalendarView events={filteredEvents} />
        )}
      </div>
    </div>
  );
} 