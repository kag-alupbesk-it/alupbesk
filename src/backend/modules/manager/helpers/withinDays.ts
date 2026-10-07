export function withinDays(iso: string, now: number, days: number): boolean {
  const elapsed = now - new Date(iso).getTime();
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= days * 86400000;
}
