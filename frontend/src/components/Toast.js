'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-900/30',
      border: 'border-green-500/20',
      text: 'text-green-400'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-900/30',
      border: 'border-red-500/20',
      text: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400'
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-blue-900/30',
      border: 'border-blue-500/20',
      text: 'text-blue-400'
    }
  }
  
  const { icon: Icon, bg, border, text } = typeConfig[type]
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl border ${border} ${bg} backdrop-blur-sm max-w-sm`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`font-medium ${text}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
              <p className="text-gray-300 text-sm mt-1">{message}</p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false)
                onClose?.()
              }}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}