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
import EventDetailPanel from '@/components/EventDetailPanel';
import EventCardCompact from '@/components/EventCardCompact';
import FilterChips from '@/components/FilterChips';
import TitleLogo from '@/components/TitleLogo';
import PopularEventsSection from '@/components/PopularEventsSection';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDateRanges, setSelectedDateRanges] = useState<string[]>([]);
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'newest' | 'popular'>('date');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [showPrefectureFilters, setShowPrefectureFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  
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
    let filtered = events.filter(event => {
      // カテゴリフィルター（マルチセレクト OR）
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.type)) {
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

      // 日付範囲フィルター（マルチセレクト OR）
      if (selectedDateRanges.length > 0) {
        const now = new Date();
        const eventDate = new Date(event.startAt);
        let dateMatches = false;
        
        for (const dateRange of selectedDateRanges) {
          let matches = false;
          switch (dateRange) {
            case 'today':
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
              matches = eventDate >= today && eventDate < tomorrow;
              break;
            case 'week':
              const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
              const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
              matches = eventDate >= weekStart && eventDate < weekEnd;
              break;
            case 'month':
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
              matches = eventDate >= monthStart && eventDate < monthEnd;
              break;
            case 'next-month':
              const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
              const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);
              matches = eventDate >= nextMonthStart && eventDate < nextMonthEnd;
              break;
          }
          if (matches) {
            dateMatches = true;
            break;
          }
        }
        if (!dateMatches) return false;
      }

      // 都道府県フィルター（マルチセレクト OR）
      if (selectedPrefectures.length > 0 && !selectedPrefectures.includes(event.prefecture || '')) {
        return false;
      }

      return true;
    });

    // ソート機能
    const sortedEvents = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          // 仮の実装：作成日でソート（実際のデータに応じて調整）
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sortedEvents;
  }, [events, selectedCategories, selectedDateRanges, selectedPrefectures, searchQuery, searchValidation.isValid, sortBy]);

  // お気に入り状態を取得
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites')
        if (response.ok) {
          const data = await response.json()
          // 安全にお気に入りIDを抽出
          const favoriteIds = data.favorites
            ?.filter((fav: any) => fav && fav.eventId)
            ?.map((fav: any) => fav.eventId) || []
          setFavorites(favoriteIds)
        }
      } catch (error) {
        console.error('お気に入り取得エラー:', error)
        // エラー時は空配列を設定
        setFavorites([])
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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailPanelOpen(true);
  }

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedEvent(null);
  }

  // フィルター操作関数
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleDateRange = (dateRange: string) => {
    setSelectedDateRanges(prev => 
      prev.includes(dateRange) 
        ? prev.filter(d => d !== dateRange)
        : [...prev, dateRange]
    );
  };

  const togglePrefecture = (prefecture: string) => {
    setSelectedPrefectures(prev => 
      prev.includes(prefecture) 
        ? prev.filter(p => p !== prefecture)
        : [...prev, prefecture]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedDateRanges([]);
    setSelectedPrefectures([]);
    setSearchQuery('');
    setShowDateFilters(false);
    setShowPrefectureFilters(false);
  };

  // アクティブフィルターの取得
  const activeFilters = useMemo(() => {
    const filters: Array<{ type: string; value: string; label: string }> = [];
    
    selectedCategories.forEach(cat => {
      const label = categories.find(c => c.value === cat)?.label || cat;
      filters.push({ type: 'category', value: cat, label });
    });
    
    selectedDateRanges.forEach(date => {
      const label = dateRanges.find(d => d.value === date)?.label || date;
      filters.push({ type: 'date', value: date, label });
    });
    
    selectedPrefectures.forEach(pref => {
      const label = prefectures.find(p => p.value === pref)?.label || pref;
      filters.push({ type: 'prefecture', value: pref, label });
    });
    
    if (searchQuery) {
      filters.push({ type: 'search', value: searchQuery, label: `検索: ${searchQuery}` });
    }
    
    return filters;
  }, [selectedCategories, selectedDateRanges, selectedPrefectures, searchQuery, categories, dateRanges, prefectures]);

  // イベント取得処理
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // キャッシュからイベントを取得（高速化）
        const cachedEvents = await getCachedEvents();
        if (cachedEvents && cachedEvents.length > 0) {
          console.log('キャッシュからイベントを読み込み:', cachedEvents.length, '件');
          setEvents(cachedEvents);
          setLoading(false);
        }
        
        // バックグラウンドで最新データを取得
        console.log('Fetching events from API...');
        const response = await fetch('/api/events', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        console.log('API Response status:', response.status);
        console.log('API Response ok:', response.ok);
        
        if (response.status === 503) {
          console.log('Database connection error, using sample data');
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
              createdBy: null,
              viewCount: 150,
              favoriteCount: 25,
              shareCount: 8
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
              createdBy: null,
              viewCount: 320,
              favoriteCount: 45,
              shareCount: 12
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
              createdBy: null,
              viewCount: 85,
              favoriteCount: 18,
              shareCount: 5
            }
          ];
          setEvents(sampleEvents);
          setError('データベース接続が設定されていません。サンプルデータを表示しています。');
        } else if (response.ok) {
          const data = await response.json();
          console.log('API Response data:', data);
          const events = data.events || data.data || [];
          console.log('Processed events:', events);
          console.log('First event imageUrl:', events[0]?.imageUrl);
          
                      if (events.length === 0) {
              console.log('No events found, using sample data');
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
                createdBy: null,
                viewCount: 150,
                favoriteCount: 25,
                shareCount: 8
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
                createdBy: null,
                viewCount: 320,
                favoriteCount: 45,
                shareCount: 12
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
                createdBy: null,
                viewCount: 85,
                favoriteCount: 18,
                shareCount: 5
              }
            ];
            console.log('Setting sample events:', sampleEvents.length, 'events');
            setEvents(sampleEvents);
            setError('データベースからイベントが取得できませんでした。サンプルデータを表示しています。');
          } else {
            console.log('Processing events from API:', events.length, 'events');
            // 日付文字列をDateオブジェクトに変換
            const processedEvents = events.map((event: any) => ({
              ...event,
              startAt: new Date(event.startAt),
              endAt: new Date(event.endAt),
              createdAt: new Date(event.createdAt),
              updatedAt: new Date(event.updatedAt)
            }));
            
            console.log('Setting processed events:', processedEvents.length, 'events');
            console.log('First processed event:', processedEvents[0]);
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
    return (
      <EventCardCompact 
        event={event} 
        onClick={() => handleEventClick(event)}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* ヘッダー */}
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Logo size="md" href="/" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          {/* タイトルセクション */}
          <div className="text-center mb-8">
            <div className="h-6 md:h-8 lg:h-10 bg-gray-200 rounded-lg mb-4 animate-pulse max-w-4xl mx-auto"></div>
            <div className="flex justify-center items-center mt-4 space-x-2">
              <div className="w-6 h-0.5 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-3 h-0.5 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-6 h-0.5 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* フィルターセクション */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
            <div className="h-10 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* イベントグリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-30">
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
        <div className="text-center mb-8 pt-24 animate-fade-in-up">
          <div className="mb-6 animate-fade-in-scale">
            <TitleLogo />
          </div>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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

        {/* アクティブフィルターチップ */}
        <FilterChips
          filters={activeFilters}
          onRemove={(type, value) => {
            switch (type) {
              case 'category':
                setSelectedCategories(prev => prev.filter(c => c !== value));
                break;
              case 'date':
                setSelectedDateRanges(prev => prev.filter(d => d !== value));
                break;
              case 'prefecture':
                setSelectedPrefectures(prev => prev.filter(p => p !== value));
                break;
              case 'search':
                setSearchQuery('');
                break;
            }
          }}
          onClearAll={clearAllFilters}
        />

        {/* フィルター・検索・ソートセクション */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8 mt-8 animate-fade-in-up hover-lift" style={{ animationDelay: '0.3s' }}>
          {/* 検索とソート */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6 mb-6">
            {/* 検索ボックス */}
            <div className="flex-1">
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

            {/* ソート選択 */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">並び替え:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'newest' | 'popular')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="date">開催が近い順</option>
                <option value="newest">新着順</option>
                <option value="popular">人気順</option>
              </select>
            </div>
          </div>

          {/* フィルター */}
          <div className="space-y-4">
            {/* カテゴリフィルター - 常に表示 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <div className="flex flex-wrap gap-2">
                {categories.filter(cat => cat.value !== 'all').map((category) => (
                  <button
                    key={category.value}
                    onClick={() => toggleCategory(category.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 詳細フィルター切り替えボタン */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowDateFilters(!showDateFilters)}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  showDateFilters || selectedDateRanges.length > 0
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                日付範囲
                {selectedDateRanges.length > 0 && (
                  <span className="ml-1 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5">
                    {selectedDateRanges.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowPrefectureFilters(!showPrefectureFilters)}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  showPrefectureFilters || selectedPrefectures.length > 0
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                地域
                {selectedPrefectures.length > 0 && (
                  <span className="ml-1 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5">
                    {selectedPrefectures.length}
                  </span>
                )}
              </button>
            </div>

            {/* 日付範囲フィルター - 条件付き表示 */}
            {showDateFilters && (
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">日付範囲</label>
                <div className="flex flex-wrap gap-2">
                  {dateRanges.filter(date => date.value !== 'all').map((dateRange) => (
                    <button
                      key={dateRange.value}
                      onClick={() => toggleDateRange(dateRange.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedDateRanges.includes(dateRange.value)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dateRange.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 都道府県フィルター - 条件付き表示 */}
            {showPrefectureFilters && (
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
                <div className="flex flex-wrap gap-2">
                  {prefectures.filter(pref => pref.value !== 'all').map((prefecture) => (
                    <button
                      key={prefecture.value}
                      onClick={() => togglePrefecture(prefecture.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedPrefectures.includes(prefecture.value)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {prefecture.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 結果ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredEvents.length}件のイベント
            </h2>
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
              >
                条件クリア
              </button>
            )}
          </div>

          {/* 表示モード切り替え */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 font-medium ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              一覧
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 font-medium ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              カレンダー
            </button>
          </div>
        </div>

        {/* 人気イベントセクション */}
        <PopularEventsSection className="mb-12" />

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

        {/* イベント詳細パネル */}
        <EventDetailPanel
          event={selectedEvent}
          isOpen={isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />

        {/* モバイルメニュー */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* 固定CTAボタン */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/submit"
            className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-bounce hover-scale"
            title="イベントを投稿"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium hidden sm:block">投稿</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 