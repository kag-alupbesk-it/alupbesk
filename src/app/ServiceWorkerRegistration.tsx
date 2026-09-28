"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistration
 * ─────────────────────────────────────────────────────────
 * Service worker hanya didaftarkan di production.
 *
 * Di development, sw.js memakai strategi cache-first untuk /_next/static/*
 * tanpa revalidasi sama sekali, sedangkan nama file CSS di mode dev tidak
 * berubah ketika isinya diedit. Akibatnya browser diam-diam memakai CSS
 * lama terus-menerus dan perubahan style tidak pernah terlihat — setiap
 * edit di src/app/globals.css atau tailwind.config.ts tidak berefek apa pun
 * sampai cache dibersihkan manual.
 *
 * Di production nama aset sudah memakai content hash sehingga cache-first
 * aman. Karena itu, begitu masuk development, SW yang terlanjur terpasang
 * beserta cache lamanya dibongkar supaya tidak terus melayani request.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => void registration.unregister()))
        .catch(() => {});
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => keys.forEach((key) => void caches.delete(key)))
          .catch(() => {});
      }
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("SW registration failed:", error);
      });
  }, []);

  return null;
}
