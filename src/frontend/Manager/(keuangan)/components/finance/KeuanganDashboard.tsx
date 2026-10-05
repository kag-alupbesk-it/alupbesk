"use client";

import { useState } from "react";
import { KasSection } from "@/frontend/Manager/(keuangan)/components/kas";
import { ApprovalSection } from "./ApprovalSection";
import { PettyCashSection } from "./PettyCashSection";
import { TerminSection } from "./TerminSection";
import { PayrollSection } from "./PayrollSection";
import { FinancialChartsSection } from "./FinancialChartsSection";

type KeuanganTab = "kas" | "grafik" | "approval" | "petty" | "termin" | "payroll";

const tabs: { key: KeuanganTab; label: string }[] = [
  { key: "kas", label: "Kas" },
  { key: "grafik", label: "Grafik" },
  { key: "approval", label: "Approval" },
  { key: "petty", label: "Petty Cash" },
  { key: "termin", label: "Termin" },
  { key: "payroll", label: "Payroll" },
];

export function KeuanganDashboard() {
  const [activeTab, setActiveTab] = useState<KeuanganTab>("kas");

  return (
    <div className="p-3 sm:p-4 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-outline/30 bg-primary-container p-4 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">Dashboard Keuangan</p>
              <h1 className="mt-2 text-2xl font-black text-on-surface">Operasional Keuangan & Finance</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all",
                    activeTab === tab.key
                      ? "border-secondary bg-secondary text-on-secondary shadow-lg shadow-secondary/20"
                      : "border-outline/30 bg-surface-variant text-on-surface-variant hover:text-on-surface",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {activeTab === "kas" && <KasSection />}
        {activeTab === "grafik" && <FinancialChartsSection />}
        {activeTab === "approval" && <ApprovalSection />}
        {activeTab === "petty" && <PettyCashSection />}
        {activeTab === "termin" && <TerminSection />}
        {activeTab === "payroll" && <PayrollSection />}
      </div>
    </div>
  );
}
