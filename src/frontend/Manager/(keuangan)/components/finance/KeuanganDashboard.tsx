"use client";

import { useEffect, useRef, useState } from "react";
import { FinanceProvider, useFinance } from "./FinanceStore";
import { FinancialChartsSection } from "./FinancialChartsSection";
import { KasSection } from "./KasSection";
import { PayrollSection } from "./PayrollSection";
import { TerminSection } from "./TerminSection";

type TabKey = "kas" | "grafik" | "termin" | "payroll";

const TABS: { key: TabKey; label: string; ikon: string; ringkasan: string }[] = [
  { key: "kas", label: "Kas", ikon: "payments", ringkasan: "Saldo, pemasukan, pengeluaran, dan kas beredar" },
  { key: "grafik", label: "Grafik", ikon: "show_chart", ringkasan: "Arus kas dan rekap pengeluaran otomatis" },
  { key: "termin", label: "Termin", ikon: "receipt_long", ringkasan: "Invoice, termin, dan status pembayaran" },
  { key: "payroll", label: "Payroll", ikon: "badge", ringkasan: "Gaji karyawan dan slip gaji" },
];

function IsiTab() {
  const [tab, setTab] = useState<TabKey>("kas");
  const { state, clearToast } = useFinance();
  const refs = useRef<Record<TabKey, HTMLButtonElement | null>>({} as Record<TabKey, HTMLButtonElement | null>);

  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(clearToast, 4000);
    return () => window.clearTimeout(timer);
  }, [state.toast, clearToast]);

  const tabAktif = TABS.find((item) => item.key === tab) ?? TABS[0];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl border border-outline/30 bg-primary-container p-4 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                Modul Keuangan
              </p>
              <h1 className="mt-1 text-2xl font-black text-on-surface">Operasional Keuangan &amp; Finance</h1>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
              <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none">
                calendar_month
              </span>
              Periode aktif
            </span>
          </div>

          <div role="tablist" aria-label="Sub-tab keuangan" className="mt-4 flex flex-wrap gap-2">
            {TABS.map((item) => {
              const aktif = tab === item.key;
              return (
                <button
                  key={item.key}
                  ref={(node) => {
                    refs.current[item.key] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${item.key}`}
                  aria-selected={aktif}
                  aria-controls={`panel-${item.key}`}
                  tabIndex={aktif ? 0 : -1}
                  onClick={() => setTab(item.key)}
                  onKeyDown={(event) => {
                    const index = TABS.findIndex((row) => row.key === tab);
                    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                      event.preventDefault();
                      const berikutnya =
                        event.key === "ArrowRight"
                          ? (index + 1) % TABS.length
                          : (index - 1 + TABS.length) % TABS.length;
                      const keyBerikutnya = TABS[berikutnya].key;
                      setTab(keyBerikutnya);
                      refs.current[keyBerikutnya]?.focus();
                    }
                  }}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors md:min-h-0 ${
                    aktif
                      ? "border-secondary bg-secondary text-on-secondary shadow-lg shadow-secondary/20"
                      : "border-outline/30 bg-surface-variant text-on-surface-variant hover:border-secondary/50 hover:text-secondary"
                  }`}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
                    {item.ikon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] text-on-surface-variant">{tabAktif.ringkasan}</p>
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
  return (
    <FinanceProvider>
      <IsiTab />
    </FinanceProvider>
  );
}