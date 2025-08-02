'use client'

import EventSubmitForm from '@/components/forms/EventSubmitForm'

export default function SubmitPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          イベント投稿
        </h1>
        <p className="text-lg text-gray-600">
          会計・ファイナンス関連のイベント情報を投稿してください。
          投稿後、モデレーターによる承認を経て公開されます。
        </p>
      </div>

      <EventSubmitForm />
    </div>
  )
} 