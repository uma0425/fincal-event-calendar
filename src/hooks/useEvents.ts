import { useState, useEffect, useCallback } from 'react'
import { Event } from '@/types'
import { demoEvents } from '@/lib/demoData'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  // 一時的にデモデータを使用
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // デモデータを返す
      setEvents(demoEvents)
      setHasMore(false)
    } catch (err) {
      setError('イベントの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    setOffset(0)
    fetchEvents()
  }, [fetchEvents])

  const loadMore = useCallback(async () => {
    // 一時的に実装なし
    setHasMore(false)
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    hasMore,
    refetch,
    loadMore
  }
} 