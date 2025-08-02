'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoriteContext'
import { motion } from 'framer-motion'

interface FavoriteButtonProps {
  eventId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FavoriteButton({ eventId, size = 'md', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isFavorited = isFavorite(eventId)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(eventId)
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`transition-all duration-200 hover:scale-110 ${className}`}
      aria-label={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={isFavorited ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      <Heart
        className={`${sizeClasses[size]} ${
          isFavorited
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-400'
        } transition-colors duration-200`}
      />
    </motion.button>
  )
} 