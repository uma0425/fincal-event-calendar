'use client'

import { useFavorites } from '@/contexts/FavoriteContext'
import { Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FavoriteEventCard from '@/components/calendar/FavoriteEventCard'
import { Event } from '@/types'
import { demoEvents } from '@/lib/demoData'

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  // お気に入りに登録されたイベントのみをフィルタリング
  const favoriteEvents = demoEvents.filter(event => favorites.includes(event.id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm sm:text-base">カレンダーに戻る</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">お気に入り</h1>
            <span className="text-sm text-gray-500">({favorites.length}件)</span>
          </div>
        </div>
      </div>

             {/* お気に入りがない場合 */}
       {favoriteEvents.length === 0 && (
         <div className="text-center py-8 sm:py-12">
           <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
           <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">お気に入りがありません</h2>
           <p className="text-gray-500 mb-6 text-sm sm:text-base">
             イベントをお気に入りに追加すると、ここに表示されます。
           </p>
           <Link
             href="/"
             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
           >
             イベントを探す
           </Link>
         </div>
       )}

       {/* お気に入りイベント一覧 */}
       {favoriteEvents.length > 0 && (
         <div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
             {favoriteEvents.map((event) => (
               <FavoriteEventCard key={event.id} event={event} />
             ))}
           </div>
         </div>
       )}
    </div>
  )
} 