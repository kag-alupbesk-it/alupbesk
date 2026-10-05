"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { CurrencyInput } from "./ui/CurrencyInput";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";

type PettyCashStatus = "pending" | "approved";

type LPJItem = {
  id: string;
  title: string;
  amount: number;
  date: string;
  note: string;
  status: PettyCashStatus;
  image?: string;
};

const initialLpj: LPJItem[] = [
  { id: "LPJ-01", title: "Pembelian material minor", amount: 1250000, date: "2026-10-01", note: "Paku, kabel, dan sak semen", status: "pending" },
  { id: "LPJ-02", title: "Perbaikan alat kerja", amount: 820000, date: "2026-09-29", note: "Baut dan kunci kombinasi", status: "approved" },
  { id: "LPJ-03", title: "Transport harian mandor", amount: 660000, date: "2026-09-28", note: "Biaya antar material", status: "pending" },
];

const formatRp = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function PettyCashSection() {
  const [projectName, setProjectName] = useState("Proyek Pabrik Baru");
  const [targetNominal, setTargetNominal] = useState(3500000);
  const [tanggalProyek, setTanggalProyek] = useState("2026-10-12");
  const [items, setItems] = useState<LPJItem[]>(initialLpj);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PettyCashStatus>("all");
  const [toast, setToast] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const used = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const target = targetNominal;
  const remaining = Math.max(target - used, 0);
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

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, id: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusyId(id);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    const previewUrl = URL.createObjectURL(file);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, image: previewUrl, status: "approved" } : item)));
    setBusyId(null);
    setToast("Bukti nota berhasil diunggah dan LPJ diverifikasi.");
  };

  const submitPettyCash = async () => {
    const errors: Record<string, string> = {};
    if (!projectName.trim()) errors.projectName = "Nama proyek/mandor wajib diisi.";
    if (!Number.isFinite(targetNominal) || targetNominal <= 0) errors.targetNominal = "Nominal harus lebih dari Rp 0.";
    if (!tanggalProyek) errors.tanggalProyek = "Tanggal proyek wajib diisi.";
    setFormErrors(errors);
    if (Object.keys(errors).length || busyId) return;

    const nextItem: LPJItem = {
      id: `LPJ-${Date.now()}`,
      title: `Pembelanjaan ${projectName}`,
      amount: Math.max(0, Math.round(targetNominal * 0.15)),
      date: tanggalProyek,
      note: "Pengajuan kas kecil baru",
      status: "pending",
    };
    setBusyId("new-petty-cash");
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    setItems((current) => [nextItem, ...current]);
    setBusyId(null);
    setToast("Pengajuan kas kecil berhasil ditambahkan.");
  };

  const clearError = (field: string) => {
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-outline/30 bg-primary-container p-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Pengajuan Kas Kecil</h2>
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
          </div>

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={() => void submitPettyCash()} disabled={busyId !== null} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-on-secondary disabled:cursor-wait disabled:opacity-60">
              {busyId === "new-petty-cash" && <Loader2 size={14} className="animate-spin" />}
              {busyId === "new-petty-cash" ? "Mengirim..." : "Ajukan Kas Kecil"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <FinancialStatCard label="Sisa kas kecil" value={formatRp(remaining)} icon="◉" trend={`${Math.round(percentUsed)}% anggaran terpakai`} tone="emerald" />
          <FinancialStatCard label="Kas terpakai" value={formatRp(used)} icon="↗" trend={`Dari target ${formatRp(target)}`} tone="blue" />
          <FinancialStatCard label="LPJ menunggu" value={String(items.filter((item) => item.status === "pending").length)} icon="◷" trend="Menunggu verifikasi" tone="amber" />
          <div className="px-1 pt-1">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              <span>Terpakai</span>
              <span>{Math.round(percentUsed)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-variant">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary to-amber-500" style={{ width: `${percentUsed}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-on-surface-variant">
              <span>{formatRp(used)} terpakai</span>
              <span>{formatRp(target)} target</span>
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
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | PettyCashStatus)} aria-label="Filter status LPJ" className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
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
                <th className="px-4 py-3">Bukti</th>
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
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface">
                      {busyId === item.id ? <Loader2 size={14} className="animate-spin" /> : "Upload Nota"}
                      <input type="file" accept="image/*" className="hidden" disabled={busyId !== null} onChange={(event) => void handleUpload(event, item.id)} />
                    </label>
                    {item.image && (
                      <div className="mt-2 h-20 w-28 overflow-hidden rounded-lg border border-outline/30 bg-surface-variant">
                        <img src={item.image} alt="Nota" className="h-full w-full object-cover" />
                      </div>
                    )}
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
