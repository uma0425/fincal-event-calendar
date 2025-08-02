'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            認証エラー
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            認証処理中にエラーが発生しました。
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  エラー詳細
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message}</p>
                  {error.digest && (
                    <p className="mt-1 text-xs">
                      エラーID: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={reset}
              className="flex-1 btn btn-primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </button>
            <Link
              href="/auth/signin"
              className="flex-1 btn btn-outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              サインインに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 