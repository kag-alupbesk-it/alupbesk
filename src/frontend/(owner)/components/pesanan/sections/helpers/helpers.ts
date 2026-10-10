export function statusColor(status: string): string {
  switch (status) {
    case "pending": return "text-yellow-400";
    case "submitted_to_manager": return "text-blue-400";
    case "confirmed": return "text-secondary";
    case "rejected_by_manager": return "text-red-400";
    case "cancelled": return "text-on-surface-variant/50";
    default: return "text-on-surface-variant";
  }
}

export function statusBg(status: string): string {
  switch (status) {
    case "pending": return "bg-yellow-400/10";
    case "submitted_to_manager": return "bg-blue-400/10";
    case "confirmed": return "bg-secondary/10";
    case "rejected_by_manager": return "bg-red-400/10";
    case "cancelled": return "bg-white/5";
    default: return "bg-white/5";
  }
}

export function isNewOrder(order: { status: string; marketingConfirmedAt?: string }): boolean {
  return order.status === "pending" && !order.marketingConfirmedAt;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}