import { iconLg, statCard, statLabel, statTrend, statValue } from "../../shared/style";

export type StatTone = "gold" | "success" | "error" | "neutral";

type FinancialStatCardProps = {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  tone?: StatTone;
};

const toneStyles: Record<StatTone, string> = {
  gold: "border-secondary/30 bg-secondary/10",
  success: "border-success/30 bg-success/10",
  error: "border-error/30 bg-error/10",
  neutral: "border-outline/30 bg-surface-variant/50",
};

const iconStyles: Record<StatTone, string> = {
  gold: "text-secondary",
  success: "text-success",
  error: "text-error",
  neutral: "text-on-surface-variant",
};

export function FinancialStatCard({ label, value, icon, trend, tone = "gold" }: FinancialStatCardProps) {
  return (
    <article className={`${statCard} ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={statLabel}>{label}</p>
        <span aria-hidden="true" className={`${iconLg} ${iconStyles[tone]}`}>
          {icon}
        </span>
      </div>
      <p className={statValue}>{value}</p>
      {trend && <p className={statTrend}>{trend}</p>}
    </article>
  );
}