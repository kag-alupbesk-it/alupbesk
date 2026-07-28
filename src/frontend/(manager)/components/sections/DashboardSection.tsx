"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { financialCards, activities } from "../../data/managerData";

type RegistrationStatus = "pending" | "approved" | "rejected";

const initialRegistrations: { name: string; dept: string; date: string; initial: string; status: RegistrationStatus }[] = [
  { name: "Andi Wijaya", dept: "Logistik & Gudang", date: "12 Okt 2024", initial: "A", status: "pending" },
  { name: "Siti Aminah", dept: "Keuangan", date: "11 Okt 2024", initial: "S", status: "pending" },
  { name: "Bambang S.", dept: "Produksi Teknis", date: "10 Okt 2024", initial: "B", status: "pending" },
];

export default function DashboardSection() {
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
    <div className="p-10 min-h-screen flex gap-8">
      <div className="w-3/4 space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {financialCards.map((card) => (
            <div key={card.label} className="bg-primary-container border border-white/10 rounded-xl p-6 hover:border-secondary/50 transition-all group">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-secondary mb-4 font-headline">{card.value}</h3>
              <div className="flex items-center gap-2">
                <span className="flex items-end h-6 gap-0.5">
                  {card.bars.map((h, i) => (
                    <div key={i} className="w-1 rounded-t-sm" style={{ height: `${h * 4}px`, backgroundColor: i === card.bars.length - 1 ? "var(--color-secondary)" : "rgba(219,165,1,0.3)" }} />
                  ))}
                </span>
                <span className={`text-[10px] font-bold ${card.positive ? "text-secondary" : "text-red-400"}`}>{card.change}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-primary-container border border-white/10 rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-xl font-bold text-white font-headline">Pemasukan vs Pengeluaran</h4>
              <p className="text-white/40 text-xs mt-1">Financial trend comparison (Q4)</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /><span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pemasukan</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white/40" /><span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pengeluaran</span></div>
            </div>
          </div>
          <div className="w-full h-64 relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
              {[0, 100, 200, 300].map((y) => (<line key={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="0" x2="1000" y1={y} y2={y} />))}
              <path d="M0,180 Q125,120 250,190 T500,100 T750,130 T1000,70" fill="none" stroke="#dba501" strokeLinecap="round" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(219,165,1,0.3)]" />
              <defs><linearGradient id="goldGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#dba501" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
              <path d="M0,180 Q125,120 250,190 T500,100 T750,130 T1000,70 L1000,300 L0,300 Z" fill="url(#goldGrad)" opacity="0.05" />
            </svg>
            <div className="absolute inset-0 flex justify-between items-end px-2 pointer-events-none">
              {["JAN", "FEB", "MAR", "APR", "MEI", "JUN"].map((m) => (<span key={m} className="text-[9px] text-white/40 font-medium">{m}</span>))}
            </div>
          </div>
        </section>

        <section className="bg-primary-container border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h4 className="text-xl font-bold text-white font-headline">Pendaftaran Baru</h4>
            <button onClick={() => router.push("/manager/users")} className="text-secondary hover:underline text-xs font-bold uppercase tracking-wider">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Departemen</th>
                  <th className="px-6 py-4">Tanggal Daftar</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((r) => (
                  <tr key={r.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-secondary text-xs font-bold">{r.initial}</div>
                      <span className="text-xs font-bold text-white">{r.name}</span>
                    </td>
                    <td className="px-6 py-5 text-xs text-white/50">{r.dept}</td>
                    <td className="px-6 py-5 text-xs text-white/50">{r.date}</td>
                    <td className="px-6 py-5 text-right space-x-3">
                      {r.status === "pending" ? (
                        <>
                          <button onClick={() => handleApprove(r.name)} className="border border-secondary text-secondary text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-pill hover:bg-secondary hover:text-primary font-bold transition-all">Approve</button>
                          <button onClick={() => handleReject(r.name)} className="text-red-400 text-[10px] font-bold uppercase hover:underline">Tolak</button>
                        </>
                      ) : r.status === "approved" ? (
                        <span className="text-emerald-400 text-[10px] font-bold uppercase">Disetujui</span>
                      ) : (
                        <span className="text-red-400 text-[10px] font-bold uppercase">Ditolak</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="w-1/4 space-y-6">
        <div className="bg-primary-container border border-white/10 rounded-xl p-6 h-full">
          <div className="flex items-center justify-between mb-8">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-white">Aktivitas Real-time</h5>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          </div>
          <div className="space-y-6">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${a.highlight || a.system ? "bg-secondary" : "bg-white/40"}`} />
                  {i < activities.length - 1 && <div className="w-px flex-1 bg-white/10 my-2" />}
                </div>
                <div className="pb-4">
                  <p className="text-[9px] text-white/40 font-bold mb-1">{a.time}</p>
                  <p className={`text-xs ${a.system ? "font-bold text-secondary italic" : "text-white/70"}`}>
                    {a.system ? a.text : (<><span className="font-bold text-secondary">{a.text.split(":")[0]}:</span>{a.text.split(":").slice(1).join(":")}</>)}
                  </p>
                  {a.tag && <span className="inline-block mt-2 px-1.5 py-0.5 bg-secondary/10 text-secondary text-[8px] rounded font-bold uppercase border border-secondary/20">{a.tag}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-4 border border-white/10 rounded-lg bg-primary">
            <h6 className="text-[9px] font-bold text-white/40 uppercase mb-4 tracking-tighter">Status Sistem</h6>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]"><span className="text-white/40">Server Gudang</span><span className="text-secondary font-bold">94%</span></div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden"><div className="bg-secondary h-full w-[94%]" /></div>
              </div>
              <div className="flex justify-between items-center text-[10px]"><span className="text-white/40">Database Latency</span><span className="text-secondary font-bold">24ms</span></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
