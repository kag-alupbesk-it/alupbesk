"use client";

import { clsx } from "clsx";
import type { TabKey } from "../finance/KeuanganDashboard";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "kas", label: "Kas", icon: "payments" },
  { key: "grafik", label: "Grafik", icon: "show_chart" },
  { key: "termin", label: "Termin", icon: "receipt_long" },
  { key: "payroll", label: "Payroll", icon: "badge" },
];

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export default function Sidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-outline/30 bg-primary-container py-6 shadow-2xl lg:py-10">
      <div className="mb-8 px-5 lg:mb-10 lg:px-8">
        <h1 className="font-headline text-xl font-extrabold uppercase tracking-tighter text-secondary lg:text-2xl">
          ALUPBESK
        </h1>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-on-surface-variant lg:text-[10px]">
          Admin Keuangan
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 lg:px-4">
        <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/80">
          Modul
        </p>
        <ul className="space-y-0.5 lg:space-y-1">
          {TABS.map((item) => {
            const active = activeTab === item.key;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onTabChange(item.key)}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-all lg:px-4 lg:py-3 lg:text-sm",
                    active
                      ? "bg-secondary font-bold text-on-secondary shadow-lg shadow-secondary/20"
                      : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px] leading-none lg:text-[20px]"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}