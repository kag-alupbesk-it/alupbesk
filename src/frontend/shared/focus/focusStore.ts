"use client";

import { useSyncExternalStore } from "react";

/**
 * Nilai `?focus=` dari URL dibagikan lewat store kecil ini supaya section
 * divisi bisa bereaksi (mis. pindah tab/pagination) tanpa memanggil
 * `useSearchParams` sendiri — dengan begitu tidak perlu Suspense di tiap
 * section dan tidak mengganggu prerender halaman.
 */
let focusValue: string | null = null;
const listeners = new Set<() => void>();

export function setFocusValue(next: string | null): void {
  if (next === focusValue) return;
  focusValue = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string | null {
  return focusValue;
}

function getServerSnapshot(): string | null {
  return null;
}

export function useFocusValue(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
