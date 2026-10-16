export const ITEMS_PER_PAGE = 5;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  submitted_to_manager: "Menunggu Verifikasi Manager",
  confirmed: "Disetujui",
  processing: "Diproses",
  completed: "Selesai",
  rejected_by_manager: "Ditolak Manager",
  cancelled: "Dibatalkan",
};

export const STATUS_OPTIONS = ["ALL", "pending", "submitted_to_manager", "confirmed", "processing", "completed", "rejected_by_manager", "cancelled"] as const;

// Tahap alur pesanan untuk ringkasan progres — diurutkan dari awal sampai
// selesai, sehingga lebar bilah menunjukkan posisi kumulatif tiap tahap.
export const PROGRESS_STAGES = [
  { key: "pending", label: "Baru", barBg: "bg-yellow-400", text: "text-yellow-400" },
  { key: "submitted_to_manager", label: "Menunggu Manager", barBg: "bg-blue-400", text: "text-blue-400" },
  { key: "confirmed", label: "Disetujui", barBg: "bg-secondary", text: "text-secondary" },
  { key: "processing", label: "Diproses", barBg: "bg-orange-400", text: "text-orange-400" },
  { key: "completed", label: "Selesai", barBg: "bg-success", text: "text-success" },
] as const;

// Status surat jalan (modul lapangan) untuk panel pengiriman & POD.
export const DELIVERY_STATUS_OPTIONS = ["ALL", "siap-kirim", "dalam-pengiriman", "selesai-kirim"] as const;

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  ALL: "Semua",
  "siap-kirim": "Siap Kirim",
  "dalam-pengiriman": "Dalam Pengiriman",
  "selesai-kirim": "Selesai Kirim",
};
