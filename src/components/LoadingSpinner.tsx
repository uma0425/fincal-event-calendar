'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear' as const
      }
    }
  }

  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* スピナーアニメーション */}
      <motion.div
        className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full ${colorClasses[color]}`}
        variants={spinnerVariants}
        animate="animate"
      />
      
      {/* ドットアニメーション */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full bg-current ${colorClasses[color].replace('border-', 'bg-')}`}
            variants={dotVariants}
            animate="animate"
            transition={{
              delay: index * 0.2
            }}
          />
        ))}
      </div>

      {/* テキスト */}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-600 animate-pulse"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
} 