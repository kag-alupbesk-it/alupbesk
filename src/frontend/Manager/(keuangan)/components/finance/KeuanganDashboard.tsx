"use client";

import { useEffect, useState } from "react";
import * as s from "./style";
import { FinanceProvider, useFinance } from "./FinanceStore";
import { FinancialChartsSection } from "./FinancialChartsSection";
import { KasSection } from "./KasSection";
import { PayrollSection } from "./PayrollSection";
import { TerminSection } from "./TerminSection";
import Sidebar from "@/frontend/Manager/(keuangan)/components/layout/Sidebar";

export type TabKey = "kas" | "grafik" | "termin" | "payroll";

const TABS: { key: TabKey; label: string; ikon: string; ringkasan: string }[] = [
  { key: "kas", label: "Kas", ikon: "payments", ringkasan: "Saldo, pemasukan, pengeluaran, dan kas beredar" },
  { key: "grafik", label: "Grafik", ikon: "show_chart", ringkasan: "Arus kas dan rekap pengeluaran otomatis" },
  { key: "termin", label: "Termin", ikon: "receipt_long", ringkasan: "Invoice, termin, dan status pembayaran" },
  { key: "payroll", label: "Payroll", ikon: "badge", ringkasan: "Gaji karyawan dan slip gaji" },
];

function IsiTab({ tab }: { tab: TabKey }) {
  const { state, clearToast } = useFinance();

  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(clearToast, 4000);
    return () => window.clearTimeout(timer);
  }, [state.toast, clearToast]);

  const tabAktif = TABS.find((item) => item.key === tab) ?? TABS[0];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className={s.pageHeader}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={s.pageEyebrow}>Modul Keuangan</p>
              <h1 className={s.pageTitle}>{tabAktif.label}</h1>
              <p className={s.pageSubtitle}>{tabAktif.ringkasan}</p>
            </div>
          </div>
        </header>

        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          tabIndex={-1}
          className="animate-fadeIn"
        >
          {tab === "kas" && <KasSection />}
          {tab === "grafik" && <FinancialChartsSection />}
          {tab === "termin" && <TerminSection />}
          {tab === "payroll" && <PayrollSection />}
        </div>
      </div>
    </div>
  );
}

export function KeuanganDashboard() {
  const [tab, setTab] = useState<TabKey>("kas");
  return (
    <FinanceProvider>
      <div className="flex min-h-screen">
        <Sidebar activeTab={tab} onTabChange={setTab} />
        <main className="flex-1 pl-0 lg:pl-64">
          <IsiTab tab={tab} />
        </main>
      </div>
    </FinanceProvider>
  );
}