'use client'

import { useEffect } from 'react'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            管理者ダッシュボードエラー
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            管理者ダッシュボードでエラーが発生しました
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">エラー詳細</h3>
              <p className="text-sm text-gray-600">
                {error.message || '不明なエラーが発生しました'}
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={reset}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                再試行
              </button>
              
              <a
                href="/"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 