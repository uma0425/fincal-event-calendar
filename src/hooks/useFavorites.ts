import { useState, useEffect, useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ローカルストレージからお気に入りを読み込み
  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const stored = localStorage.getItem('favorites')
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (err) {
      setError('お気に入りの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // お気に入りを追加
  const addFavorite = useCallback(async (eventId: string) => {
    try {
      const newFavorites = [...favorites, eventId]
      setFavorites(newFavorites)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      return { success: true }
    } catch (err) {
      setError('お気に入りの追加に失敗しました')
      return { success: false, error: 'お気に入りの追加に失敗しました' }
    }
  }, [favorites])

  // お気に入りを削除
  const removeFavorite = useCallback(async (eventId: string) => {
    try {
      const newFavorites = favorites.filter(id => id !== eventId)
      setFavorites(newFavorites)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      return { success: true }
    } catch (err) {
      setError('お気に入りの削除に失敗しました')
      return { success: false, error: 'お気に入りの削除に失敗しました' }
    }
  }, [favorites])

  // お気に入りかどうかチェック
  const isFavorite = useCallback((eventId: string) => {
    return favorites.includes(eventId)
  }, [favorites])

  // お気に入りを再取得
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