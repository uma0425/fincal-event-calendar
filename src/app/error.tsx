'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
          <p className="text-gray-600 mb-4">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">エラー詳細:</h2>
          <p className="text-sm text-gray-600 font-mono break-all">
            {error.message || '不明なエラー'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mt-2">
              エラーID: {error.digest}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
} 