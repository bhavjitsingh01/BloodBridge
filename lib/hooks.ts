import { useState, useCallback } from 'react'

// Generate unique ID
export function useGenerateId() {
  return useCallback((prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])
}

// Form state management
export interface FormErrors {
  [key: string]: string
}

export function useFormState<T>(initialValues: T) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setValues(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    resetForm,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
  }
}

// Form validation
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export function useValidation() {
  return {
    validate: (values: any, rules: Record<string, ValidationRule>) => {
      const errors: FormErrors = {}

      Object.keys(rules).forEach(field => {
        const rule = rules[field]
        const value = values[field]

        if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
          errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        }

        if (value && rule.minLength && value.length < rule.minLength) {
          errors[field] = `${field} must be at least ${rule.minLength} characters`
        }

        if (value && rule.maxLength && value.length > rule.maxLength) {
          errors[field] = `${field} must be less than ${rule.maxLength} characters`
        }

        if (value && rule.pattern && !rule.pattern.test(value)) {
          errors[field] = `${field} is invalid`
        }

        if (rule.custom) {
          const error = rule.custom(value)
          if (error) errors[field] = error
        }
      })

      return errors
    },
  }
}

// Toast notifications
export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 3000
  ) => {
    const id = `toast-${Date.now()}`
    const toast: Toast = { id, type, message, duration }

    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

// Modal management
export function useModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<any>(null)

  const open = useCallback((modalData?: any) => {
    setData(modalData)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => setData(null), 300)
  }, [])

  return { isOpen, data, open, close }
}

// Table management
export interface TableState {
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number
}

export function useTable(initialPageSize = 10) {
  const [tableState, setTableState] = useState<TableState>({
    search: '',
    sortBy: '',
    sortOrder: 'asc',
    page: 1,
    pageSize: initialPageSize,
  })

  const setSearch = useCallback((search: string) => {
    setTableState(prev => ({ ...prev, search, page: 1 }))
  }, [])

  const setSort = useCallback((sortBy: string, sortOrder?: 'asc' | 'desc') => {
    setTableState(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder || (prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'),
      page: 1,
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setTableState(prev => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setTableState(prev => ({ ...prev, pageSize, page: 1 }))
  }, [])

  const reset = useCallback(() => {
    setTableState({
      search: '',
      sortBy: '',
      sortOrder: 'asc',
      page: 1,
      pageSize: initialPageSize,
    })
  }, [initialPageSize])

  return { tableState, setSearch, setSort, setPage, setPageSize, reset }
}
