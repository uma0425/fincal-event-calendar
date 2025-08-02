import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { formatDate, formatTime, getEventTypeLabel, getEventTypeColor, formatFee } from '@/lib/utils'
import { Calendar, MapPin, Users, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ShareButtons from '@/components/events/ShareButtons'
import FavoriteButton from '@/components/events/FavoriteButton'
import { Event } from '@/types'
import { demoEvents } from '@/lib/demoData'

interface EventDetailPageProps {
  params: {
    id: string
  }
}

// 構造化データ生成
function generateStructuredData(event: any) {
  const eventDate = new Date(event.startAt)
  const endDate = new Date(event.endAt)
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || `${getEventTypeLabel(event.type)}イベント`,
    startDate: eventDate.toISOString(),
    endDate: endDate.toISOString(),
    location: {
      '@type': 'Place',
      name: event.place,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.prefecture || '未設定',
        addressCountry: 'JP'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer
    },
    eventType: getEventTypeLabel(event.type),
    offers: {
      '@type': 'Offer',
      price: event.fee || 0,
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock'
    },
    url: `https://fincal.example.com/events/${event.id}`,
    image: event.imageUrl,
    inLanguage: 'ja',
    audience: {
      '@type': 'Audience',
      audienceType: event.target.join(', ')
    }
  }
}

// 動的メタデータ生成
export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const event = demoEvents.find(e => e.id === params.id)
  
  if (!event) {
    return {
      title: 'イベントが見つかりません',
      description: 'お探しのイベントは存在しないか、削除された可能性があります。',
    }
  }

  const eventDate = new Date(event.startAt)
  const formattedDate = formatDate(eventDate)
  const formattedTime = formatTime(eventDate)
  const eventTypeLabel = getEventTypeLabel(event.type)
  const feeText = formatFee(event.fee)

  return {
    title: event.title,
    description: `${event.description || `${eventTypeLabel}イベント`} - ${formattedDate} ${formattedTime}開催 - ${event.place} - ${feeText}`,
    openGraph: {
      title: `${event.title} | FinCal`,
      description: event.description || `${eventTypeLabel}イベント`,
      type: 'article',
      url: `https://fincal.example.com/events/${event.id}`,
      images: event.imageUrl ? [
        {
          url: event.imageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.title} | FinCal`,
      description: event.description || `${eventTypeLabel}イベント`,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
    alternates: {
      canonical: `https://fincal.example.com/events/${event.id}`,
    },
  }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  // デモデータからイベントを検索
  const event = demoEvents.find(e => e.id === params.id)

  if (!event || event.status !== 'published') {
    notFound()
  }

  const structuredData = generateStructuredData(event)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      {/* 戻るボタン */}
      <div className="mb-4 sm:mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm sm:text-base">カレンダーに戻る</span>
        </Link>
      </div>

      {/* イベント詳細 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* ヘッダー画像 */}
        {event.imageUrl && (
          <div className="relative h-48 sm:h-64 bg-gray-200">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
              className="object-cover"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        )}

        {/* イベント情報 */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* タイトルとタイプ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className={`badge text-xs sm:text-sm ${getEventTypeColor(event.type)}`}>
                  {getEventTypeLabel(event.type)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {formatDate(event.startAt)}
                </span>
              </div>
              
              {/* お気に入りボタン */}
              <FavoriteButton eventId={event.id} size="md" className="sm:hidden" />
              <FavoriteButton eventId={event.id} size="lg" className="hidden sm:block" />
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {event.title}
            </h1>
          </div>

          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">日時</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {formatDate(event.startAt)} {formatTime(event.startAt)} - {formatTime(event.endAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">場所</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{event.place}</p>
                  {event.prefecture && (
                    <p className="text-xs sm:text-sm text-gray-500">{event.prefecture}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">主催者</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{event.organizer}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">参加費</h3>
                <p className="text-2xl font-bold text-primary-600">
                  {formatFee(event.fee)}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">対象者</h3>
                <div className="flex flex-wrap gap-2">
                  {event.target.map((target, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {target}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">申込</h3>
                <a
                  href={event.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 btn btn-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>詳細・申込</span>
                </a>
              </div>
            </div>
          </div>

          {/* 説明 */}
          {event.description && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-gray-900 mb-3">イベント詳細</h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* 共有・アクション */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-500">
                <p>このイベントを共有する</p>
              </div>
              
              <ShareButtons
                title={event.title}
                description={event.description || ''}
                url={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events/${event.id}`}
                registerUrl={event.registerUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}