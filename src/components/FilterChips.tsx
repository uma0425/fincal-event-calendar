'use client';

import { memo } from 'react';

interface FilterChipProps {
  filters: Array<{ type: string; value: string; label: string }>;
  onRemove: (type: string, value: string) => void;
  onClearAll: () => void;
}

const FilterChips = memo(function FilterChips({ filters, onRemove, onClearAll }: FilterChipProps) {
  if (filters.length === 0) return null;

  const getFilterColor = (type: string) => {
    switch (type) {
      case 'category':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'date':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'prefecture':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'search':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">アクティブフィルター</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          すべてクリア
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <div
            key={`${filter.type}-${filter.value}-${index}`}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getFilterColor(filter.type)}`}
          >
            <span>{filter.label}</span>
            <button
              onClick={() => onRemove(filter.type, filter.value)}
              className="ml-2 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default FilterChips;
