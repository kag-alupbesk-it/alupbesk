"use client";

import { useMemo, useSyncExternalStore } from "react";
import { usePopover } from "./usePopover";

const subscribeToNothing = () => () => {};
const getTodaySnapshot = () => new Date().toDateString();
const getServerSnapshot = () => "";

export default function DateBadge() {
  const { open, toggle, ref } = usePopover();
  const todayKey = useSyncExternalStore(subscribeToNothing, getTodaySnapshot, getServerSnapshot);

  const { longDate, shortDate } = useMemo(() => {
    if (!todayKey) return { longDate: "", shortDate: "" };
    const today = new Date(todayKey);
    return {
      longDate: today.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      shortDate: today.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  }, [todayKey]);

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Tanggal hari ini"
        aria-expanded={open}
        title={shortDate || "Tanggal"}
        className="text-on-surface-variant hover:text-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] lg:text-[20px]">calendar_today</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-outline/40 bg-surface-container p-4 text-left shadow-2xl z-[60]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Hari ini
          </p>
          <p className="mt-1 text-sm font-bold text-on-surface">{longDate || "-"}</p>
          <p className="mt-2 text-[11px] text-on-surface-variant">
            Ringkasan operasional harian ada di halaman Overview dan Pesanan Masuk.
          </p>
        </div>
      )}
    </div>
  );
}
