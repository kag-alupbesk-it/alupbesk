"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function usePemasaranNavigation() {
  const router = useRouter();

  const goTo = useCallback((path: string) => router.push(path), [router]);
  const goBack = useCallback(() => router.back(), [router]);

  return { goTo, goBack };
}
