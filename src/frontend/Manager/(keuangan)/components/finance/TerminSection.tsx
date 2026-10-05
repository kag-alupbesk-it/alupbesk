"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { CurrencyInput } from "./ui/CurrencyInput";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";

type MilestoneStatus = "paid" | "unpaid";

type ProjectMilestone = {
  id: string;
  name: string;
  amount: number;
  progress: number;
  status: MilestoneStatus;
  projectName?: string;
  clientName?: string;
  dueDate?: string;
  percentage?: number;
};

type MilestoneDraft = {
  id: string;
  name: string;
  amount: string;
  percentage: string;
  dueDate: string;
};

const initialMilestones: ProjectMilestone[] = [
  { id: "dp", name: "DP (Down Payment)", amount: 500000000, progress: 25, status: "paid" },
  { id: "termin-1", name: "Termin 1 (Progress 50%)", amount: 350000000, progress: 50, status: "paid" },
  { id: "termin-2", name: "Termin 2 (Progress 100%)", amount: 300000000, progress: 100, status: "unpaid" },
  { id: "retensi", name: "Retensi (5%)", amount: 75000000, progress: 100, status: "unpaid" },
];

const formatRp = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function TerminSection() {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(initialMilestones);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MilestoneStatus>("all");
  const [toast, setToast] = useState("");
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [contractValue, setContractValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [nextStageId, setNextStageId] = useState(2);
  const [stageDrafts, setStageDrafts] = useState<MilestoneDraft[]>([
    { id: "stage-1", name: "", amount: "", percentage: "", dueDate: "" },
  ]);

  const totalDraftAmount = useMemo(
    () => stageDrafts.reduce((total, stage) => total + (Number(stage.amount) || 0), 0),
    [stageDrafts],
  );
  const totalDraftPercentage = stageDrafts.reduce(
    (total, stage) => total + Math.round((Number(stage.percentage) || 0) * 100),
    0,
  ) / 100;
  const isNominalBalanced = contractValue > 0 && totalDraftAmount === contractValue;
  const isPercentageBalanced = totalDraftPercentage === 100;
  const isTotalBalanced = isNominalBalanced && isPercentageBalanced;
  const areDraftFieldsValid = Boolean(
    projectName.trim() &&
      clientName.trim() &&
      stageDrafts.length > 0 &&
      stageDrafts.every((stage) => stage.name.trim() && stage.dueDate && Number(stage.amount) > 0 && Number(stage.percentage) >= 0 && Number(stage.percentage) <= 100),
  );

  const filteredMilestones = useMemo(() => {
    const query = search.trim().toLowerCase();
    return milestones.filter((item) => {
      const matchesSearch = !query || `${item.name} ${item.projectName ?? ""} ${item.clientName ?? ""}`.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
    });
  }, [milestones, search, statusFilter]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const markPaid = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    setMilestones((current) => current.map((item) => (item.id === id ? { ...item, status: "paid" } : item)));
    setBusyId(null);
    setToast("Termin berhasil ditandai sudah dibayar.");
  };

  const updateContractValue = (value: number) => {
    setContractValue(value);
    setStageDrafts((current) => current.map((stage) => ({
      ...stage,
      percentage: value > 0 && Number(stage.amount) > 0
        ? ((Number(stage.amount) / value) * 100).toFixed(2).replace(/\.00$/, "")
        : "",
    })));
  };

  const updateStageAmount = (id: string, rawAmount: string) => {
    const amount = String(Math.max(0, Math.floor(Number(rawAmount.replace(/\D/g, "")) || 0)));
    setStageDrafts((current) => current.map((stage) => stage.id === id ? {
      ...stage,
      amount: amount === "0" ? "" : amount,
      percentage: contractValue > 0 && Number(amount) > 0
        ? ((Number(amount) / contractValue) * 100).toFixed(2).replace(/\.00$/, "")
        : "",
    } : stage));
  };

  const updateStagePercentage = (id: string, rawPercentage: string) => {
    const percentage = rawPercentage === "" ? "" : String(Math.max(0, Number(rawPercentage) || 0));
    const amount = contractValue > 0 && Number(percentage) > 0
      ? String(Math.round((contractValue * Number(percentage)) / 100))
      : "";
    setStageDrafts((current) => current.map((stage) => stage.id === id ? { ...stage, percentage, amount } : stage));
  };

  const updateStage = (id: string, updates: Partial<MilestoneDraft>) => {
    setStageDrafts((current) => current.map((stage) => stage.id === id ? { ...stage, ...updates } : stage));
  };

  const addStage = () => {
    setStageDrafts((current) => [...current, { id: `stage-${nextStageId}`, name: "", amount: "", percentage: "", dueDate: "" }]);
    setNextStageId((current) => current + 1);
  };

  const removeStage = (id: string) => {
    setStageDrafts((current) => current.filter((stage) => stage.id !== id));
  };

  const createSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isTotalBalanced || !areDraftFieldsValid || saving) return;
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));

    const projectMilestones = stageDrafts.map((stage): ProjectMilestone => ({
      id: `custom-${Date.now()}-${stage.id}`,
      name: stage.name.trim(),
      amount: Number(stage.amount),
      progress: Number(stage.percentage) || 0,
      percentage: contractValue > 0 ? (Number(stage.amount) / contractValue) * 100 : 0,
      status: "unpaid",
      projectName: projectName.trim(),
      clientName: clientName.trim(),
      dueDate: stage.dueDate,
    }));

    setMilestones((current) => [...projectMilestones, ...current]);
    setSearch(projectName.trim());
    setStatusFilter("all");
    setToast(`Skema termin untuk ${projectName.trim()} berhasil ditambahkan.`);
    setProjectName("");
    setClientName("");
    setContractValue(0);
    setStageDrafts([{ id: `stage-${nextStageId}`, name: "", amount: "", percentage: "", dueDate: "" }]);
    setNextStageId((current) => current + 1);
    setIsSchemaModalOpen(false);
    setSaving(false);
  };

  const totalPaid = milestones.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const totalUnpaid = milestones.filter((item) => item.status === "unpaid").reduce((sum, item) => sum + item.amount, 0);
  const paidCount = milestones.filter((item) => item.status === "paid").length;
  const percentage = (paidCount / milestones.length) * 100;
  const retentionTotal = milestones
    .filter((item) => item.name.toLowerCase().includes("retensi"))
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline/30 bg-primary-container p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Pembayaran Bertermin & Retensi</h2>
            <p className="mt-1 text-[11px] text-on-surface-variant">Progress pembayaran proyek berdasarkan milestone</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
              {Math.round(percentage)}% selesai
            </span>
            <button type="button" onClick={() => setIsSchemaModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-on-secondary transition hover:brightness-110">
              <Plus size={14} aria-hidden="true" />
              Buat Skema Termin Baru
            </button>
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-surface-variant">
          <div className="h-full rounded-full bg-gradient-to-r from-secondary to-emerald-500" style={{ width: `${percentage}%` }} />
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari milestone..." aria-label="Cari milestone termin" className="min-w-0 flex-1 rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | MilestoneStatus)} aria-label="Filter status termin" className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary">
            <option value="all">Semua status</option>
            <option value="paid">Dibayar</option>
            <option value="unpaid">Belum dibayar</option>
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredMilestones.map((milestone) => (
            <div key={milestone.id} className="rounded-2xl border border-outline/20 bg-surface-variant/30 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{milestone.name}</p>
                  {milestone.projectName && <p className="mt-1 text-[10px] font-semibold text-secondary">{milestone.projectName} · {milestone.clientName}</p>}
                  <p className="mt-2 text-lg font-black text-on-surface">{formatRp(milestone.amount)}</p>
                  {milestone.dueDate && <p className="mt-1 text-[10px] text-on-surface-variant">Jatuh tempo: {milestone.dueDate}</p>}
                </div>
                <StatusBadge status={milestone.status} />
              </div>

              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${milestone.progress}%` }} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-on-surface-variant">
                  {milestone.percentage !== undefined ? `Porsi kontrak ${milestone.percentage.toFixed(2).replace(/\.00$/, "")}%` : `Progress ${milestone.progress}%`}
                </span>
                <button
                  type="button"
                  onClick={() => void markPaid(milestone.id)}
                  disabled={milestone.status === "paid" || busyId !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyId === milestone.id && <Loader2 size={13} className="animate-spin" />}
                  {busyId === milestone.id ? "Memproses..." : "Tandai Lunas"}
                </button>
              </div>
            </div>
          ))}
          {filteredMilestones.length === 0 && <p className="rounded-xl border border-outline/20 p-6 text-center text-xs text-on-surface-variant lg:col-span-2">Tidak ada milestone yang cocok dengan pencarian.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-outline/30 bg-primary-container p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface">Ringkasan Termin</h3>
            <p className="mt-1 text-[11px] text-on-surface-variant">Rekap pembayaran yang sudah dan belum diterima</p>
          </div>
          <button type="button" onClick={() => setToast("Ringkasan invoice siap diunduh.")} className="rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface">
            Download Invoice
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FinancialStatCard label="Total dibayar" value={formatRp(totalPaid)} icon="✓" trend={`${paidCount} milestone lunas`} tone="emerald" />
          <FinancialStatCard label="Sisa tagihan" value={formatRp(totalUnpaid)} icon="◷" trend={`${milestones.length - paidCount} milestone belum dibayar`} tone="amber" />
          <FinancialStatCard label="Retensi" value={formatRp(retentionTotal)} icon="%" trend="Nilai tahap retensi" tone="blue" />
        </div>
      </div>

      {isSchemaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsSchemaModalOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="termin-modal-title" className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-outline/30 bg-primary-container shadow-2xl">
            <form onSubmit={createSchedule}>
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-outline/20 bg-primary-container px-4 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Perjanjian proyek</p>
                  <h3 id="termin-modal-title" className="mt-1 text-lg font-black text-on-surface">Buat Skema Termin Baru</h3>
                  <p className="mt-1 text-xs text-on-surface-variant">Atur jumlah, porsi, dan tanggal pembayaran sesuai kesepakatan.</p>
                </div>
                <button type="button" onClick={() => setIsSchemaModalOpen(false)} aria-label="Tutup form" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-6 px-4 py-5 sm:px-6">
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-on-surface">Informasi proyek</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                      Nama proyek
                      <input required value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Contoh: Proyek A" className="mt-2 w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-xs text-on-surface outline-none focus:border-secondary" />
                    </label>
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                      Pelanggan / klien
                      <input required value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Nama pelanggan" className="mt-2 w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-xs text-on-surface outline-none focus:border-secondary" />
                    </label>
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                      Nilai kontrak
                      <CurrencyInput required value={contractValue} onChange={updateContractValue} aria-label="Total nilai kontrak" placeholder="Masukkan nilai kontrak" />
                      {contractValue <= 0 && <span role="alert" className="mt-1 block text-xs normal-case text-error">Nilai kontrak wajib diisi.</span>}
                    </label>
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface">Tahap pembayaran</h4>
                      <p className="mt-1 text-[10px] text-on-surface-variant">Jumlah tahap bebas. Nominal dan persentase saling mengikuti.</p>
                    </div>
                    <button type="button" onClick={addStage} className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary hover:bg-secondary/15 sm:self-auto">
                      <Plus size={14} aria-hidden="true" /> Tambah Tahap Pembayaran
                    </button>
                  </div>

                  <div className="space-y-3">
                    {stageDrafts.map((stage, index) => (
                      <div key={stage.id} className="grid gap-3 rounded-xl border border-outline/20 bg-surface-variant/25 p-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,.7fr)_minmax(0,1fr)_auto] md:items-end">
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                          Nama tahap {index + 1}
                          <input required value={stage.name} onChange={(event) => updateStage(stage.id, { name: event.target.value })} placeholder="DP / Uang Muka" className="mt-2 w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-xs text-on-surface outline-none focus:border-secondary" />
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                          Nominal
                          <CurrencyInput required value={Number(stage.amount) || 0} onChange={(value) => updateStageAmount(stage.id, String(value))} aria-label={`Nominal tahap ${index + 1}`} placeholder="Nominal tahap" />
                          {contractValue > 0 && Number(stage.amount) <= 0 && <span role="alert" className="mt-1 block text-xs normal-case text-error">Nominal tahap wajib diisi.</span>}
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                          Persentase
                          <div className="mt-2 flex items-center rounded-lg border border-outline/30 bg-surface-variant px-3 focus-within:border-secondary">
                            <input type="number" min="0" max="100" step="0.01" value={stage.percentage} onKeyDown={(event) => { if (["-", "+", "e", "E"].includes(event.key)) event.preventDefault(); }} onChange={(event) => updateStagePercentage(stage.id, event.target.value)} aria-label={`Persentase tahap ${index + 1}`} placeholder="0" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-on-surface outline-none sm:text-xs" />
                            <span className="ml-2 text-xs text-on-surface-variant">%</span>
                          </div>
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                          Jatuh tempo
                          <input required type="date" value={stage.dueDate} onChange={(event) => updateStage(stage.id, { dueDate: event.target.value })} className="mt-2 w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-xs text-on-surface outline-none focus:border-secondary" />
                        </label>
                        <button type="button" onClick={() => removeStage(stage.id)} disabled={stageDrafts.length === 1} aria-label={`Hapus tahap ${index + 1}`} title="Hapus tahap" className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-lg border border-red-500/30 text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-35">
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <div className={`rounded-xl border p-4 ${isTotalBalanced ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      {isTotalBalanced ? (
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Status: Total Sesuai 100% ✅</p>
                      ) : contractValue === 0 && totalDraftAmount === 0 ? (
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Masukkan nilai kontrak dan nominal tahap untuk memeriksa total ⚠️</p>
                      ) : (
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          {contractValue > totalDraftAmount ? "Selisih" : "Kelebihan"}: {formatRp(Math.abs(contractValue - totalDraftAmount))} (Total harus 100% dari Nilai Kontrak) ⚠️
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-on-surface-variant">Akumulasi: {formatRp(totalDraftAmount)} · {totalDraftPercentage.toFixed(2)}% dari {formatRp(contractValue)}</p>
                      {!areDraftFieldsValid && <p role="alert" className="mt-1 text-xs text-error">Lengkapi nama proyek, klien, nama tahap, nominal, dan tanggal jatuh tempo.</p>}
                      {contractValue > 0 && !isNominalBalanced && <p role="alert" className="mt-1 text-xs text-error">Total nominal tahap harus sama dengan nilai kontrak. Selisih: {formatRp(Math.abs(contractValue - totalDraftAmount))}.</p>}
                      {contractValue > 0 && !isPercentageBalanced && <p role="alert" className="mt-1 text-xs text-error">Total persentase tahap harus tepat 100% (saat ini {totalDraftPercentage.toFixed(2)}%).</p>}
                    </div>
                    <button type="submit" disabled={!isTotalBalanced || !areDraftFieldsValid || saving} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-on-secondary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      {saving ? "Menyimpan..." : "Simpan Skema"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
      <FeedbackToast message={toast} onDismiss={() => setToast("")} />
    </div>
  );
}
