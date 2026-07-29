import clsx from 'clsx'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

type Type = 'success' | 'error' | 'warning' | 'info' | 'danger'

interface AlertProps {
  type: Type
  title: string
  message?: string
  onClose?: () => void
}

const styles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    title: 'text-amber-900',
    message: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-800',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-800',
  },
}

export default function Alert({ type, title, message, onClose }: AlertProps) {
  const style = styles[type]
  const Icon = style.icon

  return (
    <div className={clsx('rounded-lg border p-4', style.bg, style.border)}>
      <div className="flex gap-3">
        <Icon className={clsx('h-5 w-5 flex-shrink-0', style.iconColor)} />
        <div className="flex-1">
          <h3 className={clsx('font-semibold', style.title)}>{title}</h3>
          {message && <p className={clsx('mt-1 text-sm', style.message)}>{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
