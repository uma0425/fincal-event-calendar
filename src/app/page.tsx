export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-2">
          FinCal - イベントカレンダー
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          最新のイベント情報をカレンダー形式で確認できます。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">イベント一覧</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">Next.js開発者向けセミナー</h3>
            <p className="text-gray-600 mt-2">Next.js 14の新機能について学ぶセミナーです。</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>開催日: 2024年1月15日</span>
              <span className="ml-4">主催: Next.jsコミュニティ</span>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">React Hooks勉強会</h3>
            <p className="text-gray-600 mt-2">React Hooksの実践的な使い方を学ぶ勉強会です。</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>開催日: 2024年1月20日</span>
              <span className="ml-4">主催: React開発者グループ</span>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">TypeScript入門ワークショップ</h3>
            <p className="text-gray-600 mt-2">TypeScriptの基礎から応用まで学ぶワークショップです。</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>開催日: 2024年1月25日</span>
              <span className="ml-4">主催: TypeScript勉強会</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 