"use client";

import { useCallback, useEffect, useState } from "react";
import { fieldStore } from "../components/store";
import type { FieldDelivery } from "../components/types";

const REFRESH_INTERVAL_MS = 15_000;

export function useFieldDeliveries() {
  const [deliveries, setDeliveries] = useState<FieldDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fieldStore.getDeliveries();
      setDeliveries(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let inFlight = false;

    const load = async () => {
      if (!active || inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const data = await fieldStore.getDeliveries();
        if (active) setDeliveries(data);
      } catch {
        // Keep the last successful data visible during temporary network failures.
      } finally {
        inFlight = false;
        if (active) setLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", load);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  return { deliveries, setDeliveries, loading, refresh };
}
