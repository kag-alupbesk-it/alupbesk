"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { useKeuangan } from "../keuangan/KeuanganContext";
import { useApi } from "@/frontend/Manager/(keuangan)/hooks/useApi";
import { createKeuanganRecord, deleteKeuanganRecord, fetchKeuanganRecords, updateKeuanganRecord, updateKeuanganStatus } from "@/frontend/Manager/(keuangan)/services/operasional";
import { fetchKas } from "@/frontend/Manager/(keuangan)/services/kas";
import type { PayrollRecord } from "@/backend/modules/keuangan";
import { CurrencyInput } from "./ui/CurrencyInput";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";

const formatRp = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function PayrollSection() {
  const { globalSaldo, setKasSnapshot } = useKeuangan();
  const { data, error, refetch } = useApi(() => fetchKeuanganRecords("payroll"), { interval: 30000 });
  const items = useMemo(
    () => (data ?? []).flatMap((record) => record.kind === "payroll" ? [record.data] : []),
    [data],
  );
  const [name, setName] = useState("Tim Kuli Proyek Baru");
  const [role, setRole] = useState("Pekerja Lapangan");
  const [workers, setWorkers] = useState("8");
  const [days, setDays] = useState("15");
  const [rate, setRate] = useState(180000);
  const [type, setType] = useState<PayrollRecord["type"]>("harian");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PayrollRecord["status"]>("all");
  const [toast, setToast] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<PayrollRecord | null>(null);
  const [operationError, setOperationError] = useState("");

  const totalPayroll = useMemo(
    () => items.reduce((sum, item) => sum + item.workers * item.days * item.rate, 0),
    [items],
  );
  const unpaidTotal = useMemo(
    () => items.filter((item) => item.status === "unpaid").reduce((sum, item) => sum + item.workers * item.days * item.rate, 0),
    [items],
  );
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !query || `${item.name} ${item.role} ${item.type}`.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
    });
  }, [items, search, statusFilter]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const submitPayroll = async () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Nama tim wajib diisi.";
    if (!role.trim()) errors.role = "Peran wajib diisi.";
    if (!Number.isInteger(Number(workers)) || Number(workers) <= 0) errors.workers = "Jumlah pekerja minimal 1.";
    if (!Number.isInteger(Number(days)) || Number(days) <= 0) errors.days = "Hari kerja minimal 1.";
    if (!Number.isFinite(rate) || rate <= 0) errors.rate = "Tarif harus lebih dari Rp 0.";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const input = {
      name: name.trim(),
      role: role.trim(),
      workers: Number(workers),
      days: Number(days),
      rate,
      type,
    };
    setBusyId(editing?.id ?? "new-payroll");
    setOperationError("");
    try {
      if (editing) await updateKeuanganRecord("payroll", editing.id, input);
      else await createKeuanganRecord("payroll", input);
      refetch();
      setEditing(null);
      setName("");
      setRole("Pekerja Lapangan");
      setWorkers("8");
      setDays("15");
      setRate(180000);
      setType("harian");
      setFormErrors({});
      setToast(editing ? "Data payroll diperbarui." : "Data payroll berhasil ditambahkan.");
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal menyimpan data payroll.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDisburse = async (item: PayrollRecord) => {
    if (item.status !== "unpaid" || busyId) return;
    setBusyId(item.id);
    setOperationError("");
    try {
      await updateKeuanganStatus(item.id, "paid");
      refetch();
      setToast(`Gaji ${item.name} dicairkan dan dicatat di buku Kas.`);
      try {
        setKasSnapshot(await fetchKas());
      } catch (reason) {
        const detail = reason instanceof Error ? reason.message : "Terjadi kesalahan.";
        setOperationError(`Payroll berhasil dicairkan, tetapi saldo Kas gagal dimuat ulang: ${detail}`);
      }
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal mencairkan payroll.");
    } finally {
      setBusyId(null);
    }
  };

  const beginEdit = (item: PayrollRecord) => {
    setEditing(item);
    setName(item.name);
    setRole(item.role);
    setWorkers(String(item.workers));
    setDays(String(item.days));
    setRate(item.rate);
    setType(item.type);
    setFormErrors({});
  };

  const handleDelete = async (item: PayrollRecord) => {
    if (item.status !== "unpaid" || busyId) return;
    setBusyId(item.id);
    setOperationError("");
    try {
      await deleteKeuanganRecord(item.id);
      refetch();
      setToast("Data payroll dihapus.");
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : "Gagal menghapus payroll.");
    } finally {
      setBusyId(null);
    }
  };

  const clearError = (field: string) => {
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const preventInvalidNumberKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E", "."].includes(event.key)) event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-outline/30 bg-primary-container p-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Input Gaji Kuli / Staf</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Nama Tim / Pegawai
              <input value={name} onChange={(event) => { setName(event.target.value); clearError("name"); }} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
              {formErrors.name && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.name}</span>}
            </label>

            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Peran
              <input value={role} onChange={(event) => { setRole(event.target.value); clearError("role"); }} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
              {formErrors.role && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.role}</span>}
            </label>

            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Jumlah Pekerja
              <input type="number" min="1" step="1" value={workers} onKeyDown={preventInvalidNumberKey} onChange={(event) => { setWorkers(event.target.value); clearError("workers"); }} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
              {formErrors.workers && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.workers}</span>}
            </label>

            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Hari Kerja
              <input type="number" min="1" step="1" value={days} onKeyDown={preventInvalidNumberKey} onChange={(event) => { setDays(event.target.value); clearError("days"); }} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
              {formErrors.days && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.days}</span>}
            </label>

            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Tarif per Hari
              <CurrencyInput value={rate} onChange={(value) => { setRate(value); clearError("rate"); }} aria-label="Tarif per hari" />
              {formErrors.rate && <span role="alert" className="mt-1 block text-xs normal-case text-error">{formErrors.rate}</span>}
            </label>

            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Tipe Pembayaran
              <select value={type} onChange={(event) => setType(event.target.value as PayrollRecord["type"])} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
                <option value="harian">Harian</option>
                <option value="borongan">Borongan</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={() => void submitPayroll()} disabled={busyId !== null} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-on-secondary disabled:cursor-wait disabled:opacity-60">
              {(busyId === "new-payroll" || (editing && busyId === editing.id)) && <Loader2 size={14} className="animate-spin" />}
              {busyId === "new-payroll" || (editing && busyId === editing.id) ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Payroll"}
            </button>
            {editing && <button type="button" onClick={() => { setEditing(null); setName(""); setRole("Pekerja Lapangan"); setWorkers("8"); setDays("15"); setRate(180000); setType("harian"); }} className="rounded-xl border border-outline/30 px-4 py-2 text-xs font-bold text-on-surface">Batal ubah</button>}
          </div>
          {(error || operationError) && <p role="alert" className="mt-3 text-xs text-error">{operationError || error}</p>}
        </div>

        <div className="space-y-3">
          <FinancialStatCard label="Total payroll" value={formatRp(totalPayroll)} icon="Rp" trend={`${items.length} kelompok pekerja`} tone="blue" />
          <FinancialStatCard label="Belum dibayar" value={formatRp(unpaidTotal)} icon="◷" trend="Total kewajiban payroll" tone="amber" />
          <FinancialStatCard label="Jumlah pekerja" value={String(items.reduce((sum, item) => sum + item.workers, 0))} icon="♙" trend="Dalam seluruh kelompok payroll" tone="emerald" />
          <FinancialStatCard label="Saldo Kas" value={formatRp(globalSaldo)} icon="Rp" trend="Setelah pencairan payroll" tone="blue" />
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-outline/20 bg-surface-variant/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Mingguan</p>
              <p className="mt-2 text-lg font-black text-on-surface">{formatRp(totalPayroll / 4)}</p>
            </div>
            <div className="rounded-xl border border-outline/20 bg-surface-variant/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Bulanan</p>
              <p className="mt-2 text-lg font-black text-on-surface">{formatRp(totalPayroll)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-outline/30 bg-primary-container p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Daftar Gaji Staf & Pekerja Lapangan</h2>
            <p className="mt-1 text-[11px] text-on-surface-variant">Rekap pembiayaan payroll berdasarkan pekerjaan dan durasi</p>
          </div>
          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">{filteredItems.length} dari {items.length} data</span>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, peran, tipe..." aria-label="Cari data payroll" className="min-w-0 flex-1 rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | PayrollRecord["status"])} aria-label="Filter status payroll" className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
            <option value="all">Semua status</option>
            <option value="paid">Dibayar</option>
            <option value="unpaid">Belum dibayar</option>
          </select>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-outline/20">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-variant/60 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3">Pekerja</th>
                <th className="px-4 py-3">Hari</th>
                <th className="px-4 py-3">Tarif</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-outline/10">
                  <td className="px-4 py-3 text-xs font-semibold text-on-surface">{item.name}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.role}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.workers}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{item.days}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{formatRp(item.rate)}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant capitalize">{item.type}</td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface">{formatRp(item.workers * item.days * item.rate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => beginEdit(item)} disabled={item.status === "paid" || busyId !== null} className="rounded-lg border border-outline/30 px-2 py-1.5 text-[10px] text-on-surface disabled:opacity-50">Ubah</button>
                      <button type="button" onClick={() => void handleDelete(item)} disabled={item.status === "paid" || busyId !== null} className="rounded-lg border border-red-500/30 px-2 py-1.5 text-[10px] text-red-700 disabled:opacity-50 dark:text-red-300">Hapus</button>
                      <button type="button" onClick={() => void handleDisburse(item)} disabled={item.status === "paid" || busyId !== null} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary disabled:cursor-not-allowed disabled:opacity-50">{busyId === item.id && <Loader2 size={13} className="animate-spin" />}{item.status === "paid" ? "Sudah cair" : busyId === item.id ? "Memproses..." : "Cairkan Gaji"}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-on-surface-variant">Tidak ada data payroll yang cocok dengan pencarian.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <FeedbackToast message={toast} onDismiss={() => setToast("")} />
    </div>
  );
}
