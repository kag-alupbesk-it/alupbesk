"use client";

import { useCallback } from "react";
import { contentApi } from "@/services/api/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

export function usePublicSiteContent<T extends Record<string, unknown>>(
  key: string,
  fallback: T,
) {
  const loadContent = useCallback(async () => {
    const content = await contentApi.getSiteContent(key);
    return { ...fallback, ...content.value } as T;
  }, [fallback, key]);

  return usePollingResource<T>(loadContent, fallback);
}
