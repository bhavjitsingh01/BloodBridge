import { useState, useCallback } from 'react';

interface UseApiCallReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  setData: (data: T) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export function useApiCall<T>(asyncFunction: (...args: any[]) => Promise<T>): UseApiCallReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
    setLoading,
  };
}

// Hook for initial data fetching
export function useFetch<T>(asyncFunction: () => Promise<T>, dependencies: any[] = []) {
  const { data, loading, error, execute, setData } = useApiCall(asyncFunction);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch, setData };
}
