// Rate limiter per-IP sederhana untuk endpoint publik (form website) yang
// tidak butuh login. Penyimpanan in-memory per proses: memadai untuk gudang
// satu instance; batasi per endpoint sehingga spam membuat request custom
// tidak ikut menghabiskan kuota upload.
const MAX_KEYS = 10_000;
const buckets = new Map<string, number[]>();

export type RateLimitResult = { limited: boolean; used: number; limit: number };

export function ipFromRequest(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

export function checkRateLimit(
  request: Request,
  limit: number,
  windowMs: number,
): RateLimitResult {
  if (buckets.size > MAX_KEYS) buckets.clear();

  const ip = ipFromRequest(request);
  const url = new URL(request.url);
  const key = ip ? `${ip}:${request.method}:${url.pathname}` : `global:${request.method}:${url.pathname}`;
  const now = Date.now();

  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return { limited: true, used: recent.length, limit };
  }
  recent.push(now);
  if (recent.length === 0) {
    buckets.delete(key);
  } else {
    buckets.set(key, recent);
  }
  return { limited: false, used: recent.length, limit };
}