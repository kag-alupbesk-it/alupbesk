"use client";

import { useState } from "react";

const suppliers = [
  { name: "Titanium Forge Ltd", grade: "Aerospace Grade", score: 98.4, bars: 4, contact: "sales@titaniumforge.com", location: "Surabaya, Jawa Timur", since: "2019" },
  { name: "AluCast Solutions", grade: "Recycled Stock", score: 84.2, bars: 3, contact: "info@alucast.co.id", location: "Bandung, Jawa Barat", since: "2021" },
  { name: "Precision Mold Inc", grade: "Custom Tooling", score: 72.9, bars: 2, contact: "procurement@precisionmold.id", location: "Tangerang, Banten", since: "2022" },
];

const templates = [
  {
    icon: "inventory_2",
    title: "Inventory Audit",
    desc: "Comprehensive reconciliation of raw materials, work-in-progress, and finished goods.",
    meta: "Last Run: 2d ago",
    action: "download",
  },
  {
    icon: "account_balance",
    title: "Financial Year-End",
    desc: "P&L summary, tax liabilities, and departmental budget utilization for fiscal 2024.",
    meta: "Scheduled: Dec 31",
    action: "print",
    filled: true,
  },
  {
    icon: "history_edu",
    title: "Operational Log",
    desc: "Machine uptime reports, maintenance schedules, and incident logs per facility.",
    meta: "Live Sync: Active",
    action: "share",
    live: true,
  },
];

const systemEvents = [
  { id: "EVT-9028-X", origin: "Milling Unit A", desc: "Batch completion successful. 402 units processed.", time: "14:02:11", error: false },
  { id: "EVT-9029-X", origin: "Quality Control", desc: "Surface finish deviation < 0.01mm. Grade A+ certification.", time: "14:05:45", error: false },
  { id: "EVT-9030-X", origin: "Logistics Hub", desc: "Refueling required for automated transporters.", time: "14:10:02", error: true },
];

