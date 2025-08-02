'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* カレンダーアイコン */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* カレンダーのフック */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
        </div>
        
        {/* カレンダーの本体 */}
        <div className="w-full h-full bg-blue-500 rounded-lg relative overflow-hidden">
          {/* ドル記号のグラデーション */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-white text-shadow-sm" style={{
              background: 'linear-gradient(to bottom, #60A5FA, #0F766E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: size === 'sm' ? '12px' : size === 'md' ? '16px' : '24px'
            }}>
              $
            </span>
          </div>
        </div>
      </div>

      {/* テキストロゴ */}
      <div className={`font-bold ${textSizes[size]}`}>
        <span className="text-blue-400">Fin</span>
        <span className="text-teal-700">Cal</span>
      </div>
    </div>
  )
} 