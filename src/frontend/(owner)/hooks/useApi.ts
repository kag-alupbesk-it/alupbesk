"use client";

import useSWR from "swr";
import { useCallback } from "react";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T | undefined>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options?: { interval?: number; enabled?: boolean; key?: string }
): ApiState<T> {
  const cacheKey = (options?.key ?? "") + fetcher.toString() + (options?.interval ?? "");

  const { data, error, isLoading, mutate } = useSWR<T>(
    options?.enabled ?? true ? cacheKey : null,
    fetcher,
    {
      refreshInterval: options?.interval,
      revalidateOnFocus: false,
    }
  );
  const refetch = useCallback(() => mutate(), [mutate]);

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Unknown error") : null,
    refetch,
  };
}
