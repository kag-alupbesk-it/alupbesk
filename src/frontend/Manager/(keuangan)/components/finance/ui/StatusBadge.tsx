import { badgeBase, iconXs } from "../style";

export type StatusTone = "pending" | "approved" | "rejected" | "overdue";

const toneStyles: Record<StatusTone, string> = {
  pending: "border-secondary/40 bg-secondary/10 text-secondary-800 dark:text-secondary",
  approved: "border-success/30 bg-success/10 text-success",
  rejected: "border-error/30 bg-error/10 text-error",
  overdue: "border-error/40 bg-error/15 text-error",
};

const toneLabels: Record<StatusTone, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  overdue: "Jatuh tempo",
};

type StatusBadgeProps = {
  tone: StatusTone;
  label?: string;
  icon?: string;
  title?: string;
};

export function StatusBadge({ tone, label, icon, title }: StatusBadgeProps) {
  return (
    <span title={title} className={`${badgeBase} ${toneStyles[tone]}`}>
      {icon && (
        <span aria-hidden="true" className={iconXs}>
          {icon}
        </span>
      )}
      {label ?? toneLabels[tone]}
    </span>
  );
}