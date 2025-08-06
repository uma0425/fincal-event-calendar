'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Event } from '@prisma/client';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const EventCard = memo(function EventCard({ event, onClick }: EventCardProps) {
  const router = useRouter();

  // 日付フォーマットをメモ化
  const formattedDate = useMemo(() => {
    const date = new Date(event.startAt);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  }, [event.startAt]);

  // 時間フォーマットをメモ化
  const formattedTime = useMemo(() => {
    const date = new Date(event.startAt);
    // 日本時間で表示
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    });
  }, [event.startAt]);

  // イベントタイプカラーをメモ化
  const typeColor = useMemo(() => {
    const colors = {
      'seminar': 'bg-blue-100 text-blue-800',
      'webinar': 'bg-green-100 text-green-800',
      'meetup': 'bg-purple-100 text-purple-800',
      'workshop': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[event.type] || colors['other'];
  }, [event.type]);

  // イベントタイプラベルをメモ化
  const typeLabel = useMemo(() => {
    const labels = {
      'seminar': 'セミナー',
      'webinar': 'ウェビナー',
      'meetup': 'ミートアップ',
      'workshop': 'ワークショップ',
      'other': 'その他',
    };
    return labels[event.type] || 'その他';
  }, [event.type]);

  // カードクリック時の処理
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // デフォルトの動作：詳細ページに遷移
      router.push(`/events/${event.id}`);
    }
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* 画像セクション */}
      <div className="relative">
        {event.imageUrl ? (
          <div className="relative h-48 overflow-hidden">
            {event.imageUrl.startsWith('data:') ? (
              // data URLの場合は通常のimgタグを使用
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              // 外部URLの場合はNext.jsのImageコンポーネントを使用
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={false}
                loading="lazy"
              />
            )}
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* お気に入りボタン */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* カテゴリバッジ */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
        </div>
      </div>
      
      {/* コンテンツセクション */}
      <div className="p-4">
        {/* タイトル */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        
        {/* 日時と場所 */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formattedDate} {formattedTime}</span>
        </div>

        {event.place && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{event.place}</span>
          </div>
        )}
        
        {/* 主催者 */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="line-clamp-1">{event.organizer}</span>
        </div>

        {/* 参加費 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>{event.fee === 0 ? '無料' : `¥${event.fee?.toLocaleString()}`}</span>
          </div>
          
          {/* 評価（仮） */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-600">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EventCard; 