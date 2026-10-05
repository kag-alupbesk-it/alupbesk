"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { CurrencyInput } from "./ui/CurrencyInput";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";
import { useApi } from "@/frontend/Manager/(keuangan)/hooks/useApi";
import { createKeuanganRecord, deleteKeuanganRecord, fetchKeuanganRecords, updateKeuanganRecord, updateKeuanganStatus } from "@/frontend/Manager/(keuangan)/services/operasional";
import type { PettyCashRecord } from "@/backend/modules/keuangan";

type PettyCashStatus = PettyCashRecord["status"];

const formatRp = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function PettyCashSection() {
  const { data, error, refetch } = useApi(() => fetchKeuanganRecords("petty_cash"), { interval: 30000 });
  const items = useMemo(
    () => (data ?? []).flatMap((record) => record.kind === "petty_cash" ? [record.data] : []),
    [data],
  );
  const [projectName, setProjectName] = useState("Proyek Pabrik Baru");
  const [targetNominal, setTargetNominal] = useState(3500000);
  const [tanggalProyek, setTanggalProyek] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState<PettyCashRecord | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PettyCashStatus>("all");
  const [toast, setToast] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [operationError, setOperationError] = useState("");

  const used = useMemo(
    () => items.filter((item) => item.status === "approved").reduce((sum, item) => sum + item.amount, 0),
    [items],
  );
  const target = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const remaining = target - used;
  const percentUsed = target > 0 ? Math.min((used / target) * 100, 100) : 0;
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !query || `${item.id} ${item.title} ${item.note}`.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
    });
  }, [items, search, statusFilter]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const submitPettyCash = async () => {
    const errors: Record<string, string> = {};
    if (!projectName.trim()) errors.projectName = "Nama proyek/mandor wajib diisi.";
    if (!Number.isFinite(targetNominal) || targetNominal <= 0) errors.targetNominal = "Nominal harus lebih dari Rp 0.";
    if (!tanggalProyek) errors.tanggalProyek = "Tanggal proyek wajib diisi.";
    if (!note.trim()) errors.note = "Catatan wajib diisi.";
    setFormErrors(errors);
    if (Object.keys(errors).length || busyId) return;

    const input = {
      title: projectName.trim(),
      amount: Math.round(targetNominal),
      date: tanggalProyek,
      note: note.trim(),
    };
    setBusyId(editing?.id ?? "new-petty-cash");
    setOperationError("");
    try {
      if (editing) await updateKeuanganRecord("petty_cash", editing.id, input);
      else await createKeuanganRecord("petty_cash", input);
      refetch();
      setEditing(null);
      setProjectName("");
      setTargetNominal(0);
      setTanggalProyek(new Date().toISOString().slice(0, 10));
      setNote("");
      setFormErrors({});
      setToast(editing ? "Pengajuan kas kecil diperbarui." : "Pengajuan kas kecil berhasil ditambahkan.");
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal menyimpan pengajuan kas kecil.");
    } finally {
      setBusyId(null);
    }
  };

  const beginEdit = (item: PettyCashRecord) => {
    setEditing(item);
    setProjectName(item.title);
    setTargetNominal(item.amount);
    setTanggalProyek(item.date);
    setNote(item.note);
    setFormErrors({});
  };

  const handleApprove = async (item: PettyCashRecord) => {
    setBusyId(item.id);
    setOperationError("");
    try {
      await updateKeuanganStatus(item.id, "approved");
      refetch();
      setToast("LPJ kas kecil berhasil diverifikasi.");
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal memverifikasi LPJ.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: PettyCashRecord) => {
    if (item.status !== "pending" || busyId) return;
    setBusyId(item.id);
    setOperationError("");
    try {
      await deleteKeuanganRecord(item.id);
      refetch();
      setToast("Pengajuan kas kecil dihapus.");
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal menghapus pengajuan kas kecil.");
    } finally {
      setBusyId(null);
    }
  };

  const clearError = (field: string) => {
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-outline/30 bg-primary-container p-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">{editing ? "Ubah Pengajuan Kas Kecil" : "Pengajuan Kas Kecil"}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Nama Mandor / Proyek
              <input value={projectName} onChange={(event) => { setProjectName(event.target.value); clearError("projectName"); }} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
              {formErrors.projectName && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.projectName}</span>}
            </label>

            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Target Nominal
              <CurrencyInput value={targetNominal} onChange={(value) => { setTargetNominal(value); clearError("targetNominal"); }} aria-label="Target nominal" />
              {formErrors.targetNominal && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.targetNominal}</span>}
            </label>

            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Tanggal Proyek
              <input type="date" value={tanggalProyek} onChange={(event) => { setTanggalProyek(event.target.value); clearError("tanggalProyek"); }} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
              {formErrors.tanggalProyek && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.tanggalProyek}</span>}
            </label>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant md:col-span-3">
              Catatan
              <textarea value={note} onChange={(event) => { setNote(event.target.value); clearError("note"); }} rows={2} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
              {formErrors.note && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.note}</span>}
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            {editing && <button type="button" onClick={() => { setEditing(null); setProjectName(""); setTargetNominal(0); setTanggalProyek(new Date().toISOString().slice(0, 10)); setNote(""); }} disabled={busyId !== null} className="rounded-xl border border-outline/30 px-4 py-2 text-xs font-bold text-on-surface">Batal</button>}
            <button type="button" onClick={() => void submitPettyCash()} disabled={busyId !== null} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-on-secondary disabled:cursor-wait disabled:opacity-60">
              {(busyId === "new-petty-cash" || (editing && busyId === editing.id)) && <Loader2 size={14} className="animate-spin" />}
              {busyId === "new-petty-cash" || (editing && busyId === editing.id) ? "Mengirim..." : editing ? "Simpan Perubahan" : "Ajukan Kas Kecil"}
            </button>
          </div>
          {(error || operationError) && <p role="alert" className="mt-3 text-xs text-error">{operationError || error}</p>}
        </div>

        <div className="space-y-3">
          <FinancialStatCard label="Belum diverifikasi" value={formatRp(remaining)} icon="◉" trend={`${Math.round(percentUsed)}% pengajuan sudah diverifikasi`} tone="amber" />
          <FinancialStatCard label="LPJ terverifikasi" value={formatRp(used)} icon="↗" trend={`Dari total pengajuan ${formatRp(target)}`} tone="blue" />
          <FinancialStatCard label="LPJ menunggu" value={String(items.filter((item) => item.status === "pending").length)} icon="◷" trend="Menunggu verifikasi" tone="amber" />
          <div className="px-1 pt-1">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              <span>Terverifikasi</span>
              <span>{Math.round(percentUsed)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-variant">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary to-amber-500" style={{ width: `${percentUsed}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-on-surface-variant">
              <span>{formatRp(used)} terverifikasi</span>
              <span>{formatRp(target)} diajukan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-outline/30 bg-primary-container p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Pelaporan Nota LPJ</h2>
            <p className="mt-1 text-[11px] text-on-surface-variant">Upload bukti nota struk dan verifikasi penggunaan kas kecil</p>
          </div>
          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">{filteredItems.length} dari {items.length} transaksi</span>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari ID, judul, catatan..." aria-label="Cari laporan kas kecil" className="min-w-0 flex-1 rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | PettyCashRecord["status"])} aria-label="Filter status LPJ" className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
            <option value="all">Semua status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Terverifikasi</option>
          </select>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-outline/20">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-variant/60 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Catatan</th>
                <th className="px-4 py-3">Verifikasi</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-outline/10">
                  <td className="px-4 py-3 text-xs font-semibold text-on-surface">{item.title}</td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface">{formatRp(item.amount)}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.date}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.note}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} label={item.status === "approved" ? "Terverifikasi" : undefined} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => beginEdit(item)} disabled={item.status === "approved" || busyId !== null} className="rounded-lg border border-outline/30 px-2 py-1.5 text-[10px] text-on-surface disabled:opacity-50">Ubah</button>
                      <button type="button" onClick={() => void handleDelete(item)} disabled={item.status === "approved" || busyId !== null} className="rounded-lg border border-red-500/30 px-2 py-1.5 text-[10px] text-red-700 disabled:opacity-50 dark:text-red-300">Hapus</button>
                      {item.status === "pending" && <button type="button" onClick={() => void handleApprove(item)} disabled={busyId !== null} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[10px] font-bold text-emerald-700 disabled:opacity-50 dark:text-emerald-300">{busyId === item.id ? <Loader2 size={14} className="animate-spin" /> : "Verifikasi"}</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-on-surface-variant">Tidak ada laporan yang cocok dengan pencarian.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <FeedbackToast message={toast} onDismiss={() => setToast("")} />
    </div>
  );
}
