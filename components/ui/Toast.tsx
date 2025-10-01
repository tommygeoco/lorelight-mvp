'use client'

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useToastStore, type Toast as ToastType } from '@/store/toastStore'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: ToastType
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { type, message } = toast

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-400/20'
      case 'error':
        return 'border-red-400/20'
      case 'warning':
        return 'border-yellow-400/20'
      case 'info':
      default:
        return 'border-blue-400/20'
    }
  }

  return (
    <div
      className={`bg-[#191919] border ${getBorderColor()} rounded-[8px] p-4 shadow-2xl animate-in slide-in-from-right-full duration-300 flex items-start gap-3 min-w-[320px]`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 text-sm text-white">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-6 h-6 rounded-[4px] hover:bg-white/5 flex items-center justify-center transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-white/70" />
      </button>
    </div>
  )
}
