'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AccessibilityContextType {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'normal' | 'large' | 'extra-large'
  toggleReducedMotion: () => void
  toggleHighContrast: () => void
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'extra-large'>('normal')

  // ユーザーの設定を読み込み
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return

    // システム設定の確認
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    // ローカルストレージから設定を読み込み
    const savedHighContrast = localStorage.getItem('highContrast') === 'true'
    const savedFontSize = localStorage.getItem('fontSize') as 'normal' | 'large' | 'extra-large' || 'normal'
    
    setHighContrast(savedHighContrast)
    setFontSizeState(savedFontSize)

    // システム設定の変更を監視
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    return () => mediaQuery.removeEventListener('change', handleMotionChange)
  }, [])

  // 設定変更時の処理
  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion)
  }

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem('highContrast', newValue.toString())
  }

  const setFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    setFontSizeState(size)
    localStorage.setItem('fontSize', size)
  }

  // CSS変数とdata属性を設定
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return

    const root = document.documentElement
    root.style.setProperty('--reduced-motion', reducedMotion ? '1' : '0')
    root.style.setProperty('--high-contrast', highContrast ? '1' : '0')
    root.style.setProperty('--font-size', fontSize === 'large' ? '1.125' : fontSize === 'extra-large' ? '1.25' : '1')
    
    // data属性を設定
    root.setAttribute('data-reduced-motion', reducedMotion.toString())
    root.setAttribute('data-high-contrast', highContrast.toString())
    root.setAttribute('data-font-size', fontSize)
  }, [reducedMotion, highContrast, fontSize])

  return (
    <AccessibilityContext.Provider
      value={{
        reducedMotion,
        highContrast,
        fontSize,
        toggleReducedMotion,
        toggleHighContrast,
        setFontSize
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
} 