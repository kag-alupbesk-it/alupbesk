"use client";

import { clsx } from "clsx";
import { iconLg, iconSm, metaText, navTitle, segmentedItemActive, segmentedItemIdle } from "../finance/style";
import type { TabKey } from "../finance/KeuanganDashboard";
import { LogoutButton } from "@/frontend/auth/LogoutButton";
import ThemeToggle from "@/app/ThemeToggle";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "kas", label: "Kas", icon: "payments" },
  { key: "grafik", label: "Grafik", icon: "show_chart" },
  { key: "termin", label: "Termin", icon: "receipt_long" },
  { key: "payroll", label: "Payroll", icon: "badge" },
];

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ activeTab, onTabChange, open, onClose }: Props) {
  return (
    <>
      <button
        type="button"
        aria-label="Tutup menu navigasi"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        aria-label="Navigasi modul keuangan"
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-outline/30 bg-primary-container py-6 shadow-2xl transition-transform duration-200 lg:translate-x-0 lg:py-10",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 flex items-start justify-between gap-3 px-5 lg:mb-10 lg:px-8">
          <div>
            <h1 className={navTitle}>ALUPBESK</h1>
            <p className={`${metaText} mt-1 uppercase tracking-[0.2em] font-bold`}>Admin Keuangan</p>
          </div>
          <ThemeToggle />
          <LogoutButton />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline/30 text-on-surface-variant transition-colors hover:border-secondary/50 hover:text-secondary lg:hidden"
          >
            <span aria-hidden="true" className={iconSm}>
              close
            </span>
          </button>
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
                    onClick={() => {
                      onTabChange(item.key);
                      onClose();
                    }}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-colors lg:px-4 lg:py-3 lg:text-sm",
                      active ? segmentedItemActive : segmentedItemIdle
                    )}
                  >
                    <span aria-hidden="true" className={`${iconLg} shrink-0 lg:text-[22px]`}>
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
    </>
  );
}
