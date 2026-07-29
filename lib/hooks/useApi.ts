import { useState, useCallback } from 'react'
import { ApiResponse } from '../api-client'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  autoFetch?: boolean
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options?: UseApiOptions
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      if (response.success && response.data) {
        setData(response.data)
        options?.onSuccess?.(response.data)
      } else {
        throw new Error(response.error?.message || 'An error occurred')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      options?.onError?.(err)
    } finally {
      setLoading(false)
    }
  }, [apiCall, options])

  return {
    data,
    error,
    loading,
    execute,
    refetch: execute,
  }
}
