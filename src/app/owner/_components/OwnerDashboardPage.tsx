"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RegistrationStatus = "pending" | "approved" | "rejected";

const initialRegistrations: { name: string; dept: string; date: string; initial: string; status: RegistrationStatus }[] = [
  { name: "Andi Wijaya", dept: "Logistik & Gudang", date: "12 Okt 2024", initial: "A", status: "pending" },
  { name: "Siti Aminah", dept: "Keuangan", date: "11 Okt 2024", initial: "S", status: "pending" },
  { name: "Bambang S.", dept: "Produksi Teknis", date: "10 Okt 2024", initial: "B", status: "pending" },
];

const financialCards = [
  {
    label: "Total Pendapatan",
    value: "Rp 4.25M",
    change: "+12.4%",
    positive: true,
    bars: [2, 4, 3, 5, 4],
  },
  {
    label: "Biaya Operasional",
    value: "Rp 1.12M",
    change: "-2.1%",
    positive: false,
    bars: [4, 6, 3, 2, 5],
  },
  {
    label: "Laba Bersih",
    value: "Rp 3.13M",
    change: "+8.7%",
    positive: true,
    bars: [3, 5, 6, 4, 8],
  },
];

const activities = [
  {
    time: "09:45 WIB",
    text: "Admin Budi: Update harga T-Slot 4040",
    tag: "Inventory",
    highlight: true,
  },
  { time: "08:30 WIB", text: "Staf Gudang Andi: Mengeluarkan 50 unit Linear Rail" },
  { time: "07:00 WIB", text: "Sistem: Backup data selesai", system: true },
  { time: "Kemarin, 17:15", text: "Direktur: Mengunduh Laporan Keuangan Q3" },
];

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);

  const handleApprove = (name: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.name === name ? { ...r, status: "approved" as RegistrationStatus } : r))
    );
  };

  const handleReject = (name: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.name === name ? { ...r, status: "rejected" as RegistrationStatus } : r))
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-10 min-h-screen flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8">
      {/* Main Content */}
      <div className="w-full xl:w-3/4 space-y-6 sm:space-y-10">
        {/* Financial Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          {financialCards.map((card) => (
            <div
              key={card.label}
              className="bg-primary-container border border-white/10 rounded-xl p-4 sm:p-6 hover:border-secondary/50 transition-all group"
            >
              <p className="text-on-surface-variant text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-1">
                {card.label}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-3 sm:mb-4 font-headline">
                {card.value}
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex items-end h-5 sm:h-6 gap-0.5">
                  {card.bars.map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-t-sm"
                      style={{
                        height: `${h * 3.5}px`,
                        backgroundColor:
                          i === card.bars.length - 1
                            ? "var(--color-secondary)"
                            : "rgba(219,165,1,0.3)",
                      }}
                    />
                  ))}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold ${
                    card.positive ? "text-secondary" : "text-error"
                  }`}
                >
                  {card.change}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Chart Section */}
        <section className="bg-primary-container border border-white/10 rounded-xl p-3 sm:p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div>
              <h4 className="text-base sm:text-xl font-bold text-on-surface font-headline">
                Pemasukan vs Pengeluaran
              </h4>
              <p className="text-on-surface-variant text-[10px] sm:text-xs mt-1">
                Financial trend comparison (Q4)
              </p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-secondary" />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Pemasukan
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-on-surface-variant" />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Pengeluaran
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-44 sm:h-64 relative">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 1000 300"
            >
              {[0, 100, 200, 300].map((y) => (
                <line
                  key={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  x1="0"
                  x2="1000"
                  y1={y}
                  y2={y}
                />
              ))}
              <path
                d="M0,220 Q250,240 500,200 T1000,230"
                fill="none"
                opacity="0.4"
                stroke="#9ca3af"
                strokeDasharray="6 4"
                strokeWidth="2"
              />
              <path
                d="M0,180 Q125,120 250,190 T500,100 T750,130 T1000,70"
                fill="none"
                stroke="#dba501"
                strokeLinecap="round"
                strokeWidth="3"
                className="drop-shadow-[0_0_10px_rgba(219,165,1,0.3)]"
              />
              <defs>
                <linearGradient id="goldGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#dba501" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M0,180 Q125,120 250,190 T500,100 T750,130 T1000,70 L1000,300 L0,300 Z"
                fill="url(#goldGrad)"
                opacity="0.05"
              />
            </svg>
            <div className="absolute inset-0 flex justify-between items-end px-2 pointer-events-none">
              {["JAN", "FEB", "MAR", "APR", "MEI", "JUN"].map((m) => (
                <span
                  key={m}
                  className="text-[9px] text-on-surface-variant font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Table */}
        <section className="bg-primary-container border border-white/10 rounded-xl overflow-hidden">
          <div className="p-3 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h4 className="text-base sm:text-xl font-bold text-on-surface font-headline">
              Pendaftaran Baru
            </h4>
            <button
              onClick={() => router.push("/owner/users")}
              className="text-secondary hover:underline text-[10px] sm:text-xs font-bold uppercase tracking-wider"
            >
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.03] text-on-surface-variant text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Nama</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Departemen</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Tanggal Daftar</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((r) => (
                  <tr
                    key={r.name}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-5 flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-outline-variant flex items-center justify-center text-secondary text-[10px] sm:text-xs font-bold shrink-0">
                        {r.initial}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold block truncate">{r.name}</span>
                        <span className="text-[8px] sm:text-[10px] text-on-surface-variant sm:hidden block">{r.dept}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-[10px] sm:text-xs text-on-surface-variant hidden sm:table-cell">
                      {r.dept}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-[10px] sm:text-xs text-on-surface-variant hidden md:table-cell">
                      {r.date}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-right space-x-2 sm:space-x-3">
                      {r.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(r.name)}
                            className="border border-secondary text-secondary text-[8px] sm:text-[10px] uppercase tracking-wider px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-pill hover:bg-secondary hover:text-on-secondary font-bold transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.name)}
                            className="text-error text-[8px] sm:text-[10px] font-bold uppercase hover:underline"
                          >
                            Tolak
                          </button>
                        </>
                      ) : r.status === "approved" ? (
                        <span className="text-success text-[8px] sm:text-[10px] font-bold uppercase">
                          Disetujui
                        </span>
                      ) : (
                        <span className="text-error text-[8px] sm:text-[10px] font-bold uppercase">
                          Ditolak
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <aside className="w-full xl:w-1/4 space-y-4 sm:space-y-6">
        <div className="bg-primary-container border border-white/10 rounded-xl p-3 sm:p-4 md:p-6 h-full">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h5 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface">
              Aktivitas Real-time
            </h5>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          </div>

          <div className="space-y-4 sm:space-y-6">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      a.highlight || a.system ? "bg-secondary" : "bg-on-surface-variant"
                    }`}
                  />
                  {i < activities.length - 1 && (
                    <div className="w-px flex-1 bg-outline my-2" />
                  )}
                </div>
                <div className="pb-3 sm:pb-4">
                  <p className="text-[8px] sm:text-[9px] text-on-surface-variant font-bold mb-0.5 sm:mb-1">
                    {a.time}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs ${
                      a.system ? "font-bold text-secondary italic" : ""
                    }`}
                  >
                    {a.system ? (
                      a.text
                    ) : (
                      <>
                        <span className="font-bold text-secondary">
                          {a.text.split(":")[0]}:
                        </span>
                        {a.text.split(":").slice(1).join(":")}
                      </>
                    )}
                  </p>
                  {a.tag && (
                    <span className="inline-block mt-2 px-1.5 py-0.5 bg-secondary/10 text-secondary text-[8px] rounded font-bold uppercase border border-secondary/20">
                      {a.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* System Status */}
          <div className="mt-8 sm:mt-12 p-3 sm:p-4 border border-white/10 rounded-lg bg-white/[0.03]">
            <h6 className="text-[8px] sm:text-[9px] font-bold text-on-surface-variant uppercase mb-3 sm:mb-4 tracking-tighter">
              Status Sistem
            </h6>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
                  <span className="text-on-surface-variant">Server Gudang</span>
                  <span className="text-secondary font-bold">94%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[94%]" />
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
                <span className="text-on-surface-variant">Database Latency</span>
                <span className="text-secondary font-bold">24ms</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
