"use client";

import { useEffect, useState } from "react";
import * as s from "../style/style";
import { FinanceProvider, useFinance } from "../FinanceStore/FinanceStore";
import { FinancialChartsSection } from "../FinancialChartsSection/FinancialChartsSection";
import { KasSection } from "../KasSection/KasSection";
import { PayrollSection } from "../PayrollSection/PayrollSection";
import { TerminSection } from "../TerminSection/TerminSection";
import Sidebar from "@/frontend/Manager/(keuangan)/components/layout/Sidebar/Sidebar";
import ThemeToggle from "@/app/ThemeToggle";
import { LogoutButton } from "@/frontend/auth/LogoutButton";
import { financeNavigationItems, type FinanceTabKey } from "@/frontend/shared/navigation/roleNavigation";

export type TabKey = FinanceTabKey;

const TAB_SUMMARIES: Record<TabKey, string> = {
  kas: "Saldo, pemasukan, pengeluaran, dan kas beredar",
  grafik: "Arus kas dan rekap pengeluaran otomatis",
  termin: "Invoice, termin, dan status pembayaran",
  payroll: "Gaji karyawan dan slip gaji",
};

function IsiTab({ tab }: { tab: TabKey }) {
  const { state, clearToast } = useFinance();

  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(clearToast, 4000);
    return () => window.clearTimeout(timer);
  }, [state.toast, clearToast]);

  const tabAktif = financeNavigationItems.find((item) => item.key === tab) ?? financeNavigationItems[0];

  return (
    <div className="p-3 pb-24 sm:p-4 sm:pb-24 md:px-6 md:pt-6 md:pb-24 lg:pb-6">
      <div className="w-full space-y-5">
        <header className={s.pageHeader}>
          <p className={s.pageEyebrow}>Modul Keuangan</p>
          <h1 className={s.pageTitle}>{tabAktif.label}</h1>
          <p className={s.pageSubtitle}>{TAB_SUMMARIES[tabAktif.key]}</p>
        </header>

        <div
          role="tabpanel"
          id="panel-finance"
          aria-label={tabAktif.label}
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
      <div className="flex min-h-dvh w-full">
        <Sidebar activeTab={tab} onTabChange={setTab} />
        <main className="roleMobileTypography min-w-0 flex-1 lg:ml-64">
          <div className={`${s.mobileBar} justify-between`}>
            <p className={s.navTitleMobile}>{financeNavigationItems.find((item) => item.key === tab)?.label ?? "Kas"}</p>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
          <IsiTab tab={tab} />
        </main>
      </div>
    </FinanceProvider>
  );
}