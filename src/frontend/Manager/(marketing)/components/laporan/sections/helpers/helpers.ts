export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
}

export function statusBg(status: string): string {
  switch (status) {
    case "confirmed": return "bg-secondary/10";
    case "processing": return "bg-orange-400/10";
    case "completed": return "bg-success/10";
    case "rejected_by_manager": return "bg-red-400/10";
    case "pending": return "bg-yellow-400/10";
    case "submitted_to_manager": return "bg-blue-400/10";
    default: return "bg-white/5";
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "confirmed": return "text-secondary";
    case "processing": return "text-orange-400";
    case "completed": return "text-success";
    case "rejected_by_manager": return "text-red-400";
    case "pending": return "text-yellow-400";
    case "submitted_to_manager": return "text-blue-400";
    default: return "text-on-surface-variant";
  }
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  submitted_to_manager: "Menunggu Verifikasi Manager",
  confirmed: "Disetujui",
  processing: "Diproses",
  completed: "Selesai",
  rejected_by_manager: "Ditolak Manager",
  cancelled: "Dibatalkan",
};
