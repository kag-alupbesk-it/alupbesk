"use client";

import { useCallback } from "react";
import { contentApi } from "@/services/api/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export function usePublicSiteContent<T extends Record<string, unknown>>(
  key: string,
  fallback: T,
) {
  const { language } = useLanguage();
  const loadContent = useCallback(async () => {
    const content = await contentApi.getSiteContent(key);
    const value = content.value as Record<string, unknown>;
    const localized = value[language] && typeof value[language] === "object"
      ? value[language] as Record<string, unknown>
      : value;
    return { ...fallback, ...localized } as T;
  }, [fallback, key, language]);

  return usePollingResource<T>(loadContent, fallback);
}
