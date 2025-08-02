'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, Save, Clock, MapPin, Users, DollarSign, Heart, SortAsc, SortDesc } from 'lucide-react'
import { FilterState } from '@/types/filter'
import { useFavorites } from '@/contexts/FavoriteContext'

interface EventFilterProps {
  onFilterChange: (filters: FilterState) => void
}

const eventTypes = [
  { value: 'seminar', label: 'セミナー' },
  { value: 'meetup', label: '勉強会' },
  { value: 'workshop', label: 'ワークショップ' },
  { value: 'webinar', label: 'ウェビナー' }
]

const prefectures = [
  '全国', '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

const targetAudiences = [
  '会計士', '税理士', '経理担当者', '経営者', '学生', 'その他'
]

export default function EventFilter({ onFilterChange }: EventFilterProps) {
  const { favorites } = useFavorites()
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    types: [],
    prefecture: '',
    organizer: '',
    place: '',
    feeRange: { min: null, max: null },
    dateRange: { start: '', end: '' },
    favoritesOnly: false,
    categories: [],
    participationFormat: [],
    datePeriod: [],
    sortBy: 'date',
    sortOrder: 'asc'
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: FilterState }>>([])

  // フィルター変更時に親コンポーネントに通知
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  // ローカルストレージから検索履歴と保存されたフィルターを読み込み
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }

    const saved = localStorage.getItem('savedFilters')
    if (saved) {
      setSavedFilters(JSON.parse(saved))
    }
  }, [])

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value }
    setFilters(newFilters)

    // 検索履歴に追加
    if (value.trim()) {
      const newHistory = [value, ...searchHistory.filter(h => h !== value)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }
  }

  const handleTypeChange = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    setFilters({ ...filters, types: newTypes })
  }

  const handlePrefectureChange = (prefecture: string) => {
    setFilters({ ...filters, prefecture })
  }

  const handleTargetChange = (target: string) => {
    const newTargets = filters.target?.includes(target)
      ? filters.target.filter(t => t !== target)
      : [...(filters.target || []), target]
    setFilters({ ...filters, target: newTargets })
  }

  const handleFeeRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value)
    setFilters({
      ...filters,
      feeRange: { ...filters.feeRange, [field]: numValue }
    })
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setFilters({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value }
    })
  }

  const handleFavoritesOnlyChange = (checked: boolean) => {
    setFilters({ ...filters, favoritesOnly: checked })
  }

  const handleSortChange = (sortBy: 'date' | 'title' | 'fee' | 'popularity') => {
    setFilters({ ...filters, sortBy })
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    setFilters({ ...filters, sortOrder })
  }

  const resetFilters = () => {
    const newFilters: FilterState = {
      search: '',
      types: [],
      prefecture: '',
      organizer: '',
      place: '',
      feeRange: { min: null, max: null },
      dateRange: { start: '', end: '' },
      favoritesOnly: false,
      categories: [],
      participationFormat: [],
      datePeriod: [],
      sortBy: 'date',
      sortOrder: 'asc'
    }
    setFilters(newFilters)
  }

  const saveCurrentFilter = () => {
    const name = prompt('フィルター名を入力してください:')
    if (name) {
      const newSavedFilters = [...savedFilters, { name, filters }]
      setSavedFilters(newSavedFilters)
      localStorage.setItem('savedFilters', JSON.stringify(newSavedFilters))
    }
  }

  const loadSavedFilter = (savedFilter: FilterState) => {
    setFilters(savedFilter)
  }

  const removeSavedFilter = (index: number) => {
    const newSavedFilters = savedFilters.filter((_, i) => i !== index)
    setSavedFilters(newSavedFilters)
    localStorage.setItem('savedFilters', JSON.stringify(newSavedFilters))
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.types.length > 0) count++
    if (filters.prefecture) count++
    if (filters.organizer) count++
    if (filters.place) count++
    if (filters.feeRange.min !== null || filters.feeRange.max !== null) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.favoritesOnly) count++
    if (filters.categories && filters.categories.length > 0) count++
    if (filters.participationFormat && filters.participationFormat.length > 0) count++
    if (filters.datePeriod && filters.datePeriod.length > 0) count++
    return count
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 検索ボックス */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="キーワードで検索"
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
        
        {/* 検索履歴 */}
        {searchHistory.length > 0 && filters.search === '' && (
          <div className="mt-2 space-y-1">
            {searchHistory.slice(0, 5).map((term, index) => (
              <button
                key={index}
                onClick={() => handleSearch(term)}
                className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* お気に入りフィルター */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(e) => handleFavoritesOnlyChange(e.target.checked)}
            className="mr-2"
          />
          <Heart className="w-4 h-4 mr-2 text-red-500" />
          <span className="text-sm text-gray-700">お気に入りのみ表示</span>
          {favorites.length > 0 && (
            <span className="ml-auto text-xs text-gray-500 hidden sm:inline">({favorites.length}件)</span>
          )}
        </label>
      </div>

      {/* ソート機能 */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">並び順</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-sm text-gray-700 mb-1">並び順</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'date' | 'title' | 'fee' | 'popularity')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="date">開催日時</option>
              <option value="title">タイトル</option>
              <option value="fee">料金</option>
              <option value="popularity">人気度</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSortOrderChange('asc')}
              className={`flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-md border ${
                filters.sortOrder === 'asc'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SortAsc className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              <span className="hidden sm:inline">昇順</span>
              <span className="sm:hidden">↑</span>
            </button>
            <button
              onClick={() => handleSortOrderChange('desc')}
              className={`flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-md border ${
                filters.sortOrder === 'desc'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SortDesc className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              <span className="hidden sm:inline">降順</span>
              <span className="sm:hidden">↓</span>
            </button>
          </div>
        </div>
      </div>

      {/* タグで絞り込む */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">タグで絞り込む</h4>
        <div className="space-y-2">
          {eventTypes.map((type) => (
            <label key={type.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.types.includes(type.value)}
                onChange={() => handleTypeChange(type.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 詳細フィルター */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Filter className="w-4 h-4 mr-1" />
          詳細フィルター
        </button>
        
        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
            {/* 都道府県 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">都道府県</label>
              <select
                value={filters.prefecture}
                onChange={(e) => handlePrefectureChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {prefectures.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </div>

            {/* 対象者 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">対象者</label>
              <div className="space-y-2">
                {targetAudiences.map((audience) => (
                  <label key={audience} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.target?.includes(audience) || false}
                      onChange={() => handleTargetChange(audience)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{audience}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 料金範囲 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">料金範囲</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="最小"
                  value={filters.feeRange.min || ''}
                  onChange={(e) => handleFeeRangeChange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">〜</span>
                <input
                  type="number"
                  placeholder="最大"
                  value={filters.feeRange.max || ''}
                  onChange={(e) => handleFeeRangeChange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 日付範囲 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">開催期間</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 保存されたフィルター */}
      {savedFilters.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">保存されたフィルター</h4>
          <div className="space-y-2">
            {savedFilters.map((saved, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <button
                  onClick={() => loadSavedFilter(saved.filters)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {saved.name}
                </button>
                <button
                  onClick={() => removeSavedFilter(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="space-y-2">
        <button
          onClick={saveCurrentFilter}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          現在のフィルターを保存
        </button>
        
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          すべてリセット
        </button>
      </div>

      {/* アクティブフィルター表示 */}
      {getActiveFilterCount() > 0 && (
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            アクティブなフィルター: {getActiveFilterCount()}件
          </p>
        </div>
      )}
    </div>
  )
} 