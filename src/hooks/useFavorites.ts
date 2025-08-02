import { useState, useEffect, useCallback } from 'react'
import { Event } from '@/types'

interface UseFavoritesReturn {
  favorites: Event[]
  loading: boolean
  error: string | null
  addFavorite: (eventId: string) => Promise<void>
  removeFavorite: (eventId: string) => Promise<void>
  isFavorite: (eventId: string) => boolean
  refetch: () => void
}

export function useFavorites(userId: string): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/favorites?userId=${userId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'お気に入りの取得に失敗しました')
      }

      setFavorites(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お気に入りの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const addFavorite = useCallback(async (eventId: string) => {
    if (!userId) return

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, eventId }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'お気に入りの追加に失敗しました')
      }

      // お気に入りリストを更新
      await fetchFavorites()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お気に入りの追加に失敗しました')
    }
  }, [userId, fetchFavorites])

  const removeFavorite = useCallback(async (eventId: string) => {
    if (!userId) return

    try {
      const response = await fetch(`/api/favorites?userId=${userId}&eventId=${eventId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'お気に入りの削除に失敗しました')
      }

      // お気に入りリストを更新
      await fetchFavorites()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お気に入りの削除に失敗しました')
    }
  }, [userId, fetchFavorites])

  const isFavorite = useCallback((eventId: string) => {
    return favorites.some(event => event.id === eventId)
  }, [favorites])

  const refetch = useCallback(() => {
    fetchFavorites()
  }, [fetchFavorites])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch
  }
} 