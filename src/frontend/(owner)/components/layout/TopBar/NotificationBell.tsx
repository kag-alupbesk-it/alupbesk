"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPushStatus,
  subscribePush,
  unsubscribePush,
  type PushStatus,
} from "@/frontend/auth/usePushNotification";
import { usePopover } from "./usePopover";

const panelClass =
  "absolute right-0 top-full mt-2 w-72 rounded-xl border border-outline/40 bg-surface-container shadow-2xl z-[60] p-4 text-left";

export default function NotificationBell() {
  const { open, toggle, setOpen, ref } = usePopover();
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setStatus(await getPushStatus());
  }, []);

  useEffect(() => {
    let active = true;
    getPushStatus().then((next) => {
      if (active) setStatus(next);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleToggle() {
    if (!status?.supported || pending) return;
    setPending(true);
    setMessage("");
    try {
      if (status.subscribed) {
        await unsubscribePush();
        setMessage("Notifikasi dimatikan di perangkat ini.");
      } else {
        const ok = await subscribePush();
        setMessage(
          ok
            ? "Notifikasi aktif. Anda akan menerima pemberitahuan penting."
            : "Notifikasi tidak dapat diaktifkan. Cek izin browser.",
        );
      }
      await refresh();
    } finally {
      setPending(false);
    }
  }

  const subscribed = status?.subscribed ?? false;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifikasi"
        aria-expanded={open}
        title="Notifikasi"
        className="text-on-surface-variant hover:text-secondary transition-colors relative"
      >
        <span className="material-symbols-outlined text-[18px] lg:text-[20px]">
          {subscribed ? "notifications_active" : "notifications"}
        </span>
        {subscribed && (
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
        )}
      </button>

      {open && (
        <div className={panelClass}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-on-surface">Notifikasi</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {status === null ? (
            <p className="mt-3 text-xs text-on-surface-variant">Memeriksa status...</p>
          ) : !status.supported ? (
            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
              Notifikasi push hanya aktif pada build production dan browser yang mendukung
              Service Worker.
            </p>
          ) : status.permission === "denied" ? (
            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
              Izin notifikasi diblokir di browser. Aktifkan kembali lewat pengaturan situs
              pada browser Anda.
            </p>
          ) : (
            <>
              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                {subscribed
                  ? "Perangkat ini berlangganan pemberitahuan penting (pesanan, approval, dan pengiriman)."
                  : "Aktifkan untuk menerima pemberitahuan pesanan, approval, dan pengiriman langsung di perangkat ini."}
              </p>
              <button
                type="button"
                onClick={() => void handleToggle()}
                disabled={pending}
                className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-bold text-primary transition-colors hover:brightness-110 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {pending ? "progress_activity" : subscribed ? "notifications_off" : "notifications_active"}
                </span>
                {pending ? "Memproses..." : subscribed ? "Matikan notifikasi" : "Aktifkan notifikasi"}
              </button>
            </>
          )}

          {message && <p className="mt-2 text-[11px] text-on-surface-variant">{message}</p>}
        </div>
      )}
    </div>
  );
}
