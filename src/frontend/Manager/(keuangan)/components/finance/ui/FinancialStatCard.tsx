import type { ReactNode } from "react";

export type StatTone = "gold" | "success" | "error" | "neutral";

type FinancialStatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
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
    <article className={`rounded-2xl border p-4 shadow-lg ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
        <span aria-hidden="true" className={`text-base leading-none ${iconStyles[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 break-words text-xl font-black text-on-surface">{value}</p>
      {trend && <p className="mt-1 text-[11px] text-on-surface-variant">{trend}</p>}
    </article>
  );
}