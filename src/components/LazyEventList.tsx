'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Event } from '@prisma/client';

interface LazyEventListProps {
  events: Event[];
  renderEvent: (event: Event) => React.ReactNode;
  itemsPerPage?: number;
  threshold?: number;
}

export default function LazyEventList({ 
  events, 
  renderEvent, 
  itemsPerPage = 12, 
  threshold = 100 
}: LazyEventListProps) {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // eventsが配列でない場合は空配列を使用
  const safeEvents = Array.isArray(events) ? events : [];
  
  console.log('LazyEventList - 受け取ったイベント数:', events?.length);
  console.log('LazyEventList - safeEvents数:', safeEvents.length);
  
  // 表示するイベントを取得
  const visibleEvents = safeEvents.slice(0, visibleItems);
  const hasMore = visibleItems < safeEvents.length;
  
  console.log('LazyEventList - 表示するイベント数:', visibleEvents.length);
  console.log('LazyEventList - さらに読み込み可能:', hasMore);

  // 次のページを読み込む
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // 少し遅延を入れてスムーズな読み込みを実現
    setTimeout(() => {
      setVisibleItems(prev => Math.min(prev + itemsPerPage, safeEvents.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, itemsPerPage, safeEvents.length]);

  // Intersection Observerの設定
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, threshold]);

  // イベントが変更されたら表示数をリセット
  useEffect(() => {
    setVisibleItems(itemsPerPage);
  }, [safeEvents.length, itemsPerPage]);

  return (
    <div className="space-y-8">
      {/* イベントグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleEvents.map((event) => (
          <div key={event.id} className="animate-fade-in">
            {renderEvent(event)}
          </div>
        ))}
      </div>
      
      {/* 読み込みインジケーター */}
      {hasMore && (
        <div
          ref={loadingRef}
          className="flex justify-center py-8"
        >
          {isLoading ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">読み込み中...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              さらに読み込む
            </button>
          )}
        </div>
      )}
      
      {/* 完了メッセージ */}
      {!hasMore && safeEvents.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">すべてのイベントを表示しました</span>
          </div>
        </div>
      )}
    </div>
  );
} 