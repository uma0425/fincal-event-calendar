'use client';

import { useState, useMemo } from 'react';
import { Event } from '@prisma/client';
import EventCard from './EventCard';

interface CalendarViewProps {
  events: Event[];
}

type ViewMode = 'month' | 'week';

export default function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // eventsが配列でない場合は空配列を使用
  const safeEvents = Array.isArray(events) ? events : [];

  // 現在の月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // カレンダーの最初の日（前月の日も含む）
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfMonth.getDay());

  // 週ビュー用の日付配列を生成
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  }, [currentDate]);

  // カレンダーの日付配列を生成（月ビュー用）
  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(firstDayOfCalendar);
    
    while (current <= lastDayOfMonth || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [firstDayOfCalendar, lastDayOfMonth]);

  // 指定された日付のイベントを取得
  const getEventsForDate = (date: Date) => {
    return safeEvents.filter(event => {
      const eventDate = new Date(event.startAt);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // 時間でソートされたイベントを取得
  const getSortedEventsForDate = (date: Date) => {
    return getEventsForDate(date).sort((a, b) => {
      const timeA = new Date(a.startAt).getTime();
      const timeB = new Date(b.startAt).getTime();
      return timeA - timeB;
    });
  };

  // 日付を変更
  const changeDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
      } else {
        if (direction === 'prev') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() + 7);
        }
      }
      return newDate;
    });
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  // 日付を選択
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  // イベントを選択
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  // 日付が今日かどうか
  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  // 日付が選択されているかどうか
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // 日付が今月かどうか
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // イベントの時間をフォーマット
  const formatEventTime = (event: Event) => {
    const date = new Date(event.startAt);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    });
  };

  // イベントの場所を取得（短縮版）
  const getEventPlace = (event: Event) => {
    if (!event.place) return '';
    return event.place.length > 10 ? event.place.substring(0, 10) + '...' : event.place;
  };

  // イベントのタイプカラーを取得
  const getEventTypeColor = (event: Event) => {
    const colors = {
      'seminar': 'bg-blue-100 text-blue-800 border-blue-200',
      'webinar': 'bg-green-100 text-green-800 border-green-200',
      'meetup': 'bg-purple-100 text-purple-800 border-purple-200',
      'workshop': 'bg-orange-100 text-orange-800 border-orange-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[event.type] || colors['other'];
  };

  // 週ビューのレンダリング
  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {weekDays.map((date, index) => {
        const dayEvents = getSortedEventsForDate(date);
        const hasEvents = dayEvents.length > 0;
        
        return (
          <div
            key={index}
            className={`
              min-h-[120px] sm:min-h-[150px] p-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation
              ${isToday(date) ? 'bg-blue-50' : ''}
              ${isSelected(date) ? 'bg-blue-100 border-2 border-blue-500' : ''}
            `}
            onClick={() => handleDateClick(date)}
          >
            <div className="text-sm font-medium mb-2 text-center">
              <div className="text-gray-900">{date.getDate()}</div>
              <div className="text-xs text-gray-500">
                {['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
              </div>
            </div>
            
            {/* イベント表示 */}
            {hasEvents && (
              <div className="space-y-1">
                                 {dayEvents.slice(0, 3).map(event => (
                   <div
                     key={event.id}
                     onClick={(e) => handleEventClick(event, e)}
                     className={`text-xs px-2 py-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event)}`}
                     title={`${event.title} - ${formatEventTime(event)}${event.place ? ` - ${event.place}` : ''}`}
                   >
                     <div className="font-medium truncate">{event.title}</div>
                     <div className="text-xs opacity-75 flex items-center justify-between">
                       <span>{formatEventTime(event)}</span>
                       {event.place && (
                         <span className="text-xs opacity-60">{getEventPlace(event)}</span>
                       )}
                     </div>
                   </div>
                 ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3}件
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // 月ビューのレンダリング
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {calendarDays.map((date, index) => {
        const dayEvents = getSortedEventsForDate(date);
        const hasEvents = dayEvents.length > 0;
        
        return (
          <div
            key={index}
            onClick={() => handleDateClick(date)}
            className={`
              min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation
              ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'}
              ${isToday(date) ? 'bg-blue-50' : ''}
              ${isSelected(date) ? 'bg-blue-100 border-2 border-blue-500' : ''}
            `}
          >
            <div className="text-xs sm:text-sm font-medium mb-1">{date.getDate()}</div>
            
            {/* イベント表示 */}
            {hasEvents && (
              <div className="space-y-0.5 sm:space-y-1">
                                 {dayEvents.slice(0, 1).map(event => (
                   <div
                     key={event.id}
                     onClick={(e) => handleEventClick(event, e)}
                     className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event)}`}
                     title={`${event.title} - ${formatEventTime(event)}${event.place ? ` - ${event.place}` : ''}`}
                   >
                     <div className="truncate">{event.title}</div>
                     <div className="text-xs opacity-75 truncate">{formatEventTime(event)}</div>
                   </div>
                 ))}
                {dayEvents.length > 1 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 1}件
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <button
          onClick={() => changeDate('prev')}
          className="p-2 sm:p-2 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
        >
          <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex-1 text-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {viewMode === 'month' 
              ? `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
              : `${weekDays[0].getMonth() + 1}月${weekDays[0].getDate()}日 - ${weekDays[6].getMonth() + 1}月${weekDays[6].getDate()}日`
            }
          </h2>
          
          {/* ビューモード切り替え */}
          <div className="flex justify-center mt-2 space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              週
            </button>
          </div>
        </div>
        
        <button
          onClick={() => changeDate('next')}
          className="p-2 sm:p-2 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
        >
          <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="bg-gray-50 p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      {viewMode === 'week' ? renderWeekView() : renderMonthView()}

      {/* 選択されたイベントの詳細 */}
      {selectedEvent && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              イベント詳細
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  window.open(`/events/${selectedEvent.id}`, '_blank');
                }}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                詳細ページ
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <EventCard event={selectedEvent} />
        </div>
      )}

      {/* 選択された日付のイベント詳細 */}
      {selectedDate && !selectedEvent && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日のイベント
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getEventsForDate(selectedDate).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              この日にはイベントがありません
            </p>
          )}
        </div>
      )}
    </div>
  );
} 