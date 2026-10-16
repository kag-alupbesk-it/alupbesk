"use client";

import { useCallback } from "react";
import { contentApi } from "@/services/api/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export function usePublicSiteContent<T extends Record<string, unknown>>(
  key: string,
  fallbackId: T,
  fallbackEn?: T,
) {
  const { language } = useLanguage();
  const effectiveFallbackEn = fallbackEn ?? fallbackId;
  const fallback = language === "en" ? effectiveFallbackEn : fallbackId;

  const loadContent = useCallback(async () => {
    try {
      const content = await contentApi.getSiteContent(key);
      const value = content.value as Record<string, unknown>;
      const localized = value[language] && typeof value[language] === "object"
        ? value[language] as Record<string, unknown>
        : language === "en" ? {} : value;
      return { ...fallback, ...localized } as T;
    } catch {
      return fallback;
    }
  }, [fallback, key, language]);

  return usePollingResource<T>(loadContent, fallback);
}
