'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, User, DollarSign, Clock } from 'lucide-react'
import { Event } from '@/types'
import FavoriteButton from '@/components/events/FavoriteButton'
import { memo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface EventCardProps {
  event: Event
}

const eventTypeColors = {
  seminar: 'bg-blue-100 text-blue-800',
  meetup: 'bg-green-100 text-green-800',
  workshop: 'bg-purple-100 text-purple-800',
  webinar: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800'
}

const eventTypeLabels = {
  seminar: 'セミナー',
  meetup: '勉強会',
  workshop: 'ワークショップ',
  webinar: 'ウェビナー',
  other: 'その他'
}

const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const router = useRouter()
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getDefaultImage = (type: string) => {
    const images = {
      seminar: '/images/seminar-default.jpg',
      meetup: '/images/meetup-default.jpg',
      workshop: '/images/workshop-default.jpg',
      webinar: '/images/webinar-default.jpg'
    }
    return images[type as keyof typeof images] || '/images/event-default.jpg'
  }

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group border border-gray-100 cursor-pointer"
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="article"
      aria-labelledby={`event-title-${event.id}`}
      onClick={() => router.push(`/events/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/events/${event.id}`)
        }
      }}
      tabIndex={0}
      aria-label={`${event.title}の詳細を見る`}
    >
        {/* サムネイル画像 */}
        <div className="relative h-40 sm:h-48 bg-gray-200 overflow-hidden">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100">
              <div className="text-center">
                <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-blue-600 font-medium text-sm sm:text-base">{eventTypeLabels[event.type]}</p>
              </div>
            </div>
          )}
          
          {/* イベントタイプバッジ */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.type]}`}>
              {eventTypeLabels[event.type]}
            </span>
          </div>

          {/* 料金バッジ */}
          {event.fee !== null && event.fee > 0 && (
            <div className="absolute top-2 sm:top-3 right-10 sm:right-12">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ¥{event.fee.toLocaleString()}
              </span>
            </div>
          )}

          {/* お気に入りボタン */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <FavoriteButton eventId={event.id} size="sm" />
          </div>
        </div>

        {/* イベント情報 */}
        <div className="p-3 sm:p-4">
          <h3 
            id={`event-title-${event.id}`}
            className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
          >
            {event.title}
          </h3>
          
          {/* 日付 */}
          <div className="text-sm text-gray-600 mb-3">
            {formatDate(event.startAt)}
          </div>

          {/* イベント詳細 */}
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-500">
            {/* カテゴリ */}
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-2">カテゴリ:</span>
              <span className="text-gray-500 truncate">{eventTypeLabels[event.type]}</span>
            </div>
            
            {/* 地域 */}
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-2">地域:</span>
              <span className="text-gray-500 truncate">{event.place}</span>
            </div>
            
            {/* 対象者 */}
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-2">対象者:</span>
              <span className="text-gray-500 truncate">
                {event.target && event.target.length > 0 ? event.target.join(', ') : '全員'}
              </span>
            </div>
            
            {/* 開催日時 */}
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-2">開催日時:</span>
              <span className="text-gray-500 text-xs">
                {formatDate(event.startAt)} {formatTime(event.startAt)} ~ {formatTime(event.endAt)}
              </span>
            </div>
          </div>

          {/* 主催者 */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{event.organizer}</span>
            </div>
          </div>
                </div>
      </motion.div>
  )
 })

export default EventCard 