import type { OrderStatus } from "@/services/orders";

export function formatRp(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

const WINDOWS: Record<string, number> = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };
export function periodDays(period?: string): number {
  const days = period ? WINDOWS[period] : undefined;
  return days ?? WINDOWS.monthly;
}

const REVENUE_STATUSES: OrderStatus[] = ["confirmed", "processing", "completed"];
export function isRevenueStatus(status: OrderStatus): boolean {
  return REVENUE_STATUSES.includes(status);
}

export function withinDays(iso: string, now: number, days: number): boolean {
  return now - new Date(iso).getTime() <= days * 86400000;
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} WIB`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
