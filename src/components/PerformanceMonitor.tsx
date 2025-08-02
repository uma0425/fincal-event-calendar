'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  useEffect(() => {
    // 既存のパフォーマンスエントリを確認
    const checkExistingEntries = () => {
      // FCP
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
      }

      // LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length > 0) {
        const lastLcpEntry = lcpEntries[lcpEntries.length - 1]
        setMetrics(prev => ({ ...prev, lcp: lastLcpEntry.startTime }))
      }

      // CLS
      const layoutShiftEntries = performance.getEntriesByType('layout-shift')
      let clsValue = 0
      layoutShiftEntries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      if (clsValue > 0) {
        setMetrics(prev => ({ ...prev, cls: clsValue }))
      }
    }

    // 初期チェック
    checkExistingEntries()

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        const firstInputEntry = entry as PerformanceEventTiming
        if (firstInputEntry.processingStart && firstInputEntry.startTime) {
          const fid = firstInputEntry.processingStart - firstInputEntry.startTime
          setMetrics(prev => ({ ...prev, fid }))
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      setMetrics(prev => ({ ...prev, cls: clsValue }))
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Time to First Byte (TTFB)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      setMetrics(prev => ({ ...prev, ttfb }))
    }

    // タイムアウト処理（5秒後に強制更新）
    const timeout = setTimeout(() => {
      checkExistingEntries()
    }, 5000)

    return () => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
      clearTimeout(timeout)
    }
  }, [])

  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getMetricColor = (metric: string, value: number | null) => {
    if (value === null) return 'text-gray-400'
    
    switch (metric) {
      case 'fcp':
        return value < 1800 ? 'text-green-400' : value < 3000 ? 'text-yellow-400' : 'text-red-400'
      case 'lcp':
        return value < 2500 ? 'text-green-400' : value < 4000 ? 'text-yellow-400' : 'text-red-400'
      case 'fid':
        return value < 100 ? 'text-green-400' : value < 300 ? 'text-yellow-400' : 'text-red-400'
      case 'cls':
        return value < 0.1 ? 'text-green-400' : value < 0.25 ? 'text-yellow-400' : 'text-red-400'
      case 'ttfb':
        return value < 800 ? 'text-green-400' : value < 1800 ? 'text-yellow-400' : 'text-red-400'
      default:
        return 'text-white'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono z-50 shadow-lg">
      <div className="font-bold mb-2 text-sm">Performance Metrics</div>
      <div className="space-y-1">
        <div className={getMetricColor('fcp', metrics.fcp)}>
          FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'Loading...'}
        </div>
        <div className={getMetricColor('lcp', metrics.lcp)}>
          LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Loading...'}
        </div>
        <div className={getMetricColor('fid', metrics.fid)}>
          FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'Loading...'}
        </div>
        <div className={getMetricColor('cls', metrics.cls)}>
          CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'Loading...'}
        </div>
        <div className={getMetricColor('ttfb', metrics.ttfb)}>
          TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'Loading...'}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
        <div>🟢 Good | 🟡 Needs Improvement | 🔴 Poor</div>
      </div>
    </div>
  )
} 