'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MicroInteractionProps {
  children: ReactNode
  type?: 'bounce' | 'pulse' | 'shake' | 'wiggle'
  trigger?: 'hover' | 'click' | 'always'
  delay?: number
}

export default function MicroInteraction({ 
  children, 
  type = 'bounce',
  trigger = 'hover',
  delay = 0 
}: MicroInteractionProps) {
  const variants = {
    bounce: {
      hover: {
        y: [-2, 0, -2],
        transition: {
          duration: 0.6,
          ease: 'easeInOut' as const
        }
      },
      click: {
        scale: [1, 0.95, 1],
        transition: {
          duration: 0.2
        }
      }
    },
    pulse: {
      hover: {
        scale: [1, 1.05, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut' as const
        }
      },
      click: {
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.15
        }
      }
    },
    shake: {
      hover: {
        x: [-2, 2, -2, 2, 0],
        transition: {
          duration: 0.4
        }
      },
      click: {
        rotate: [-2, 2, -2, 2, 0],
        transition: {
          duration: 0.3
        }
      }
    },
    wiggle: {
      hover: {
        rotate: [-3, 3, -3, 3, 0],
        transition: {
          duration: 0.5
        }
      },
      click: {
        scale: [1, 0.95, 1],
        transition: {
          duration: 0.2
        }
      }
    }
  }

  const getAnimationProps = () => {
    const baseProps = {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { delay, duration: 0.3 }
    }

    if (trigger === 'hover') {
      return {
        ...baseProps,
        whileHover: variants[type].hover,
        whileTap: variants[type].click
      }
    } else if (trigger === 'click') {
      return {
        ...baseProps,
        whileTap: variants[type].click
      }
    } else {
      return {
        ...baseProps,
        animate: {
          ...baseProps.animate,
          ...variants[type].hover
        }
      }
    }
  }

  return (
    <motion.div {...getAnimationProps()}>
      {children}
    </motion.div>
  )
} 