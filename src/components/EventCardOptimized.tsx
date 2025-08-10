'use client';

import { memo, useMemo } from 'react';
import { Event } from '@prisma/client';
import OptimizedImage from './OptimizedImage';
import LazyLoad from './LazyLoad';
import FavoriteButton from './FavoriteButton';

interface EventCardOptimizedProps {
  event: Event;
  onClick?: () => void;
}

const EventCardOptimized = memo(function EventCardOptimized({ 
  event, 
  onClick 
}: EventCardOptimizedProps) {
  const formattedDate = useMemo(() => {
    const date = new Date(event.startAt);
    return {
      month: date.toLocaleDateString('ja-JP', { month: 'short' }),
      day: date.getDate(),
      time: date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  }, [event.startAt]);

  const typeColor = useMemo(() => {
    switch (event.type) {
      case 'seminar': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workshop': return 'bg-green-100 text-green-800 border-green-200';
      case 'webinar': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meetup': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, [event.type]);

  const typeLabel = useMemo(() => {
    switch (event.type) {
      case 'seminar': return 'セミナー';
      case 'workshop': return 'ワークショップ';
      case 'webinar': return 'ウェビナー';
      case 'meetup': return 'ミートアップ';
      case 'other': return 'その他';
      default: return 'その他';
    }
  }, [event.type]);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <LazyLoad className="h-full">
      <div 
        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden touch-manipulation animate-fade-in-scale hover-lift h-full"
        onClick={handleCardClick}
      >
        {/* Image section */}
        <div className="relative">
          <div className="relative w-full h-0 pb-[56.25%] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <OptimizedImage
              src={event.imageUrl || '/placeholder-image.svg'}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <FavoriteButton eventId={event.id} />
            </div>
            <div className="absolute bottom-3 left-3 z-20">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor} shadow-lg backdrop-blur-sm bg-white/80`}>
                {typeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4">
          {/* Date badge */}
          <div className="flex items-center mb-3">
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate.month} {formattedDate.day}日 {formattedDate.time}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          {/* Meta info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {event.organizer || '主催者未定'}
            </div>
            {event.place && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.place}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {event.fee === 0 ? '無料' : `¥${event.fee.toLocaleString()}`}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: event.title,
                      text: event.description,
                      url: window.location.origin + `/events/${event.id}`
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
                  }
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-400">
              {event.target && <span>{event.target}</span>}
            </div>
          </div>
        </div>
      </div>
    </LazyLoad>
  );
});

export default EventCardOptimized;
