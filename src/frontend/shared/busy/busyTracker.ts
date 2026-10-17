"use client";

// Pelacak aktivitas penyimpanan (mutasi) global. Menghitung request non-GET
// ke endpoint same-origin /api/* dan memberi tahu subscriber agar UI dapat
// menampilkan overlay "Tunggu dulu ya...".

type Listener = (pending: number) => void;

let pending = 0;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener(pending);
}

function begin(): void {
  pending += 1;
  notify();
}

function end(): void {
  pending = Math.max(0, pending - 1);
  notify();
}

export function subscribeBusy(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPendingBusy(): number {
  return pending;
}

function shouldTrack(input: RequestInfo | URL, init?: RequestInit): boolean {
  const method = (
    init?.method ??
    (input instanceof Request ? input.method : "GET")
  ).toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return false;
  try {
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const parsed = new URL(rawUrl, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

let installed = false;
let originalFetch: typeof fetch | null = null;

export function installFetchTracker(): () => void {
  if (installed || typeof window === "undefined") return () => {};
  installed = true;
  originalFetch = window.fetch;
  const baseFetch = originalFetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const track = shouldTrack(input, init);
    if (track) begin();
    try {
      return await baseFetch(input, init);
    } finally {
      if (track) end();
    }
  };
  return () => {
    if (originalFetch) window.fetch = originalFetch;
    installed = false;
    originalFetch = null;
  };
}
