'use client'

import { useState } from 'react'

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    organizer: '',
    place: '',
    fee: '',
    type: 'seminar',
    target: '',
    registerUrl: '',
    prefecture: '',
    maxParticipants: '',
    imageUrl: ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      // バリデーション
      if (!formData.title.trim()) {
        throw new Error('イベントタイトルは必須です')
      }
      if (!formData.description.trim()) {
        throw new Error('イベント説明は必須です')
      }
      if (!formData.startDate) {
        throw new Error('開始日は必須です')
      }
      if (!formData.organizer.trim()) {
        throw new Error('主催者は必須です')
      }

      // 画像アップロード処理（簡易版 - 実際はSupabase Storageを使用）
      let imageUrl = formData.imageUrl
      if (imageFile) {
        // 実際の実装ではSupabase Storageにアップロード
        // ここでは一時的にプレースホルダーURLを使用
        imageUrl = `https://via.placeholder.com/800x400/2563eb/ffffff?text=${encodeURIComponent(formData.title)}`
      }

      // フォームデータをAPIに送信
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl
        }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        alert('イベントが投稿されました！')
        // ホームページにリダイレクト
        window.location.href = '/'
      } else {
        throw new Error(result.error || '投稿に失敗しました')
      }
    } catch (error) {
      console.error('投稿エラー:', error)
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      
      // プレビュー表示
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">イベント投稿</h1>
        <p className="text-gray-600">新しいイベントを投稿してください</p>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* イベントタイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              イベントタイトル *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="イベントのタイトルを入力"
            />
          </div>

          {/* イベント説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              イベント説明 *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="イベントの詳細説明を入力"
            />
          </div>

          {/* イベント画像 */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              イベント画像
            </label>
            <div className="space-y-4">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="プレビュー"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="または画像URLを直接入力"
              />
            </div>
          </div>

          {/* 開催日時 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                開始日 *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                開始時刻
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                終了日
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                終了時刻
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 主催者・場所 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-2">
                主催者 *
              </label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                required
                value={formData.organizer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="主催者名または団体名"
              />
            </div>
            <div>
              <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-2">
                開催場所
              </label>
              <input
                type="text"
                id="place"
                name="place"
                value={formData.place}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="会場名またはオンライン"
              />
            </div>
          </div>

          {/* 参加費・イベントタイプ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">
                参加費
              </label>
              <input
                type="number"
                id="fee"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                イベントタイプ
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="seminar">セミナー</option>
                <option value="webinar">ウェビナー</option>
                <option value="meetup">ミートアップ</option>
                <option value="workshop">ワークショップ</option>
                <option value="other">その他</option>
              </select>
            </div>
          </div>

          {/* 対象者・申込URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-2">
                対象者
              </label>
              <input
                type="text"
                id="target"
                name="target"
                value={formData.target}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 開発者、学生、一般"
              />
            </div>
            <div>
              <label htmlFor="registerUrl" className="block text-sm font-medium text-gray-700 mb-2">
                申込URL
              </label>
              <input
                type="url"
                id="registerUrl"
                name="registerUrl"
                value={formData.registerUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* 都道府県・最大参加者数 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                都道府県
              </label>
              <input
                type="text"
                id="prefecture"
                name="prefecture"
                value={formData.prefecture}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 東京都"
              />
            </div>
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                最大参加者数
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="制限なし"
                min="1"
              />
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '投稿中...' : 'イベントを投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 