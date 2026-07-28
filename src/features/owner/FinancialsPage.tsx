"use client";

import { useState } from "react";

const metrics = [
  {
    label: "Net Revenue",
    value: "$4,282,190",
    sub: "+12.4% vs last quarter",
    subColor: "text-secondary",
    icon: "trending_up",
  },
  {
    label: "Profit Margin",
    value: "28.4%",
    sub: null,
    icon: null,
    isProgress: true,
  },
  {
    label: "Total OpEx",
    value: "$1,102,450",
    sub: "Within set precision budget",
    subColor: "text-on-surface-variant",
    icon: "account_balance_wallet",
  },
  {
    label: "Quick Ratio",
    value: "2.41",
    sub: "Industrial benchmark: 1.8",
    subColor: "text-on-surface-variant",
    icon: "equalizer",
  },
];

const statements = [
  {
    period: "Q3 2024 Interim",
    revenue: "$1,450,200",
    profit: "$412,000",
    margin: "28.4%",
  },
  {
    period: "August 2024 P&L",
    revenue: "$485,000",
    profit: "$138,000",
    margin: "28.4%",
  },
  {
    period: "July 2024 P&L",
    revenue: "$462,100",
    profit: "$129,400",
    margin: "28.0%",
  },
];

const expenses = [
  { label: "Logistics", value: "$661,470", pct: 60, color: "bg-secondary" },
  { label: "Production", value: "$330,735", pct: 25, color: "bg-on-surface-variant" },
  { label: "Payroll", value: "$110,245", pct: 15, color: "bg-outline" },
];

