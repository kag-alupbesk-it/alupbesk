"use client";

import { useCallback, useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 15_000;

export function usePollingResource<T>(
  load: () => Promise<T>,
  initialValue: T,
  intervalMs = DEFAULT_INTERVAL_MS,
) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refresh = useCallback(() => setRefreshVersion((version) => version + 1), []);

  useEffect(() => {
    let active = true;
    let inFlight = false;

    const refresh = async () => {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const nextData = await load();
        if (active) {
          setData(nextData);
          setError(null);
        }
      } catch (reason) {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Data gagal dimuat.");
        }
      } finally {
        inFlight = false;
        if (active) setLoading(false);
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), intervalMs);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [intervalMs, load, refreshVersion]);

  return { data, setData, loading, error, refresh };
}
