'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Eye, Type, Zap } from 'lucide-react'
import { useAccessibility } from './AccessibilityProvider'

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true)
  }, [])

  const { 
    reducedMotion, 
    highContrast, 
    fontSize,
    toggleReducedMotion, 
    toggleHighContrast, 
    setFontSize 
  } = useAccessibility()

  // サーバーサイドレンダリング時は何も表示しない
  if (!isClient) {
    return null
  }

  return (
    <>
      {/* アクセシビリティボタン */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="アクセシビリティ設定を開く"
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* 設定パネル */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                アクセシビリティ設定
              </h3>

              <div className="space-y-4">
                {/* アニメーション設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">アニメーション軽減</span>
                  </div>
                  <button
                    onClick={toggleReducedMotion}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    aria-label={`アニメーション軽減を${reducedMotion ? '無効' : '有効'}にする`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 高コントラスト設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">高コントラスト</span>
                  </div>
                  <button
                    onClick={toggleHighContrast}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      highContrast ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    aria-label={`高コントラストを${highContrast ? '無効' : '有効'}にする`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* フォントサイズ設定 */}
                <div>
                  <div className="flex items-center mb-2">
                    <Type className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">フォントサイズ</span>
                  </div>
                  <div className="flex space-x-2">
                    {(['normal', 'large', 'extra-large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          fontSize === size
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-label={`フォントサイズを${size === 'normal' ? '標準' : size === 'large' ? '大' : '特大'}にする`}
                      >
                        {size === 'normal' ? '標準' : size === 'large' ? '大' : '特大'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* キーボードショートカット説明 */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">キーボードショートカット</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> - フォーカス移動</div>
                    <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> / <kbd className="px-1 py-0.5 bg-gray-100 rounded">Space</kbd> - 選択</div>
                    <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> - 閉じる</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 