export default function FinancialsPage() {
  const [viewMode, setViewMode] = useState<"monthly" | "quarterly">("monthly");

  const handleDownload = (period: string) => {
    const csv = `Statement,Revenue,Profit,Margin\n${period},${statements.find((s) => s.period === period)?.revenue},${statements.find((s) => s.period === period)?.profit},${statements.find((s) => s.period === period)?.margin}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${period.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const header = "Statement,Revenue,Profit,Margin\n";
    const rows = statements.map((s) => `${s.period},${s.revenue},${s.profit},${s.margin}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Financial_Statements_All.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-4 md:p-10 pb-24 min-h-screen flex flex-col">
      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-primary-container border border-white/10 rounded-xl p-4 sm:p-6 flex flex-col justify-between hover:border-secondary/50 transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                {m.label}
              </span>
              {m.icon && (
                <span className="material-symbols-outlined text-secondary text-lg sm:text-2xl">
                  {m.icon}
                </span>
              )}
              {m.isProgress && (
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              )}
            </div>
            <div className="mt-3 sm:mt-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline">
                {m.value}
              </h3>
              {m.isProgress ? (
                <div className="w-full bg-surface-variant h-1 sm:h-1.5 rounded-full mt-2 sm:mt-3 overflow-hidden">
                  <div className="bg-secondary h-full w-[28.4%] shadow-[0_0_10px_rgba(219,165,1,0.5)]" />
                </div>
              ) : m.sub ? (
                <p className={`${m.subColor} text-[9px] sm:text-[11px] font-bold mt-1 uppercase tracking-tight`}>
                  {m.sub}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-primary-container border border-white/10 rounded-xl p-3 sm:p-4 md:p-8 min-h-[300px] sm:min-h-[400px] flex flex-col relative">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div>
              <h4 className="text-base sm:text-xl font-bold text-on-surface mb-1 font-headline">
                Revenue Stream Analysis
              </h4>
              <p className="text-on-surface-variant text-[10px] sm:text-sm">
                Precision Manufacturing & Logistics Dividends
              </p>
            </div>
            <div className="flex p-1 bg-surface-variant rounded-pill self-start">
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 sm:px-5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-pill transition-colors ${
                  viewMode === "monthly"
                    ? "bg-secondary text-on-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode("quarterly")}
                className={`px-3 sm:px-5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-pill transition-colors ${
                  viewMode === "quarterly"
                    ? "bg-secondary text-on-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 w-full flex items-end justify-between gap-3 pb-6 border-b border-white/5">
            {[40, 55, 45, 70, 60, 85, 65, 75, 50].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm relative cursor-pointer transition-all ${
                  i === 5
                    ? "bg-secondary shadow-[0_0_20px_rgba(219,165,1,0.3)]"
                    : "bg-surface-variant/40 hover:bg-surface-variant/60"
                }`}
                style={{ height: `${h}%` }}
              >
                {i === 5 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-secondary text-on-secondary px-2 py-1 text-[10px] font-bold rounded whitespace-nowrap">
                    Peak: $412k
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant font-bold tracking-widest mt-4 uppercase">
            {viewMode === "monthly"
              ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map(
                  (m) => <span key={m}>{m}</span>
                )
              : ["Q1", "Q2", "Q3"].map((q) => <span key={q}>{q}</span>)}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-primary-container border border-white/10 rounded-xl p-3 sm:p-4 md:p-8 flex flex-col items-center">
          <div className="w-full mb-5 sm:mb-8">
            <h4 className="text-base sm:text-xl font-bold text-on-surface mb-1 font-headline">
              Expense Breakdown
            </h4>
            <p className="text-on-surface-variant text-[10px] sm:text-sm">Allocation by Category</p>
          </div>

          <div className="relative w-36 h-36 sm:w-48 sm:h-48 mb-6 sm:mb-10">
            <svg className="transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#242e36"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#dba501"
                strokeDasharray="251.2"
                strokeDashoffset="100"
                strokeLinecap="round"
                strokeWidth="10"
                style={{ filter: "drop-shadow(0 0 8px rgba(219,165,1,0.5))" }}
              />
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#9ca3af"
                strokeDasharray="251.2"
                strokeDashoffset="200"
                strokeLinecap="round"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-secondary">60%</span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                Logistics
              </span>
            </div>
          </div>

          <div className="w-full space-y-2 sm:space-y-3">
            {expenses.map((e) => (
              <div
                key={e.label}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-surface-variant/30 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${e.color} ${
                      e.color === "bg-secondary"
                        ? "shadow-[0_0_8px_rgba(219,165,1,0.6)]"
                        : ""
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-semibold">{e.label}</span>
                </div>
                <span className="text-xs sm:text-sm font-medium">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Statements Table */}
      <section className="mt-6 sm:mt-8 bg-primary-container border border-white/10 rounded-xl overflow-hidden">
        <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 border-b border-white/10 bg-white/[0.03]">
          <h4 className="text-base sm:text-xl font-bold text-on-surface font-headline">
            Financial Statements
          </h4>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 border-2 border-secondary text-secondary rounded-pill font-bold text-[10px] sm:text-xs hover:bg-secondary hover:text-on-secondary transition-all"
          >
            <span className="material-symbols-outlined text-xs sm:text-sm">download</span>
            DOWNLOAD ALL
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-variant/10 text-on-surface-variant font-bold text-[8px] sm:text-[10px] uppercase tracking-[0.2em]">
                <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">Statement Period</th>
                <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 hidden sm:table-cell">Total Revenue</th>
                <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">Net Profit</th>
                <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 hidden md:table-cell">Margin</th>
                <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 hidden lg:table-cell">Status</th>
                <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {statements.map((s) => (
                <tr
                  key={s.period}
                  className="hover:bg-surface-variant/30 transition-colors group"
                >
                  <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="material-symbols-outlined text-secondary/70 group-hover:text-secondary transition-colors text-base sm:text-xl">
                        description
                      </span>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-on-surface block">
                          {s.period}
                        </span>
                        <span className="text-[9px] sm:text-xs text-on-surface-variant sm:hidden">{s.profit} · {s.margin}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-xs sm:text-sm font-medium hidden sm:table-cell">{s.revenue}</td>
                  <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-xs sm:text-sm font-bold text-secondary">
                    {s.profit}
                  </td>
                  <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-xs sm:text-sm font-medium hidden md:table-cell">{s.margin}</td>
                  <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 hidden lg:table-cell">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-secondary/10 text-secondary border border-secondary/20 text-[8px] sm:text-[9px] font-black rounded-pill uppercase tracking-widest">
                      Finalized
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-right">
                    <button
                      onClick={() => handleDownload(s.period)}
                      className="text-on-surface-variant hover:text-secondary transition-colors"
                      title="Download"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
