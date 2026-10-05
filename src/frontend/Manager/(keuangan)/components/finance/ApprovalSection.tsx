"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useKeuangan } from "../keuangan/KeuanganContext";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";
import type { ApprovalStatus, ExpenseApproval } from "../keuangan/KeuanganContext";

const formatRp = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function ApprovalSection() {
  const { globalSaldo, pendingApprovals: expenses, approveExpense, rejectExpense } = useKeuangan();
  const [rejectTarget, setRejectTarget] = useState<ExpenseApproval | null>(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApprovalStatus>("all");
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingTotal = useMemo(
    () => expenses.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  );
  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((item) => {
      const matchesSearch = !query || `${item.id} ${item.title} ${item.vendor} ${item.category}`.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
    });
  }, [expenses, search, statusFilter]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleApprove = async (expense: ExpenseApproval) => {
    if (expense.status !== "pending" || busyId) return;
    setBusyId(expense.id);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    const now = new Date();
    approveExpense(expense.id, {
      id: `sim-approval-${expense.id}-${now.getTime()}`,
      tipe: "keluar",
      sumber: "Simulasi approval",
      deskripsi: `${expense.title} · ${expense.vendor}`,
      jumlah: expense.amount,
      kategori: "operasional",
      tanggal: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
      relatedId: expense.id,
    });
    setBusyId(null);
    setToast("Pengajuan disetujui; saldo dan riwayat Kas diperbarui.");
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    rejectExpense(rejectTarget.id);
    setBusyId(null);
    setRejectTarget(null);
    setReason("");
    setToast("Pengajuan pengeluaran ditolak.");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialStatCard label="Menunggu" value={String(expenses.filter((item) => item.status === "pending").length)} icon="◷" trend="Pengajuan perlu ditinjau" tone="amber" />
        <FinancialStatCard label="Disetujui" value={String(expenses.filter((item) => item.status === "approved").length)} icon="✓" trend="Pengeluaran disetujui" tone="emerald" />
        <FinancialStatCard label="Total pending" value={formatRp(pendingTotal)} icon="Rp" trend="Nilai menunggu persetujuan" tone="red" />
        <FinancialStatCard label="Saldo Kas" value={formatRp(globalSaldo)} icon="Rp" trend="Saldo setelah simulasi approval" tone="blue" />
      </div>

      <div className="rounded-2xl border border-outline/30 bg-primary-container p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Approval Pengeluaran</h2>
            <p className="mt-1 text-[11px] text-on-surface-variant">Persetujuan khusus untuk pengajuan di atas Rp 5.000.000</p>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            {expenses.filter((item) => item.status === "pending").length} menunggu
          </span>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari ID, keterangan, vendor..." aria-label="Cari pengajuan" className="min-w-0 flex-1 rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | ApprovalStatus)} aria-label="Filter status pengajuan" className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
            <option value="all">Semua status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-outline/20">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-variant/60 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((item) => (
                <tr key={item.id} className="border-t border-outline/10 bg-transparent">
                  <td className="px-4 py-3 text-xs font-semibold text-on-surface">{item.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-on-surface">{item.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{item.date}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.vendor}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.category}</td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface">{formatRp(item.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleApprove(item)}
                        disabled={item.status !== "pending" || busyId !== null}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300"
                      >
                        {busyId === item.id ? <Loader2 size={14} className="animate-spin" aria-label="Memproses" /> : "Setujui"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(item)}
                        disabled={item.status !== "pending" || busyId !== null}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-on-surface-variant">Tidak ada pengajuan yang cocok dengan pencarian.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-outline/30 bg-primary-container p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Tolak Pengeluaran</p>
                <h3 className="mt-1 text-base font-bold text-on-surface">{rejectTarget.title}</h3>
              </div>
              <button type="button" onClick={() => setRejectTarget(null)} className="text-on-surface-variant">✕</button>
            </div>

            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Alasan penolakan</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none ring-0 placeholder:text-on-surface-variant focus:border-secondary"
              placeholder="Masukkan alasan penolakan ..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRejectTarget(null)} className="rounded-lg border border-outline/30 px-4 py-2 text-xs font-bold text-on-surface">
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleReject()}
                disabled={!reason.trim() || busyId !== null}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyId === rejectTarget.id ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Memproses...</span> : "Simpan Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}
      <FeedbackToast message={toast} onDismiss={() => setToast("")} />
    </div>
  );
}
