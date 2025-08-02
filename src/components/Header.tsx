'use client'

import Link from 'next/link'
import { Menu, X, Settings, Heart } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'
import { useFavorites } from '@/contexts/FavoriteContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { favorites } = useFavorites()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* スキップリンク */}
      <a href="#main-content" className="skip-link">
        メインコンテンツにスキップ
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo size="sm" className="sm:hidden" />
              <Logo size="md" className="hidden sm:block" />
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
            >
              カレンダー
            </Link>
            <Link 
              href="/favorites" 
              className="relative text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
            >
              <Heart className="h-4 w-4 lg:h-5 lg:w-5 inline mr-1" />
              お気に入り
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link 
              href="/submit" 
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
            >
              イベント投稿
            </Link>
            <Link 
              href="/admin" 
              className="inline-flex items-center px-2 lg:px-3 py-2 border border-gray-300 shadow-sm text-xs lg:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden lg:inline">管理者</span>
              <span className="lg:hidden">管理</span>
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">メニューを開く</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mobile-nav">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                カレンダー
              </Link>
              <Link
                href="/favorites"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    お気に入り
                  </div>
                  {favorites.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </div>
              </Link>
              <Link
                href="/submit"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                イベント投稿
              </Link>
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                管理者ダッシュボード
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 