/**
 * Status "mode pantau" (read-only) untuk Owner.
 *
 * Flag module-level agar bisa dibaca dari luar React (mis. `request()` di
 * `src/services/api/request.ts`). Hanya diaktifkan oleh layout rute divisi milik
 * Owner; selain itu nilainya selalu `false`.
 */
let readOnly = false;

const listeners = new Set<() => void>();

export function setReadOnlyMode(next: boolean): void {
  if (readOnly === next) return;
  readOnly = next;
  listeners.forEach((listener) => listener());
}

export function isReadOnlyMode(): boolean {
  return readOnly;
}

export function subscribeReadOnly(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