export default function ReportsPage() {
  const [showDateModal, setShowDateModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [dateLabel, setDateLabel] = useState("Last 30 Days");

  const handleApplyDate = () => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const end = new Date(dateRange.end).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      setDateLabel(`${start} - ${end}`);
    }
    setShowDateModal(false);
  };
  return (
    <div className="p-3 sm:p-4 md:pt-10 md:px-10 md:pb-10 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-on-surface font-headline">
            Reports & Analytics
          </h3>
          <p className="text-on-surface-variant mt-1 sm:mt-2 text-xs sm:text-sm font-body-md">
            Real-time performance metrics across the industrial ecosystem.
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowDateModal(true)}
            className="px-3 sm:px-5 py-2 sm:py-2.5 border border-white/10 rounded-pill flex items-center gap-1.5 sm:gap-2 hover:bg-white/5 transition-all text-[10px] sm:text-label-sm text-on-surface"
          >
            <span className="material-symbols-outlined text-sm sm:text-lg">filter_list</span>
            <span className="hidden sm:inline">Date Range: </span>{dateLabel}
          </button>
          <button
            onClick={() => {
              const header = "Metric,Value\nProduction Throughput,Live\nUptime,99.9997%\n";
              const rows = systemEvents.map((e) => `${e.id},${e.origin}: ${e.desc}`).join("\n");
              const blob = new Blob([header + rows], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "Reports_Summary.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-secondary text-on-secondary rounded-pill flex items-center gap-1.5 sm:gap-2 hover:brightness-110 transition-all text-[10px] sm:text-label-sm font-bold"
          >
            <span className="material-symbols-outlined text-sm sm:text-lg">
              file_download
            </span>
            Export
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        {/* Production Throughput Chart */}
        <div className="col-span-12 md:col-span-8 bg-primary-container border border-white/10 p-4 sm:p-6 md:p-8 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 sm:p-4">
            <span className="text-[8px] sm:text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-pill uppercase tracking-widest">
              LIVE DATA
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-8 md:mb-10">
            <div>
              <span className="text-[8px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                Efficiency Metrics
              </span>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1 font-headline">
                Production Throughput
              </h4>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-secondary" />
                <span className="text-[9px] sm:text-xs text-on-surface-variant">Actual Output</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-outline-variant" />
                <span className="text-[9px] sm:text-xs text-on-surface-variant">Baseline</span>
              </div>
            </div>
          </div>

          <div className="h-44 sm:h-56 md:h-64 flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-2">
            <div className="w-full flex items-end gap-1 sm:gap-1.5 h-full">
              {[40, 55, 45, 72, 38, 42, 60, 88, 48, 52, 65, 75].map(
                (h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t transition-all duration-700 ${
                      i % 2 === 0
                        ? "bg-outline-variant/20"
                        : "bg-secondary group-hover:shadow-[0_0_10px_rgba(219,165,1,0.3)]"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                )
              )}
            </div>
          </div>
          <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex justify-between text-[7px] sm:text-[10px] text-on-surface-variant/60 tracking-widest uppercase">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i}>WK {String(i + 1).padStart(2, "0")}</span>
            ))}
          </div>
        </div>

        {/* Supplier Grades */}
        <div className="col-span-12 md:col-span-4 bg-primary-container border border-white/10 p-4 sm:p-6 md:p-8 rounded-xl flex flex-col">
          <h4 className="text-base sm:text-xl font-bold mb-5 sm:mb-8 flex items-center gap-2 sm:gap-3 font-headline">
            <span className="material-symbols-outlined text-secondary text-lg sm:text-2xl">
              verified
            </span>
            Supplier Grades
          </h4>
          <div className="space-y-2.5 sm:space-y-4 flex-1">
            {suppliers.map((s, i) => (
              <div
                key={s.name}
                className="p-3 sm:p-4 bg-white/[0.03] border border-white/10 rounded-lg flex justify-between items-center cursor-pointer hover:border-secondary/50 transition-colors"
                style={{ opacity: i === 0 ? 1 : 1 - i * 0.2 }}
              >
                <div className="min-w-0">
                  <p className="text-on-surface font-bold text-xs sm:text-sm truncate">{s.name}</p>
                  <p className="text-[8px] sm:text-[10px] text-on-surface-variant uppercase mt-0.5 sm:mt-1 tracking-widest">
                    {s.grade}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span
                    className={`text-lg sm:text-xl font-bold font-headline ${
                      i === 0 ? "text-secondary" : "text-on-surface-variant"
                    }`}
                    style={{ opacity: i === 0 ? 1 : 1 - i * 0.2 }}
                  >
                    {s.score}
                  </span>
                  <div className="flex gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 justify-end">
                    {Array.from({ length: 5 }, (_, j) => (
                      <div
                        key={j}
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                          j < s.bars ? "bg-secondary" : "bg-outline-variant"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowSupplierModal(0)}
            className="w-full mt-4 sm:mt-6 py-2 sm:py-2.5 text-[10px] sm:text-xs text-secondary uppercase border-t border-white/10 hover:text-white transition-colors text-center"
          >
            View Full Supplier Matrix
          </button>
        </div>

        {/* Report Templates */}
        <div className="col-span-12 mt-2 sm:mt-4">
          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-on-surface whitespace-nowrap font-headline">
              Report Templates
            </h4>
            <div className="h-px w-full bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {templates.map((t) => (
              <div
                key={t.title}
                className="bg-primary-container border border-white/10 p-4 sm:p-5 md:p-7 rounded-xl hover:border-secondary/40 transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/[0.03] rounded-lg flex items-center justify-center mb-3 sm:mb-4 md:mb-5 border border-white/10 group-hover:border-secondary/30 transition-colors">
                  <span
                    className={`material-symbols-outlined text-secondary text-lg sm:text-xl md:text-2xl ${
                      t.filled ? "fill-secondary" : ""
                    }`}
                    style={
                      t.filled
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {t.icon}
                  </span>
                </div>
                <h5 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 font-headline">{t.title}</h5>
                <p className="text-[10px] sm:text-xs md:text-sm text-on-surface-variant mb-5 sm:mb-6 md:mb-8 leading-relaxed">
                  {t.desc}
                </p>
                <div className="flex items-center justify-between pt-3 sm:pt-4 md:pt-5 border-t border-white/10">
                  <span
                    className={`text-[8px] sm:text-[10px] tracking-[0.1em] uppercase font-bold ${
                      t.live ? "text-secondary" : "text-on-surface-variant"
                    }`}
                  >
                    {t.meta}
                  </span>
                  <button
                    onClick={() => {
                      if (t.action === "download") {
                        alert(`Mengunduh laporan ${t.title}...`);
                      } else if (t.action === "print") {
                        window.print();
                      } else if (t.action === "share") {
                        navigator.clipboard.writeText(window.location.href).then(() => {
                          alert("Link berhasil disalin ke clipboard!");
                        });
                      }
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-xs sm:text-sm">
                      {t.action}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Status */}
        <div className="col-span-12 bg-primary-container/30 border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h4 className="font-bold flex items-center gap-2 sm:gap-3 font-headline text-sm sm:text-base">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(219,165,1,0.6)]" />
              Live System Status
            </h4>
            <span className="text-[9px] sm:text-xs text-secondary bg-secondary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-pill font-mono">
              Uptime: 99.9997%
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[8px] sm:text-[10px] text-on-surface-variant uppercase tracking-[0.2em] bg-white/[0.03]">
                  <th className="py-3 sm:py-4 px-3 sm:px-6 border-b border-white/10">
                    Event ID
                  </th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 border-b border-white/10 hidden sm:table-cell">
                    Origin
                  </th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 border-b border-white/10">
                    Event Description
                  </th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 border-b border-white/10 text-right">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="text-[9px] sm:text-xs font-mono">
                {systemEvents.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td
                      className={`py-3 sm:py-5 px-3 sm:px-6 font-bold ${
                        e.error ? "text-error" : "text-secondary"
                      }`}
                    >
                      {e.id}
                    </td>
                    <td className="py-3 sm:py-5 px-3 sm:px-6 text-on-surface hidden sm:table-cell">{e.origin}</td>
                    <td className="py-3 sm:py-5 px-3 sm:px-6 text-on-surface-variant group-hover:text-on-surface">
                      {e.desc}
                    </td>
                    <td className="py-3 sm:py-5 px-3 sm:px-6 text-right text-on-surface-variant">
                      {e.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={() => setShowDateModal(false)}>
          <div className="bg-primary-container border border-white/10 rounded-2xl p-5 sm:p-8 w-full max-w-sm shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg sm:text-xl font-bold text-on-surface mb-4 sm:mb-6 font-headline">Pilih Rentang Tanggal</h4>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Dari</label>
                <input type="date" className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Sampai</label>
                <input type="date" className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button onClick={() => setShowDateModal(false)} className="flex-1 py-2.5 sm:py-3 border border-white/10 rounded-pill text-on-surface-variant font-bold text-xs sm:text-sm hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleApplyDate} className="flex-1 py-2.5 sm:py-3 bg-secondary text-on-secondary rounded-pill font-bold text-xs sm:text-sm hover:brightness-110 transition-all">Terapkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Detail Modal */}
      {showSupplierModal !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={() => setShowSupplierModal(null)}>
          <div className="bg-primary-container border border-white/10 rounded-2xl p-5 sm:p-8 w-full max-w-lg shadow-2xl animate-scaleIn max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5 sm:mb-6">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-on-surface font-headline">Supplier Matrix</h4>
                <p className="text-on-surface-variant text-[10px] sm:text-xs mt-1">Detail lengkap seluruh supplier</p>
              </div>
              <button onClick={() => setShowSupplierModal(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {suppliers.map((s, i) => (
                <div key={s.name} className="p-3 sm:p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-on-surface">{s.name}</p>
                      <p className="text-[8px] sm:text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{s.grade}</p>
                    </div>
                    <span className={`text-xl sm:text-2xl font-bold font-headline shrink-0 ml-2 ${i === 0 ? "text-secondary" : "text-on-surface-variant"}`}>{s.score}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs sm:text-sm">location_on</span> {s.location}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs sm:text-sm">mail</span> {s.contact}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs sm:text-sm">calendar_today</span> Sejak {s.since}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs sm:text-sm">star</span> Grade: {s.grade}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
