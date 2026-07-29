import { useState, useCallback } from 'react';

interface UseMutationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (...args: any[]) => Promise<T>;
  isSuccess: boolean;
  reset: () => void;
}

export function useMutation<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): UseMutationReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        setIsSuccess(false);

        const result = await asyncFunction(...args);

        setData(result);
        setIsSuccess(true);

        // Auto-reset success message after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);

        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        setIsSuccess(false);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsSuccess(false);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    isSuccess,
    reset,
  };
}
