"use client";

import { useEffect, useState } from "react";
import { installFetchTracker, subscribeBusy } from "./busyTracker";

const SHOW_DELAY_MS = 400;

export default function GlobalBusyProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => installFetchTracker(), []);

  useEffect(() => {
    let timer: number | null = null;
    const unsubscribe = subscribeBusy((pending) => {
      if (pending > 0) {
        if (timer === null) {
          timer = window.setTimeout(() => {
            timer = null;
            setVisible(true);
          }, SHOW_DELAY_MS);
        }
        return;
      }
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      setVisible(false);
    });
    return () => {
      unsubscribe();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-outline/25 bg-surface-container px-8 py-6 text-center shadow-2xl">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
            <p className="text-sm font-semibold text-on-surface">Tunggu dulu ya...</p>
          </div>
        </div>
      )}
    </>
  );
}
