import { STATUS_LABELS } from "../data/data";

export function statusColor(status: string): string {
  switch (status) {
    case "pending": return "text-yellow-400";
    case "submitted_to_manager": return "text-blue-400";
    case "confirmed": return "text-secondary";
    case "processing": return "text-orange-400";
    case "completed": return "text-success";
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
    case "processing": return "bg-orange-400/10";
    case "completed": return "bg-success/10";
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

// ---------------------------------------------------------------------
// Timeline riwayat pesanan — disusun dari jejak waktu yang tersimpan pada
// tabel orders, bukan dari tabel riwayat, supaya lama laporan lama punya
// riwayat selama kolom waktunya pernah terisi.
// ---------------------------------------------------------------------

export interface TimelineEntry {
  label: string;
  detail?: string;
  at: string;
  tone: "done" | "active" | "danger";
}

interface OrderTimelineSource {
  status: string;
  createdAt: string;
  updatedAt: string;
  marketingConfirmedAt?: string;
  submittedToManagerAt?: string;
  processedAt?: string;
  managerDecisionAt?: string;
  managerRejectionReason?: string;
}

export function buildOrderTimeline(order: OrderTimelineSource): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    { label: "Pesanan dibuat", detail: "Masuk dari website", at: order.createdAt, tone: "done" },
  ];

  const confirmed = order.marketingConfirmedAt;
  const submitted = order.submittedToManagerAt;
  if (confirmed && submitted && confirmed === submitted) {
    entries.push({ label: "Dikonfirmasi & dikirim ke manager", at: confirmed, tone: "done" });
  } else {
    if (confirmed) entries.push({ label: "Dikonfirmasi marketing", at: confirmed, tone: "done" });
    if (submitted) entries.push({ label: "Dikirim ke manager", at: submitted, tone: "done" });
  }

  if (order.managerDecisionAt) {
    const rejected = order.status === "rejected_by_manager";
    entries.push({
      label: rejected ? "Ditolak manager" : "Disetujui manager",
      detail: rejected ? order.managerRejectionReason : undefined,
      at: order.managerDecisionAt,
      tone: rejected ? "danger" : "done",
    });
  }

  if (order.processedAt) {
    entries.push({ label: "Diproses gudang", at: order.processedAt, tone: "done" });
  }

  const lastEventAt = entries[entries.length - 1]?.at;
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const statusTone: TimelineEntry["tone"] =
    order.status === "rejected_by_manager" || order.status === "cancelled"
      ? "danger"
      : "active";

  // Tambahkan status terkini hanya bila waktunya benar-benar berbeda dari
  // peristiwa terakhir (biar tidak dobel) atau belum ada riwayat sama sekali.
  if (!lastEventAt || order.updatedAt > lastEventAt || entries.length <= 1) {
    entries.push({ label: `Status saat ini · ${statusLabel}`, at: order.updatedAt, tone: statusTone });
  }

  return entries.sort((left, right) => left.at.localeCompare(right.at));
}

// ---------------------------------------------------------------------
// Panel pengiriman & bukti terima (POD)
// ---------------------------------------------------------------------

export function deliveryStatusColor(status: string): string {
  switch (status) {
    case "siap-kirim": return "text-blue-400";
    case "dalam-pengiriman": return "text-orange-400";
    case "selesai-kirim": return "text-success";
    default: return "text-on-surface-variant";
  }
}

export function deliveryStatusBg(status: string): string {
  switch (status) {
    case "siap-kirim": return "bg-blue-400/10";
    case "dalam-pengiriman": return "bg-orange-400/10";
    case "selesai-kirim": return "bg-success/10";
    default: return "bg-white/5";
  }
}

export interface PodState {
  label: string;
  complete: boolean;
}

// POD dianggap lengkap bila dua foto wajib sudah ada: tanda tangan penerima
// pada surat jalan dan foto proyek yang sampai di lokasi.
export function podStatus(delivery: {
  status: string;
  signatureImagePath?: string;
  projectImagePath?: string;
}): PodState {
  const complete = Boolean(delivery.signatureImagePath && delivery.projectImagePath);
  if (complete) return { label: "Lengkap", complete: true };
  if (delivery.status === "selesai-kirim") return { label: "Belum lengkap", complete: false };
  if (delivery.status === "dalam-pengiriman") return { label: "Menunggu terima", complete: false };
  return { label: "Belum dikirim", complete: false };
}
