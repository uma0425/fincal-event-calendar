'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { Event } from '@prisma/client';
import Link from 'next/link';
import LazyEventList from '@/components/LazyEventList';
import CalendarView from '@/components/CalendarView';
import { getCachedEvents } from '@/lib/cache';
import { LoadingPage, SkeletonList } from '@/components/LoadingStates';
import { validateSearchQuery } from '@/lib/validation';
import { useNotification } from '@/components/NotificationSystem';
import MobileMenu from '@/components/MobileMenu';
import Logo from '@/components/Logo';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { warning } = useNotification();

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

  // 日付範囲オプション
  const dateRanges = useMemo(() => [
    { value: 'all', label: 'すべて' },
    { value: 'today', label: '今日' },
    { value: 'week', label: '今週' },
    { value: 'month', label: '今月' },
    { value: 'next-month', label: '来月' },
  ], []);

  // 都道府県オプション
  const prefectures = useMemo(() => [
    { value: 'all', label: 'すべて' },
    { value: '13', label: '東京都' },
    { value: '27', label: '大阪府' },
    { value: '23', label: '愛知県' },
    { value: '14', label: '神奈川県' },
    { value: '11', label: '埼玉県' },
    { value: '12', label: '千葉県' },
    { value: '28', label: '兵庫県' },
    { value: '22', label: '静岡県' },
    { value: '15', label: '新潟県' },
  ], []);

  // 検索クエリの検証
  const searchValidation = useMemo(() => {
    if (searchQuery) {
      return validateSearchQuery(searchQuery)
    }
    return { isValid: true, errors: [] }
  }, [searchQuery])

  // 検索クエリに問題がある場合は警告を表示
  useEffect(() => {
    if (!searchValidation.isValid) {
      warning('検索クエリに問題があります', searchValidation.errors.join(', '), 5000)
    }
  }, [searchValidation, warning])

  // フィルタリングされたイベント
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // カテゴリフィルター
      if (selectedCategory !== 'all' && event.type !== selectedCategory) {
        return false;
      }

      // 検索クエリフィルター（検証済みの場合のみ）
      if (searchQuery && searchValidation.isValid) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          event.title,
          event.description,
          event.organizer,
          event.place,
          event.target
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // 日付範囲フィルター
      if (selectedDateRange !== 'all') {
        const now = new Date();
        const eventDate = new Date(event.startAt);
        
        switch (selectedDateRange) {
          case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            if (eventDate < today || eventDate >= tomorrow) return false;
            break;
          case 'week':
            const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (eventDate < weekStart || eventDate >= weekEnd) return false;
            break;
          case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            if (eventDate < monthStart || eventDate >= monthEnd) return false;
            break;
          case 'next-month':
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);
            if (eventDate < nextMonthStart || eventDate >= nextMonthEnd) return false;
            break;
        }
      }

      // 都道府県フィルター
      if (selectedPrefecture !== 'all' && event.prefecture !== selectedPrefecture) {
        return false;
      }

      return true;
    });
  }, [events, selectedCategory, searchQuery, selectedDateRange, selectedPrefecture]);

  // お気に入り状態を取得
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites')
        if (response.ok) {
          const data = await response.json()
          const favoriteIds = data.favorites.map((fav: any) => fav.eventId)
          setFavorites(favoriteIds)
        }
      } catch (error) {
        console.error('お気に入り取得エラー:', error)
      }
    }

    fetchFavorites()
  }, [])

  const handleFavorite = async (eventId: string) => {
    console.log('お気に入りボタンがクリックされました:', eventId);
    try {
      const isFavorite = favorites.includes(eventId)
      console.log('現在のお気に入り状態:', isFavorite);
      
      if (isFavorite) {
        // お気に入りから削除
        console.log('お気に入りから削除中...');
        const response = await fetch(`/api/favorites?eventId=${eventId}`, {
          method: 'DELETE'
        })
        
        console.log('削除APIレスポンス:', response.status);
        if (response.ok) {
          const data = await response.json()
          if (data.fallback) {
            console.log('フォールバックモードで削除完了');
          }
          setFavorites(prev => prev.filter(id => id !== eventId))
          console.log('お気に入りから削除完了');
        } else {
          const errorData = await response.text();
          console.error('削除APIエラー:', errorData);
          throw new Error('お気に入りから削除に失敗しました')
        }
      } else {
        // お気に入りに追加
        console.log('お気に入りに追加中...');
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId })
        })
        
        console.log('追加APIレスポンス:', response.status);
        if (response.ok) {
          const data = await response.json()
          if (data.fallback) {
            console.log('フォールバックモードで追加完了');
          }
          setFavorites(prev => [...prev, eventId])
          console.log('お気に入りに追加完了');
        } else {
          const errorData = await response.text();
          console.error('追加APIエラー:', errorData);
          
          // 502エラーの場合はフォールバックとしてローカルで処理
          if (response.status === 502) {
            console.log('502エラーを検出、ローカルフォールバックを実行');
            setFavorites(prev => [...prev, eventId])
            console.log('ローカルフォールバックでお気に入りに追加完了');
            return
          }
          
          throw new Error('お気に入りに追加に失敗しました')
        }
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error)
      
      // ネットワークエラーの場合はローカルフォールバック
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('ネットワークエラーを検出、ローカルフォールバックを実行');
        const isFavorite = favorites.includes(eventId)
        if (isFavorite) {
          setFavorites(prev => prev.filter(id => id !== eventId))
        } else {
          setFavorites(prev => [...prev, eventId])
        }
        console.log('ローカルフォールバックでお気に入り操作完了');
        return
      }
      
      alert('お気に入り操作に失敗しました')
    }
  }

  // イベント取得処理
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // キャッシュからイベントを取得（高速化）
        const cachedEvents = await getCachedEvents();
        if (cachedEvents && cachedEvents.length > 0) {
          setEvents(cachedEvents);
          setLoading(false);
        }
        
        // バックグラウンドで最新データを取得
        const response = await fetch('/api/events');
        
        if (response.status === 503) {
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
          setEvents(sampleEvents);
          setError('データベース接続が設定されていません。サンプルデータを表示しています。');
        } else if (response.ok) {
          const data = await response.json();
          const events = data.events || data.data || [];
          
          if (events.length === 0) {
            // イベントが0件の場合、サンプルデータを表示
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
            setEvents(sampleEvents);
            setError('データベースからイベントが取得できませんでした。サンプルデータを表示しています。');
          } else {
            // 日付文字列をDateオブジェクトに変換
            const processedEvents = events.map((event: any) => ({
              ...event,
              startAt: new Date(event.startAt),
              endAt: new Date(event.endAt),
              createdAt: new Date(event.createdAt),
              updatedAt: new Date(event.updatedAt)
            }));
            
            setEvents(processedEvents);
          }
        } else {
          throw new Error(`イベントの取得に失敗しました (${response.status})`);
        }
      } catch (error) {
        console.error('イベント取得エラー:', error);
        setError(error instanceof Error ? error.message : 'イベントの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const renderEvent = (event: Event) => {
    const isFavorite = favorites.includes(event.id);

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
        {/* イベント画像 */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">イベント</p>
              </div>
            </div>
          )}
          
          {/* イベントタイプバッジ */}
          <div className="absolute top-3 left-3">
            <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {event.type === 'seminar' && 'セミナー'}
              {event.type === 'webinar' && 'ウェビナー'}
              {event.type === 'meetup' && 'ミートアップ'}
              {event.type === 'workshop' && 'ワークショップ'}
              {event.type === 'other' && 'その他'}
            </span>
          </div>

          {/* お気に入りボタン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite(event.id);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 hover:scale-110 transition-all duration-200 z-10 cursor-pointer shadow-md"
            title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
          >
            <svg
              className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* イベント情報 */}
        <div className="p-4">
          {/* タイトル */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          {/* 日時 */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {new Date(event.startAt).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
                weekday: 'short'
              })}
              {' '}
              {new Date(event.startAt).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* 場所 */}
          {event.place && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.place}</span>
            </div>
          )}

          {/* 主催者 */}
          {event.organizer && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="line-clamp-1">{event.organizer}</span>
            </div>
          )}

          {/* 参加費 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-900">
                {event.fee === 0 ? '無料' : `¥${event.fee.toLocaleString()}`}
              </span>
              {event.fee > 0 && (
                <span className="text-sm text-gray-500 ml-1">/人</span>
              )}
            </div>
            
            {/* 詳細ボタン */}
            <a
              href={`/events/${event.id}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              詳細を見る
            </a>
          </div>

          {/* タグ */}
          {event.target && (
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {event.target}
              </span>
            </div>
          )}
        </div>

        {/* カード全体のクリックイベント */}
        <div 
          className="absolute inset-0 z-0"
          onClick={() => window.location.href = `/events/${event.id}`}
        />
      </div>
    )
  }

  if (loading) {
    return <LoadingPage message="イベントを読み込み中..." showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Logo size="md" href="/" />
            </div>
            
            {/* デスクトップナビゲーション */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/favorites"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium touch-manipulation"
              >
                お気に入り
              </a>
              <a
                href="/submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
              >
                イベント投稿
              </a>
              <a
                href="/admin"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium touch-manipulation"
              >
                管理画面
              </a>
            </div>

            {/* モバイルメニューボタン */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors touch-manipulation"
                aria-label="メニューを開く"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* タイトルセクション */}
        <div className="text-center mb-8 pt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FinCal — みんなでつくる、みんなのイベント表
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            誰でもサクッと投稿・シェアできるオープンカレンダーです。勉強会から交流会まで、最新の会計・ファイナンス系イベントがひと目でわかります。
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* デバッグ情報（開発時のみ表示） */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">デバッグ情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-500">データベース接続</div>
                <div className={`font-semibold ${debugInfo.databaseConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.databaseConnected ? '接続済み' : '未接続'}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-500">全イベント数</div>
                <div className="font-semibold text-blue-600">{debugInfo.totalEvents || 0}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-500">公開済みイベント</div>
                <div className="font-semibold text-green-600">{debugInfo.publishedEvents || 0}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-500">承認待ちイベント</div>
                <div className="font-semibold text-yellow-600">{debugInfo.pendingEvents || 0}</div>
              </div>
            </div>
            {debugInfo.publishedEventDetails && debugInfo.publishedEventDetails.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">公開済みイベント詳細:</h4>
                <div className="bg-white rounded border p-3">
                  <pre className="text-xs text-gray-700 overflow-auto">
                    {JSON.stringify(debugInfo.publishedEventDetails, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* フィルター・検索セクション */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          {/* 基本フィルター */}
          <div className="space-y-4 mb-4">
            {/* 検索ボックス */}
            <div className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="イベントを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* カテゴリフィルターと詳細フィルターボタン - モバイルではスクロール可能 */}
            <div className="overflow-x-auto">
              <div className="flex items-center space-x-2 min-w-max pb-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
                
                {/* 高度なフィルター切り替えボタン */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors bg-gray-50 rounded-lg whitespace-nowrap"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {showAdvancedFilters ? 'フィルターを閉じる' : '詳細フィルター'}
                </button>
              </div>
            </div>
          </div>

          {/* 高度なフィルター */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4">
                {/* 日付範囲フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">日付範囲</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dateRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 都道府県フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
                  <select
                    value={selectedPrefecture}
                    onChange={(e) => setSelectedPrefecture(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {prefectures.map((prefecture) => (
                      <option key={prefecture.value} value={prefecture.value}>
                        {prefecture.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* フィルターリセットボタン */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedDateRange('all');
                      setSelectedPrefecture('all');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    フィルターをリセット
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 結果表示 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              イベント一覧
            </h2>
            <span className="text-sm text-gray-600">
              {filteredEvents.length}件のイベント
            </span>
          </div>

          {/* 表示モード切り替え */}
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
              title="リスト表示"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
              title="カレンダー表示"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* イベント表示 */}
        {viewMode === 'list' ? (
          <Suspense fallback={<SkeletonList count={8} />}>
            <LazyEventList
              events={filteredEvents}
              renderEvent={renderEvent}
            />
          </Suspense>
        ) : (
          <CalendarView events={filteredEvents} />
        )}

        {/* モバイルメニュー */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* モバイル固定CTAボタン */}
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <Link
            href="/submit"
            className="flex flex-col items-center justify-center w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            title="イベントを投稿"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">投稿</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 