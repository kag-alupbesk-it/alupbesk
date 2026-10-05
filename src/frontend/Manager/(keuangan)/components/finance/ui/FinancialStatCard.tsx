import type { ReactNode } from "react";

type FinancialStatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  tone?: "amber" | "emerald" | "red" | "blue";
};

const toneStyles = {
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  red: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  blue: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export function FinancialStatCard({ label, value, icon, trend, tone = "blue" }: FinancialStatCardProps) {
  return (
    <article className={`rounded-xl border p-4 ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{label}</p>
        <span aria-hidden="true" className="text-lg leading-none">{icon}</span>
      </div>
      <p className="mt-3 break-words text-xl font-black text-on-surface">{value}</p>
      {trend && <p className="mt-1 text-[11px] text-on-surface-variant">{trend}</p>}
    </article>
  );
}