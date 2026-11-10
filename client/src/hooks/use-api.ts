import { useEffect, useState } from 'react';
import { api } from '../services/http';

export function useApi<T>(path: string) {
  const [result, setResult] = useState<{
    data?: T;
    error?: string;
    loading: boolean;
  }>({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    void api<T>(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ data, loading: false });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            error: error instanceof Error ? error.message : 'Falha de conexão.',
            loading: false,
          });
      },
    );
    return () => controller.abort();
  }, [path]);
  return result;
}
