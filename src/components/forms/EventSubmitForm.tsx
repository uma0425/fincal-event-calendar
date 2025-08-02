'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, MapPin, User, DollarSign, Users, FileText, Upload, Plus, X } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

const eventSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().min(1, '説明は必須です').max(1000, '説明は1000文字以内で入力してください'),
  startAt: z.string().min(1, '開始日時は必須です'),
  endAt: z.string().min(1, '終了日時は必須です'),
  type: z.enum(['seminar', 'meetup', 'workshop', 'webinar']),
  organizer: z.string().min(1, '主催者は必須です').max(100, '主催者は100文字以内で入力してください'),
  place: z.string().min(1, '場所は必須です').max(200, '場所は200文字以内で入力してください'),
  registerUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  fee: z.number().min(0, '料金は0以上で入力してください').optional(),
  target: z.array(z.string()).min(1, '対象者は1つ以上入力してください'),
  prefecture: z.string().min(1, '都道府県は必須です'),
})

type EventFormData = z.infer<typeof eventSchema>

export default function EventSubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [targetInput, setTargetInput] = useState('')
  const { addNotification } = useNotification()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startAt: '',
      endAt: '',
      type: 'seminar',
      organizer: '',
      place: '',
      registerUrl: '',
      fee: undefined,
      target: [],
      prefecture: '',
    }
  })

  const watchedTarget = watch('target', [])

  // 開始日時の値を監視して終了日時を自動設定
  const watchedStartAt = watch('startAt')
  const watchedEndAt = watch('endAt')

  // 開始日時が変更されたときに終了日時を自動設定
  useEffect(() => {
    if (watchedStartAt) {
      const startDate = new Date(watchedStartAt)
      
      // 終了日時が設定されていない場合、または終了日時が開始日時より前の場合
      if (!watchedEndAt || new Date(watchedEndAt) <= startDate) {
        // 開始日時から1時間後、分数は00に設定
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1時間後
        endDate.setMinutes(0) // 分数を00にリセット
        
        // ローカルタイムゾーンでISO文字列を作成
        const year = endDate.getFullYear()
        const month = (endDate.getMonth() + 1).toString().padStart(2, '0')
        const day = endDate.getDate().toString().padStart(2, '0')
        const hours = endDate.getHours().toString().padStart(2, '0')
        const minutes = endDate.getMinutes().toString().padStart(2, '0')
        
        const endAtValue = `${year}-${month}-${day}T${hours}:${minutes}`
        setValue('endAt', endAtValue)
      }
    }
  }, [watchedStartAt, watchedEndAt, setValue])

  // 対象者を追加
  const addTarget = useCallback(() => {
    if (targetInput.trim() && !watchedTarget.includes(targetInput.trim())) {
      setValue('target', [...watchedTarget, targetInput.trim()])
      setTargetInput('')
    }
  }, [targetInput, watchedTarget, setValue])

  // 対象者を削除
  const removeTarget = useCallback((index: number) => {
    setValue('target', watchedTarget.filter((_, i) => i !== index))
  }, [watchedTarget, setValue])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedImageUrl(data.url)
        addNotification({
          title: '画像がアップロードされました',
          type: 'success'
        })
      } else {
        throw new Error('アップロードに失敗しました')
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      addNotification({
        title: '画像のアップロードに失敗しました',
        type: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      const eventData = { ...data, imageUrl: uploadedImageUrl || undefined }
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        addNotification({
          title: 'イベントが投稿されました！',
          message: '承認をお待ちください。',
          type: 'success'
        })
        reset()
        setUploadedImageUrl('')
        setTargetInput('')
      } else {
        throw new Error('投稿に失敗しました')
      }
    } catch (error) {
      console.error('投稿エラー:', error)
      addNotification({
        title: 'イベントの投稿に失敗しました',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-labelledby="form-title">
          <h2 id="form-title" className="sr-only">イベント投稿フォーム</h2>
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            基本情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">イベントタイトル *</label>
              <input 
                type="text" 
                {...register('title')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                placeholder="イベントのタイトルを入力" 
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">イベントタイプ *</label>
              <select 
                {...register('type')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="seminar">セミナー</option>
                <option value="meetup">勉強会</option>
                <option value="workshop">ワークショップ</option>
                <option value="webinar">ウェビナー</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">イベント説明 *</label>
            <textarea 
              {...register('description')} 
              rows={4} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="イベントの詳細な説明を入力してください" 
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* 日時・場所 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            日時・場所
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日時 *</label>
              <input 
                type="datetime-local" 
                {...register('startAt')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              />
              {errors.startAt && (
                <p className="text-red-500 text-sm mt-1">{errors.startAt.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日時 *</label>
              <input 
                type="datetime-local" 
                {...register('endAt')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              />
              {errors.endAt && (
                <p className="text-red-500 text-sm mt-1">{errors.endAt.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主催者 *</label>
              <input 
                type="text" 
                {...register('organizer')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                placeholder="主催者名または団体名" 
              />
              {errors.organizer && (
                <p className="text-red-500 text-sm mt-1">{errors.organizer.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">場所 *</label>
              <input 
                type="text" 
                {...register('place')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                placeholder="会場名またはオンライン" 
              />
              {errors.place && (
                <p className="text-red-500 text-sm mt-1">{errors.place.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">都道府県 *</label>
              <select 
                {...register('prefecture')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">選択してください</option>
                <option value="全国">全国</option>
                <option value="北海道">北海道</option>
                <option value="青森県">青森県</option>
                <option value="岩手県">岩手県</option>
                <option value="宮城県">宮城県</option>
                <option value="秋田県">秋田県</option>
                <option value="山形県">山形県</option>
                <option value="福島県">福島県</option>
                <option value="茨城県">茨城県</option>
                <option value="栃木県">栃木県</option>
                <option value="群馬県">群馬県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="新潟県">新潟県</option>
                <option value="富山県">富山県</option>
                <option value="石川県">石川県</option>
                <option value="福井県">福井県</option>
                <option value="山梨県">山梨県</option>
                <option value="長野県">長野県</option>
                <option value="岐阜県">岐阜県</option>
                <option value="静岡県">静岡県</option>
                <option value="愛知県">愛知県</option>
                <option value="三重県">三重県</option>
                <option value="滋賀県">滋賀県</option>
                <option value="京都府">京都府</option>
                <option value="大阪府">大阪府</option>
                <option value="兵庫県">兵庫県</option>
                <option value="奈良県">奈良県</option>
                <option value="和歌山県">和歌山県</option>
                <option value="鳥取県">鳥取県</option>
                <option value="島根県">島根県</option>
                <option value="岡山県">岡山県</option>
                <option value="広島県">広島県</option>
                <option value="山口県">山口県</option>
                <option value="徳島県">徳島県</option>
                <option value="香川県">香川県</option>
                <option value="愛媛県">愛媛県</option>
                <option value="高知県">高知県</option>
                <option value="福岡県">福岡県</option>
                <option value="佐賀県">佐賀県</option>
                <option value="長崎県">長崎県</option>
                <option value="熊本県">熊本県</option>
                <option value="大分県">大分県</option>
                <option value="宮崎県">宮崎県</option>
                <option value="鹿児島県">鹿児島県</option>
                <option value="沖縄県">沖縄県</option>
              </select>
              {errors.prefecture && (
                <p className="text-red-500 text-sm mt-1">{errors.prefecture.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">申込URL</label>
              <input 
                type="url" 
                {...register('registerUrl')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                placeholder="https://example.com/register" 
              />
              {errors.registerUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.registerUrl.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 料金・対象者 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            料金・対象者
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">参加料金（円）</label>
              <input 
                type="number" 
                {...register('fee', { valueAsNumber: true })} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                placeholder="0" 
                min="0" 
              />
              {errors.fee && (
                <p className="text-red-500 text-sm mt-1">{errors.fee.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">対象者 *</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTarget())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="対象者を入力（例：会計士）"
                  />
                  <button
                    type="button"
                    onClick={addTarget}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {watchedTarget.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedTarget.map((target, index) => (
                      <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {target}
                        <button
                          type="button"
                          onClick={() => removeTarget(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {errors.target && (
                <p className="text-red-500 text-sm mt-1">{errors.target.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 画像アップロード */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            イベント画像
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画像ファイル</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                disabled={isUploading} 
              />
              {isUploading && (
                <p className="text-blue-600 text-sm mt-1">アップロード中...</p>
              )}
            </div>
            {uploadedImageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">プレビュー</label>
                <div className="relative w-48 h-32">
                  <img 
                    src={uploadedImageUrl} 
                    alt="アップロードされた画像" 
                    className="w-full h-full object-cover rounded-md" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => {
              reset()
              setUploadedImageUrl('')
              setTargetInput('')
            }} 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            クリア
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '投稿中...' : 'イベントを投稿'}
          </button>
        </div>
      </form>
    </div>
  )
} 