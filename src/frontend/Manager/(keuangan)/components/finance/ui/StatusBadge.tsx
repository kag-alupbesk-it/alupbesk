export type FinancialStatus = "pending" | "approved" | "rejected" | "paid" | "unpaid";

type StatusBadgeProps = {
  status: FinancialStatus;
  label?: string;
};

const statusStyles: Record<FinancialStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  unpaid: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

const statusLabels: Record<FinancialStatus, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  paid: "Dibayar",
  unpaid: "Belum dibayar",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${statusStyles[status]}`}>
      {label ?? statusLabels[status]}
    </span>
  );
}