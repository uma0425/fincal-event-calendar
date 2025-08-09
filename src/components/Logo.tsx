import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  href?: string
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  href = '/'
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const LogoContent = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="FinCal"
        width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
        height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
        className={`${sizeClasses[size]} object-contain`}
        priority
      />
      {showText && (
        <span className={`font-bold text-blue-600 ${textSizes[size]}`}>
          FinCal
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
