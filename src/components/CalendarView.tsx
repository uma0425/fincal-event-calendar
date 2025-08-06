'use client';

import { useState, useMemo } from 'react';
import { Event } from '@prisma/client';
import EventCard from './EventCard';

interface CalendarViewProps {
  events: Event[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // eventsが配列でない場合は空配列を使用
  const safeEvents = Array.isArray(events) ? events : [];

  // 現在の月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // カレンダーの最初の日（前月の日も含む）
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfMonth.getDay());

  // カレンダーの日付配列を生成
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

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  // 日付を選択
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => changeMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h2>
        
        <button
          onClick={() => changeMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                min-h-[80px] p-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors
                ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'}
                ${isToday(date) ? 'bg-blue-50' : ''}
                ${isSelected(date) ? 'bg-blue-100 border-2 border-blue-500' : ''}
              `}
            >
              <div className="text-sm font-medium mb-1">{date.getDate()}</div>
              
              {/* イベント表示 */}
              {hasEvents && (
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2}件
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 選択された日付のイベント詳細 */}
      {selectedDate && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日のイベント
          </h3>
          
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