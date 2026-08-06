export const ITEMS_PER_PAGE = 5;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  submitted_to_manager: "Menunggu Verifikasi Manager",
  confirmed: "Disetujui",
  rejected_by_manager: "Ditolak Manager",
  cancelled: "Dibatalkan",
};

export const STATUS_OPTIONS = ["ALL", "pending", "submitted_to_manager", "confirmed", "rejected_by_manager", "cancelled"] as const;
