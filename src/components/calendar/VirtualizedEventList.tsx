'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { Event } from '@/types'
import EventCard from './EventCard'

interface VirtualizedEventListProps {
  events: Event[]
  itemHeight?: number
  containerHeight?: number
}

export default function VirtualizedEventList({ 
  events, 
  itemHeight = 400, 
  containerHeight = 600 
}: VirtualizedEventListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 表示するアイテムの計算
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      events.length
    )
    
    return {
      startIndex,
      endIndex,
      items: events.slice(startIndex, endIndex)
    }
  }, [events, scrollTop, itemHeight, containerHeight])

  // スクロールハンドラー
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  // スクロール位置の監視
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScrollEvent = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener('scroll', handleScrollEvent)
    return () => container.removeEventListener('scroll', handleScrollEvent)
  }, [])

  const totalHeight = events.length * itemHeight
  const offsetY = visibleItems.startIndex * itemHeight

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.items.map((event, index) => (
            <div 
              key={event.id}
              style={{ height: itemHeight }}
              className="mb-4"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 