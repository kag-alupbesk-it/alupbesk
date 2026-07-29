"use client";

import useSWR from "swr";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options?: { interval?: number; enabled?: boolean }
): ApiState<T> {
  const key = fetcher.toString() + (options?.interval ?? "");

  const { data, error, isLoading, mutate } = useSWR<T>(
    options?.enabled ?? true ? key : null,
    fetcher,
    {
      refreshInterval: options?.interval,
      revalidateOnFocus: false,
    }
  );

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Unknown error") : null,
    refetch: () => mutate(),
  };
}
