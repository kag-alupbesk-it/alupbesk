import { useState, useEffect } from "react";

/**
 * Menunda update nilai hingga user berhenti mengetik selama `delay` ms.
 * Generic <T> agar bisa dipakai untuk string, number, atau tipe lain.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: batalkan timer jika value berubah sebelum delay selesai
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}