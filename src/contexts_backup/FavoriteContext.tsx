'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface FavoriteContextType {
  favorites: string[]
  addFavorite: (eventId: string) => void
  removeFavorite: (eventId: string) => void
  isFavorite: (eventId: string) => boolean
  toggleFavorite: (eventId: string) => void
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined)

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])

  // ローカルストレージからお気に入りを読み込み
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('お気に入りの読み込みに失敗しました:', error)
        setFavorites([])
      }
    }
  }, [])

  // お気に入りをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (eventId: string) => {
    if (!favorites.includes(eventId)) {
      setFavorites(prev => [...prev, eventId])
    }
  }

  const removeFavorite = (eventId: string) => {
    setFavorites(prev => prev.filter(id => id !== eventId))
  }

  const isFavorite = (eventId: string) => {
    return favorites.includes(eventId)
  }

  const toggleFavorite = (eventId: string) => {
    if (isFavorite(eventId)) {
      removeFavorite(eventId)
    } else {
      addFavorite(eventId)
    }
  }

  return (
    <FavoriteContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite
    }}>
      {children}
    </FavoriteContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoriteContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider')
  }
  return context
} 