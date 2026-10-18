"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPushStatus,
  subscribePush,
  unsubscribePush,
  type PushStatus,
} from "@/frontend/auth/usePushNotification";
import { usePopover } from "./usePopover";
import { fetchNotificationTasks, type NotificationTask } from "@/frontend/shared/notifications/notifications";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";

const panelClass =
  "absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-outline/40 bg-surface-container shadow-2xl z-[60] p-4 text-left";

export default function NotificationBell() {
  const { open, toggle, setOpen, ref } = usePopover();
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState<NotificationTask[]>([]);
  const [newTask, setNewTask] = useState<NotificationTask | null>(null);
  const tasksRef = useRef<NotificationTask[]>([]);

  const refreshTasks = useCallback(async (notify = false) => {
    try {
      const next = await fetchNotificationTasks();
      const knownIds = new Set(tasksRef.current.map((item) => item.id));
      if (notify) setNewTask(next.find((item) => !knownIds.has(item.id)) ?? null);
      tasksRef.current = next;
      setTasks(next);
    } catch {
      // The bell stays usable for push settings while role notifications retry.
    }
  }, []);

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

  useEffect(() => {
    let active = true;
    void refreshTasks();
    const timer = window.setInterval(() => void refreshTasks(true), 15000);
    let client: ReturnType<typeof getSupabaseBrowserClient> | null = null;
    try {
      client = getSupabaseBrowserClient();
      let channel = client.channel("role-notification-tasks");
      for (const table of ["role_requests", "orders", "custom_requests", "gudang_production_requests", "pm_orders", "field_deliveries"]) {
        channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
          if (active) void refreshTasks(true);
        });
      }
      channel.subscribe();
      return () => {
        active = false;
        window.clearInterval(timer);
        if (client) void client.removeChannel(channel);
      };
    } catch {
      return () => {
        active = false;
        window.clearInterval(timer);
      };
    }
  }, [refreshTasks]);

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
        {tasks.length > 0 && (
          <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-600 px-1 text-center text-[9px] font-bold leading-4 text-white">
            {tasks.length > 99 ? "99+" : tasks.length}
          </span>
        )}
      </button>

      {newTask && (
        <div role="status" className="fixed right-4 top-16 z-[100] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-outline/40 bg-surface-container p-4 text-left shadow-2xl">
          <div className="flex items-start gap-3">
              <span className="material-symbols-outlined rounded-full bg-secondary/15 p-2 text-secondary">notifications_active</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface">{newTask.title}</p>
              <p className="mt-1 truncate text-xs text-on-surface-variant">{newTask.detail}</p>
              <button type="button" onClick={() => { window.location.assign(newTask.href); setNewTask(null); }} className="mt-3 text-xs font-bold text-secondary">Buka tugas</button>
            </div>
            <button type="button" aria-label="Tutup notifikasi" onClick={() => setNewTask(null)} className="text-on-surface-variant">×</button>
          </div>
        </div>
      )}

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

          {tasks.length === 0 ? (
            <p className="mt-3 text-xs text-on-surface-variant">Tidak ada tugas yang menunggu.</p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {tasks.slice(0, 8).map((task) => (
                <li key={task.id}>
                  <button type="button" onClick={() => { window.location.assign(task.href); setOpen(false); }} className="w-full rounded-lg bg-surface px-3 py-2 text-left hover:bg-surface-variant">
                    <span className="block text-xs font-bold text-on-surface">{task.title}</span>
                    <span className="mt-1 block truncate text-[11px] text-on-surface-variant">{task.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

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
