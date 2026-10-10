"use client";

import { request } from "@/services/api/request";

/**
 * Web Push subscription, dipakai dari sisi browser.
 *
 * Hanya aktif di production: di development ServiceWorker sengaja di-unregister
 * (lihat ServiceWorkerRegistration) supaya cache CSS tidak kadaluarsa, sehingga
 * mendaftarkan SW & push subscription di dev justru akan merusak hot reload.
 */

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Url = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Url);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Minta izin notifikasi. Panggil dari dalam user gesture (mis. saat submit
 * form login) supaya prompt muncul tanpa diblokir browser. Mengembalikan true
 * bila izin akhirnya "granted".
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!pushSupported()) return false;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return false;
    if (Notification.permission === "denied") return false;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    return Notification.permission === "granted";
  } catch {
    return false;
  }
}

/**
 * Pasang push subscription (perlu sudah login) dan simpan ke server. Dipanggil
 * setelah login berhasil; kegagalan tidak menggagalkan alur login.
 */
export async function activatePushSubscription(): Promise<void> {
  try {
    if (!pushSupported()) return;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey || Notification.permission !== "granted") return;

    let registration = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
    }

    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }));
    const json = subscription.toJSON();

    await request("/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: { auth: json.keys?.auth, p256dh: json.keys?.p256dh },
        userAgent: navigator.userAgent.slice(0, 512),
      }),
    });
  } catch {
    // Notifikasi bersifat opsional: jangan mengganggu alur login.
  }
}

/** Batalkan langganan tetap yang tersimpan di server dan browser. */
export async function unsubscribePush(): Promise<void> {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      try {
        await request("/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      } catch {
        // Best-effort: tetap lepas langganan di browser walau server gagal.
      }
      await subscription.unsubscribe();
    }
  } catch {
    // Best-effort.
  }
}