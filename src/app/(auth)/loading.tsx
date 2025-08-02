import { Loader2 } from 'lucide-react'

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-sm text-gray-600">認証処理中...</p>
        </div>
      </div>
    </div>
  )
} 