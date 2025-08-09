'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingButton } from '@/components/LoadingStates'
import { validateAdminLogin } from '@/lib/validation'
import { handleFormError, retryOperation } from '@/lib/errorHandling'
import Logo from '@/components/Logo'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // パスワードの検証
      const validationResult = validateAdminLogin(password)
      if (!validationResult.isValid) {
        setError(validationResult.errors.join('\n'))
        return
      }

      // ログインリクエスト（リトライ機能付き）
      const response = await retryOperation(async () => {
        return fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password })
        })
      }, 3, 1000)

      if (response.ok) {
        // ログイン成功 - 少し待ってからリダイレクト
        setTimeout(() => {
          router.push('/admin')
        }, 100)
      } else {
        const data = await response.json()
        setError(data.error || 'ログインに失敗しました')
      }
    } catch (err) {
      const errorMessage = handleFormError(err as Error, 'admin-login')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={true} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">管理者ログイン</h2>
          <p className="text-gray-600 mt-2">管理者パスワードを入力してください</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="管理者パスワード"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <LoadingButton
              loading={loading}
              disabled={loading}
              className="w-full py-2 px-4 text-sm font-medium"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </LoadingButton>
          </div>
        </form>

        <div className="text-center">
          <a href="/" className="text-blue-600 hover:text-blue-500 text-sm">
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
} 