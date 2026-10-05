"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useKeuangan } from "../keuangan/KeuanganContext";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";
import { useApi } from "@/frontend/Manager/(keuangan)/hooks/useApi";
import { createKeuanganRecord, deleteKeuanganRecord, fetchKeuanganRecords, updateKeuanganRecord, updateKeuanganStatus } from "@/frontend/Manager/(keuangan)/services/operasional";
import { fetchKas } from "@/frontend/Manager/(keuangan)/services/kas";
import type { ApprovalRecord } from "@/backend/modules/keuangan";

type ApprovalStatus = ApprovalRecord["status"];

const formatRp = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function ApprovalSection() {
  const { globalSaldo, setKasSnapshot } = useKeuangan();
  const { data, error, refetch } = useApi(() => fetchKeuanganRecords("approval"), { interval: 30000 });
  const expenses = useMemo(
    () => (data ?? []).flatMap((record) => record.kind === "approval" ? [record.data] : []),
    [data],
  );
  const [rejectTarget, setRejectTarget] = useState<ApprovalRecord | null>(null);
  const [editing, setEditing] = useState<ApprovalRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("Material");
  const [formError, setFormError] = useState("");
  const [operationError, setOperationError] = useState("");
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

  const handleApprove = async (expense: ApprovalRecord) => {
    if (expense.status !== "pending" || busyId) return;
    setBusyId(expense.id);
    setOperationError("");
    try {
      await updateKeuanganStatus(expense.id, "approved");
      refetch();
      setToast("Pengajuan disetujui; pengeluaran dicatat di buku Kas.");
      try {
        setKasSnapshot(await fetchKas());
      } catch (reason) {
        const detail = reason instanceof Error ? reason.message : "Terjadi kesalahan.";
        setOperationError(`Pengajuan disetujui, tetapi saldo Kas gagal dimuat ulang: ${detail}`);
      }
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal menyetujui pengajuan.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    setOperationError("");
    try {
      await updateKeuanganStatus(rejectTarget.id, "rejected", reason);
      refetch();
      setRejectTarget(null);
      setReason("");
      setToast("Pengajuan pengeluaran ditolak.");
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal menolak pengajuan.");
    } finally {
      setBusyId(null);
    }
  };

  const beginEdit = (item: ApprovalRecord) => {
    setEditing(item);
    setTitle(item.title);
    setVendor(item.vendor);
    setAmount(String(item.amount));
    setDate(item.date);
    setCategory(item.category);
    setFormOpen(true);
    setFormError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setTitle("");
    setVendor("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setCategory("Material");
    setFormError("");
  };

  const saveExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim() || !vendor.trim() || !category.trim() || !date || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Lengkapi seluruh data dan pastikan nominal lebih dari nol.");
      return;
    }
    setBusyId(editing?.id ?? "new-approval");
    setFormError("");
    try {
      const input = { title, vendor, amount: parsedAmount, date, category };
      if (editing) await updateKeuanganRecord("approval", editing.id, input);
      else await createKeuanganRecord("approval", input);
      refetch();
      closeForm();
      setToast(editing ? "Pengajuan diperbarui." : "Pengajuan berhasil ditambahkan.");
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Gagal menyimpan pengajuan.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: ApprovalRecord) => {
    if (item.status !== "pending" || busyId) return;
    setBusyId(item.id);
    setOperationError("");
    try {
      await deleteKeuanganRecord(item.id);
      refetch();
      setToast("Pengajuan dihapus.");
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal menghapus pengajuan.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialStatCard label="Menunggu" value={String(expenses.filter((item) => item.status === "pending").length)} icon="◷" trend="Pengajuan perlu ditinjau" tone="amber" />
        <FinancialStatCard label="Disetujui" value={String(expenses.filter((item) => item.status === "approved").length)} icon="✓" trend="Pengeluaran disetujui" tone="emerald" />
        <FinancialStatCard label="Total pending" value={formatRp(pendingTotal)} icon="Rp" trend="Nilai menunggu persetujuan" tone="red" />
        <FinancialStatCard label="Saldo Kas" value={formatRp(globalSaldo)} icon="Rp" trend="Saldo setelah simulasi approval" tone="blue" />
      </div>

      {operationError && <p role="alert" className="text-sm text-error">{operationError}</p>}

      <div className="rounded-2xl border border-outline/30 bg-primary-container p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Approval Pengeluaran</h2>
            <p className="mt-1 text-[11px] text-on-surface-variant">Kelola pengajuan pengeluaran dan persetujuan admin keuangan.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
              {expenses.filter((item) => item.status === "pending").length} menunggu
            </span>
            <button type="button" onClick={() => { closeForm(); setFormOpen(true); }} className="rounded-lg bg-secondary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-on-secondary">
              Tambah Pengajuan
            </button>
          </div>
        </div>

        {error && <p role="alert" className="mb-3 text-xs text-error">{error}</p>}

        {formOpen && (
          <form onSubmit={(event) => void saveExpense(event)} className="mb-4 grid gap-3 rounded-xl border border-outline/20 bg-surface-variant/30 p-3 md:grid-cols-5">
            <input aria-label="Keterangan" placeholder="Keterangan" value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface" />
            <input aria-label="Vendor" placeholder="Vendor" value={vendor} onChange={(event) => setVendor(event.target.value)} className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface" />
            <input aria-label="Kategori" placeholder="Kategori" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface" />
            <input aria-label="Nominal" type="number" min="1" step="1" placeholder="Nominal" value={amount} onChange={(event) => setAmount(event.target.value)} className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface" />
            <input aria-label="Tanggal" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface" />
            {formError && <p role="alert" className="text-xs text-error md:col-span-5">{formError}</p>}
            <div className="flex justify-end gap-2 md:col-span-5">
              <button type="button" onClick={closeForm} disabled={busyId !== null} className="rounded-lg border border-outline/30 px-3 py-2 text-xs text-on-surface">Batal</button>
              <button type="submit" disabled={busyId !== null} className="rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-on-secondary">
                {busyId === (editing?.id ?? "new-approval") ? <Loader2 size={14} className="animate-spin" /> : editing ? "Simpan Perubahan" : "Simpan Pengajuan"}
              </button>
            </div>
          </form>
        )}

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
                      {item.status === "pending" && (
                        <>
                          <button type="button" onClick={() => beginEdit(item)} disabled={busyId !== null} aria-label={`Ubah ${item.title}`} className="rounded-lg border border-outline/30 px-2 py-1.5 text-[10px] text-on-surface disabled:opacity-50">Ubah</button>
                          <button type="button" onClick={() => void handleDelete(item)} disabled={busyId !== null} aria-label={`Hapus ${item.title}`} className="rounded-lg border border-red-500/30 px-2 py-1.5 text-[10px] text-red-700 disabled:opacity-50 dark:text-red-300">Hapus</button>
                        </>
                      )}
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
