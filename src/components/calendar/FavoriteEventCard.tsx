'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, User, DollarSign, Clock } from 'lucide-react'
import { Event } from '@/types'

interface FavoriteEventCardProps {
  event: Event
}

const eventTypeColors = {
  seminar: 'bg-blue-100 text-blue-800',
  webinar: 'bg-green-100 text-green-800',
  meetup: 'bg-purple-100 text-purple-800',
  workshop: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
}

const eventTypeLabels = {
  seminar: 'セミナー',
  webinar: 'ウェビナー',
  meetup: 'ミートアップ',
  workshop: 'ワークショップ',
  other: 'その他',
}

export default function FavoriteEventCard({ event }: FavoriteEventCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(date)
  }

  const getDefaultImage = () => {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <p className="text-blue-600 font-medium">{eventTypeLabels[event.type]}</p>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group border border-gray-100">
        {/* サムネイル画像 */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
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
            getDefaultImage()
          )}
          
          {/* イベントタイプバッジ */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.type]}`}>
              {eventTypeLabels[event.type]}
            </span>
          </div>

          {/* 料金バッジ */}
          {event.fee !== null && event.fee > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ¥{event.fee.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* イベント情報 */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">{formatDate(event.startAt)}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="truncate">{event.organizer}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.place}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit' }).format(event.startAt)} - 
                {new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit' }).format(event.endAt)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{event.fee ? `¥${event.fee.toLocaleString()}` : '無料'}</span>
            </div>
          </div>
          
          {event.description && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
} 