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
  itemsPerPage = 10, 
  threshold = 100 
}: LazyEventListProps) {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 表示するイベントを取得
  const visibleEvents = events.slice(0, visibleItems);
  const hasMore = visibleItems < events.length;

  // 次のページを読み込む
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // 少し遅延を入れてスムーズな読み込みを実現
    setTimeout(() => {
      setVisibleItems(prev => Math.min(prev + itemsPerPage, events.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, itemsPerPage, events.length]);

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
  }, [events.length, itemsPerPage]);

  return (
    <div className="space-y-4">
      {visibleEvents.map((event) => (
        <div key={event.id} className="animate-fade-in">
          {renderEvent(event)}
        </div>
      ))}
      
      {hasMore && (
        <div
          ref={loadingRef}
          className="flex justify-center py-4"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">読み込み中...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              さらに読み込む
            </button>
          )}
        </div>
      )}
      
      {!hasMore && events.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          すべてのイベントを表示しました
        </div>
      )}
    </div>
  );
} 