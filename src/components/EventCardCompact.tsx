'use client';

import { memo, useMemo } from 'react';
import { Event } from '@prisma/client';
import OptimizedImage from './OptimizedImage';
import FavoriteButton from './FavoriteButton';

interface EventCardCompactProps {
  event: Event;
  onClick?: () => void;
}

const EventCardCompact = memo(function EventCardCompact({ 
  event, 
  onClick 
}: EventCardCompactProps) {
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
      case 'seminar': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'webinar': return 'bg-purple-100 text-purple-800';
      case 'meetup': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden h-full"
      onClick={handleCardClick}
    >
      {/* Image section */}
      <div className="relative">
        <div className="relative w-full h-0 pb-[56.25%] overflow-hidden">
          <OptimizedImage
            src={event.imageUrl || ''}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            priority={false}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <FavoriteButton eventId={event.id} />
          </div>
          <div className="absolute bottom-2 left-2 z-20">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor} shadow-sm`}>
              {typeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-3">
        {/* Date and Title */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-600 font-medium">
              {formattedDate.month} {formattedDate.day}日 {formattedDate.time}
            </span>
            <span className="text-xs text-gray-500">
              {event.fee === 0 ? '無料' : `¥${event.fee.toLocaleString()}`}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
        </div>

        {/* Organizer and Place */}
        <div className="space-y-1 mb-2">
          <div className="text-xs text-gray-600 truncate">
            {event.organizer || '主催者未定'}
          </div>
          {event.place && (
            <div className="text-xs text-gray-500 truncate">
              {event.place}
            </div>
          )}
        </div>

        {/* Action and Target */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          {event.target && (
            <span className="text-xs text-gray-400 truncate max-w-20">
              {event.target}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default EventCardCompact;
