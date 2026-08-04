export function statusFromStock(stock: number, threshold: number) {
  if (stock === 0) return { status: "Out of Stock" as const, statusColor: "text-red-400" as const, barColor: "bg-red-400" as const };
  const pct = Math.round((stock / threshold) * 100);
  if (pct < 30) return { status: "Critical" as const, statusColor: "text-secondary" as const, barColor: "bg-secondary" as const };
  return { status: "Healthy" as const, statusColor: "text-emerald-400" as const, barColor: "bg-emerald-400" as const };
}
