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
  const [success, setSuccess] = useState(false)

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
      if (imageFile && !imageUrl) {
        // 画像ファイルがあるがURLがない場合は、プレースホルダーを使用
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
          imageUrl: imageUrl || null
        }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setSuccess(true)
        // 3秒後にホームページにリダイレクト
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      
      try {
        // 画像をアップロード
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // アップロードされた画像URLを設定
            setFormData(prev => ({
              ...prev,
              imageUrl: result.data.url
            }))
            setImagePreview(result.data.url)
          } else {
            throw new Error(result.error || '画像のアップロードに失敗しました')
          }
        } else {
          throw new Error('画像のアップロードに失敗しました')
        }
      } catch (error) {
        console.error('画像アップロードエラー:', error)
        alert('画像のアップロードに失敗しました: ' + (error instanceof Error ? error.message : 'エラーが発生しました'))
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿完了！</h2>
          <p className="text-gray-600 mb-4">イベントが正常に投稿されました。承認後に公開されます。</p>
          <div className="text-sm text-gray-500">
            3秒後にホームページに戻ります...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">FinCal</span>
            </div>
            <a
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タイトルセクション */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">イベントを投稿</h1>
          <p className="text-lg text-gray-600">新しいイベントを投稿して、みんなとシェアしましょう</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* フォーム */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* 基本情報セクション */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                基本情報
              </h2>

              {/* イベントタイトル */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  イベントタイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="魅力的なイベントタイトルを入力"
                />
              </div>

              {/* イベント説明 */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  イベント説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="イベントの詳細な説明を入力してください"
                />
              </div>

              {/* イベントタイプ */}
              <div className="mb-6">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  イベントタイプ
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="seminar">セミナー</option>
                  <option value="webinar">ウェビナー</option>
                  <option value="meetup">ミートアップ</option>
                  <option value="workshop">ワークショップ</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>

            {/* 日時・場所セクション */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                日時・場所
              </h2>

              {/* 開催日時 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    開始日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* 主催者・場所 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-2">
                    主催者 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="organizer"
                    name="organizer"
                    required
                    value={formData.organizer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="会場名またはオンライン"
                  />
                </div>
              </div>
            </div>

            {/* 詳細情報セクション */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                詳細情報
              </h2>

              {/* 参加費・対象者 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                    min="0"
                  />
                </div>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="例: 開発者、学生、一般"
                  />
                </div>
              </div>

              {/* 申込URL・最大参加者数 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="制限なし"
                    min="1"
                  />
                </div>
              </div>

              {/* 都道府県 */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="例: 東京都"
                />
              </div>
            </div>

            {/* 画像セクション */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                イベント画像
              </h2>

              {/* 画像アップロード */}
              <div className="mb-6">
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                  画像ファイル
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="imageFile" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 font-medium">画像をアップロード</p>
                    <p className="text-sm text-gray-500 mt-1">またはクリックしてファイルを選択</p>
                  </label>
                </div>
              </div>

              {/* 画像URL */}
              <div className="mb-6">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  または画像URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* 画像プレビュー */}
              {imagePreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プレビュー
                  </label>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    投稿中...
                  </div>
                ) : (
                  'イベントを投稿'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 