"use client";

import { clsx } from "clsx";
import { brandTitle, iconLg, metaText, segmentedItemActive } from "../finance/style";
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
        <h1 className={brandTitle}>ALUPBESK</h1>
        <p className={`${metaText} mt-1 uppercase tracking-[0.2em] font-bold`}>Admin Keuangan</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 lg:px-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/80">
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
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-colors lg:px-4 lg:py-3 lg:text-sm",
                    active
                      ? segmentedItemActive
                      : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                  )}
                >
                  <span aria-hidden="true" className={`${iconLg} lg:text-[22px]`}>
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