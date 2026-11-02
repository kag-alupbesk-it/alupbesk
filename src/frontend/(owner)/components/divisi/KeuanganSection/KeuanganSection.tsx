"use client";

import { useEffect, useState } from "react";
import {
  FinancialChartsSection,
  FinanceProvider,
  KasSection,
  PayrollSection,
  TerminSection,
  useFinance,
} from "@/frontend/Manager/(keuangan)/components/finance";
import {
  pageEyebrow,
  pageHeader,
  pageSubtitle,
  segmentedItem,
  segmentedItemActive,
  segmentedItemIdle,
  segmentedTrack,
} from "@/frontend/Manager/(keuangan)/components/finance/style/style";
import type { TabKey } from "@/frontend/Manager/(keuangan)/components/finance/KeuanganDashboard/KeuanganDashboard";
import { useFocusValue } from "@/frontend/shared/focus/focusStore";

const TABS: { key: TabKey; label: string; ringkasan: string }[] = [
  { key: "kas", label: "Kas", ringkasan: "Saldo, pemasukan, pengeluaran, dan kas beredar" },
  { key: "grafik", label: "Grafik", ringkasan: "Arus kas dan rekap pengeluaran otomatis" },
  { key: "termin", label: "Termin", ringkasan: "Invoice, termin, dan status pembayaran" },
  { key: "payroll", label: "Payroll", ringkasan: "Gaji karyawan dan slip gaji" },
];

/**
 * Drill-down modul Keuangan untuk Owner. Sama seperti KeuanganDashboard tapi
 * tanpa sidebar keuangan (Owner sudah punya shell sendiri) dan tanpa aksi tulis.
 */
function KeuanganIsi({ tab }: { tab: TabKey }) {
  const { state, clearToast } = useFinance();

  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(clearToast, 4000);
    return () => window.clearTimeout(timer);
  }, [state.toast, clearToast]);

  if (tab === "grafik") return <FinancialChartsSection />;
  if (tab === "termin") return <div data-focus-id="tagihan"><TerminSection /></div>;
  if (tab === "payroll") return <PayrollSection />;
  return <KasSection />;
}

export default function OwnerKeuanganSection() {
  const focus = useFocusValue();
  const [userTab, setUserTab] = useState<TabKey | null>(null);
  // Deep-link dari Overview (/owner/keuangan?focus=tagihan) membuka tab Termin
  // tempat daftar tagihan belum dibayar berada — sampai user memilih tab lain.
  const tab: TabKey = userTab ?? (focus === "tagihan" ? "termin" : "kas");
  const aktif = TABS.find((item) => item.key === tab) ?? TABS[0];

  return (
    <FinanceProvider>
      <div className="space-y-5 p-4 sm:p-6 lg:p-10">
        <header className={pageHeader}>
          <div className="min-w-0">
            <p className={pageEyebrow}>Modul Keuangan · Mode Pantau</p>
            <h1 className="mt-2 font-headline text-2xl font-bold text-on-surface">
              {aktif.label}
            </h1>
            <p className={pageSubtitle}>{aktif.ringkasan}</p>
          </div>
          <div className={segmentedTrack} role="tablist" aria-label="Bagian modul keuangan">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                onClick={() => setUserTab(item.key)}
                className={`${segmentedItem} ${
                  tab === item.key ? segmentedItemActive : segmentedItemIdle
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
        <KeuanganIsi tab={tab} />
      </div>
    </FinanceProvider>
  );
}
