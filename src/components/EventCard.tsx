'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { Event } from '@prisma/client';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const EventCard = memo(function EventCard({ event, onClick }: EventCardProps) {
  // 日付フォーマットをメモ化
  const formattedDate = useMemo(() => {
    const date = new Date(event.startAt);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, [event.startAt]);

  // 時間フォーマットをメモ化
  const formattedTime = useMemo(() => {
    const date = new Date(event.startAt);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
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

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={onClick}
    >
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            loading="lazy"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {event.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formattedTime}</span>
          </div>
        </div>
        
        {event.place && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{event.place}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default EventCard; 