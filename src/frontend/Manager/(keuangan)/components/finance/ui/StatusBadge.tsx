export type StatusTone =
  | "pending"
  | "checked"
  | "approved"
  | "rejected"
  | "paid"
  | "unpaid"
  | "overdue"
  | "netral";

const toneStyles: Record<StatusTone, string> = {
  pending: "border-secondary/40 bg-secondary/10 text-secondary",
  checked: "border-primary-100/40 bg-primary-100/10 text-primary",
  approved: "border-success/30 bg-success/10 text-success",
  rejected: "border-error/30 bg-error/10 text-error",
  paid: "border-success/30 bg-success/10 text-success",
  unpaid: "border-outline/40 bg-surface-variant text-on-surface-variant",
  overdue: "border-error/40 bg-error/15 text-error",
  netral: "border-outline/30 bg-surface-variant text-on-surface-variant",
};

const toneLabels: Record<StatusTone, string> = {
  pending: "Menunggu",
  checked: "Sudah dicek",
  approved: "Disetujui",
  rejected: "Ditolak",
  paid: "Terbayar",
  unpaid: "Belum bayar",
  overdue: "Jatuh tempo",
  netral: "-",
};

type StatusBadgeProps = {
  tone: StatusTone;
  label?: string;
  icon?: string;
  title?: string;
};

export function StatusBadge({ tone, label, icon, title }: StatusBadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${toneStyles[tone]}`}
    >
      {icon && (
        <span aria-hidden="true" className="material-symbols-outlined text-[12px] leading-none">
          {icon}
        </span>
      )}
      {label ?? toneLabels[tone]}
    </span>
  );
}