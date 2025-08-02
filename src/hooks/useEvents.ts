import { useState, useEffect, useCallback } from 'react'
import { Event } from '@/types'

interface UseEventsOptions {
  status?: string
  type?: string
  limit?: number
  offset?: number
}

interface UseEventsReturn {
  events: Event[]
  loading: boolean
  error: string | null
  refetch: () => void
  hasMore: boolean
  loadMore: () => void
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(options.offset || 0)

  const fetchEvents = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status) params.append('status', options.status)
      if (options.type) params.append('type', options.type)
      params.append('limit', (options.limit || 50).toString())
      params.append('offset', (isLoadMore ? offset : 0).toString())

      const response = await fetch(`/api/events?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'イベントの取得に失敗しました')
      }

      if (isLoadMore) {
        setEvents(prev => [...prev, ...result.data])
      } else {
        setEvents(result.data)
      }

      setHasMore(result.data.length === (options.limit || 50))
      if (isLoadMore) {
        setOffset(prev => prev + (options.limit || 50))
      } else {
        setOffset(options.limit || 50)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'イベントの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [options.status, options.type, options.limit, offset])

  const refetch = useCallback(() => {
    setOffset(0)
    fetchEvents(false)
  }, [fetchEvents])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchEvents(true)
    }
  }, [loading, hasMore, fetchEvents])

  useEffect(() => {
    fetchEvents(false)
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    refetch,
    hasMore,
    loadMore
  }
} 