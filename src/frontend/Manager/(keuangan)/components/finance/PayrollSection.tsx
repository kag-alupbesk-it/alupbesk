"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { useKeuangan } from "../keuangan/KeuanganContext";
import type { PayrollItem } from "../keuangan/KeuanganContext";
import { CurrencyInput } from "./ui/CurrencyInput";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";

const formatRp = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function PayrollSection() {
  const { globalSaldo, payrollItems: items, addPayroll, disbursePayroll } = useKeuangan();
  const [name, setName] = useState("Tim Kuli Proyek Baru");
  const [role, setRole] = useState("Pekerja Lapangan");
  const [workers, setWorkers] = useState("8");
  const [days, setDays] = useState("15");
  const [rate, setRate] = useState(180000);
  const [type, setType] = useState<PayrollItem["type"]>("harian");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PayrollItem["status"]>("all");
  const [toast, setToast] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

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

    const nextItem: PayrollItem = {
      id: `P-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      workers: Number(workers),
      days: Number(days),
      rate,
      type,
      status: "unpaid",
    };
    setBusyId("new-payroll");
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    addPayroll(nextItem);
    setName("");
    setRole("Pekerja Lapangan");
    setWorkers("8");
    setDays("15");
    setRate(180000);
    setType("harian");
    setFormErrors({});
    setBusyId(null);
    setToast("Data payroll berhasil ditambahkan.");
  };

  const handleDisburse = async (item: PayrollItem) => {
    if (item.status !== "unpaid" || busyId) return;
    setBusyId(item.id);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    const now = new Date();
    disbursePayroll(item.id, {
      id: `sim-payroll-${item.id}-${now.getTime()}`,
      tipe: "keluar",
      sumber: "Simulasi payroll",
      deskripsi: `Pencairan gaji ${item.name}`,
      jumlah: item.workers * item.days * item.rate,
      kategori: "operasional",
      tanggal: now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
      relatedId: item.id,
    });
    setBusyId(null);
    setToast(`Gaji ${item.name} dicairkan; saldo dan riwayat Kas diperbarui.`);
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
              <select value={type} onChange={(event) => setType(event.target.value as PayrollItem["type"])} className="mt-2 w-full rounded-xl border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
                <option value="harian">Harian</option>
                <option value="borongan">Borongan</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={() => void submitPayroll()} disabled={busyId !== null} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-on-secondary disabled:cursor-wait disabled:opacity-60">
              {busyId === "new-payroll" && <Loader2 size={14} className="animate-spin" />}
              {busyId === "new-payroll" ? "Menyimpan..." : "Simpan Payroll"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <FinancialStatCard label="Total payroll" value={formatRp(totalPayroll)} icon="Rp" trend={`${items.length} kelompok pekerja`} tone="blue" />
          <FinancialStatCard label="Belum dibayar" value={formatRp(unpaidTotal)} icon="◷" trend="Total kewajiban payroll" tone="amber" />
          <FinancialStatCard label="Jumlah pekerja" value={String(items.reduce((sum, item) => sum + item.workers, 0))} icon="♙" trend="Dalam seluruh kelompok payroll" tone="emerald" />
          <FinancialStatCard label="Saldo Kas" value={formatRp(globalSaldo)} icon="Rp" trend="Setelah simulasi pencairan" tone="blue" />
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
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | PayrollItem["status"])} aria-label="Filter status payroll" className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
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
                  <td className="px-4 py-3 text-right"><button type="button" onClick={() => void handleDisburse(item)} disabled={item.status === "paid" || busyId !== null} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary disabled:cursor-not-allowed disabled:opacity-50">{busyId === item.id && <Loader2 size={13} className="animate-spin" />}{item.status === "paid" ? "Sudah cair" : busyId === item.id ? "Memproses..." : "Cairkan Gaji"}</button></td>
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
