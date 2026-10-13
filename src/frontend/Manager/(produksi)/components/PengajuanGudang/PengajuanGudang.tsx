"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, Plus, Send, Trash2 } from "lucide-react";
import type { ProductionRequest } from "@/backend/modules/gudangInventory/productionRequests";
import type { GudangInventoryItemView } from "@/backend/modules/gudangInventory";
import { productionRequestsApi, request } from "@/services/api/index";
import { useProduksi } from "../../context/ProduksiContext/ProduksiContext";

interface DraftLine {
  key: string;
  itemId: string;
  quantity: number;
}

const cardClass = "rounded-2xl border border-outline/30 bg-surface-container-low p-5 lg:p-6";
const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant";
const inputClass =
  "w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary";
const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function statusBadge(status: ProductionRequest["status"]) {
  if (status === "disetujui") {
    return { label: "Disetujui", className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" };
  }
  if (status === "ditolak") {
    return { label: "Ditolak", className: "bg-red-400/10 text-red-300 border-red-400/30" };
  }
  return { label: "Menunggu ACC", className: "bg-secondary/12 text-secondary border-secondary/30" };
}

function DetailRow({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-[11px]">
      <span className="font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
      <span
        className={[
          "text-right font-semibold",
          danger ? "text-red-300" : highlight ? "text-secondary" : "text-on-surface",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

export function PengajuanGudang() {
  const { spk } = useProduksi();
  const [items, setItems] = useState<GudangInventoryItemView[]>([]);
  const [requests, setRequests] = useState<ProductionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [spkRef, setSpkRef] = useState("");
  const [requestDate, setRequestDate] = useState(todayIso());
  const [requesterName, setRequesterName] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { key: "line-1", itemId: "", quantity: 1 },
  ]);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const itemOptions = useMemo(
    () => [...items].sort((left, right) => left.itemName.localeCompare(right.itemName)),
    [items],
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [masterItems, history, profile] = await Promise.all([
          productionRequestsApi.listMasterItems(),
          productionRequestsApi.list(),
          request<{ name?: string }>("/auth/profile"),
        ]);
        if (!active) return;
        setItems(masterItems);
        setRequests(history);
        setRequesterName(profile?.name ?? "");
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Data gagal dimuat.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  function addLine() {
    setLines((current) => [
      ...current,
      { key: `line-${crypto.randomUUID()}`, itemId: "", quantity: 1 },
    ]);
  }

  function removeLine(key: string) {
    setLines((current) =>
      current.length === 1 ? current : current.filter((line) => line.key !== key),
    );
  }

  function startRevision(req: ProductionRequest) {
    setSpkRef(req.spkRef);
    setRequestDate(req.requestDate || todayIso());
    setRequesterName(req.requesterName);
    setNote(req.note);
    setLines(
      req.items
        .filter((line) => line.itemId)
        .map((line) => ({
          key: `line-${crypto.randomUUID()}`,
          itemId: line.itemId ?? "",
          quantity: Math.max(1, line.quantity),
        })),
    );
    setError("");
    setNotice(
      "Form diisi dari pengajuan. Ubah kuantitas/barang bila perlu, lalu kirim ulang untuk menggantikan yang masih menunggu ACC.",
    );
  }

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;
    setError("");
    setNotice("");

    if (!spkRef) {
      setError("Pilih SPK terlebih dahulu.");
      return;
    }
    const requester = requesterName.trim();
    if (!requester) {
      setError("Penanggung jawab wajib diisi.");
      return;
    }
    const validLines = lines
      .filter((line) => line.itemId && line.quantity > 0)
      .map((line) => ({ itemId: line.itemId, quantity: line.quantity }));
    if (validLines.length === 0) {
      setError("Tambahkan minimal satu barang dengan jumlah lebih dari 0.");
      return;
    }

    const selectedSpk = spk.find((item) => item.nomor === spkRef);
    const spkLabel = selectedSpk
      ? `${selectedSpk.nomor}${selectedSpk.namaKontraktor ? ` - ${selectedSpk.namaKontraktor}` : ""}`
      : spkRef;

    submittingRef.current = true;
    setSaving(true);
    try {
      const { request: createdRequest, replaced } = await productionRequestsApi.create({
        requestDate,
        spkRef,
        spkLabel,
        requesterName: requester,
        note,
        items: validLines,
      });
      setRequests((current) => [
        createdRequest,
        ...current.filter((item) => item.id !== createdRequest.id),
      ]);
      setNotice(
        replaced
          ? "Permintaan diperbarui — menggantikan pengajuan yang masih menunggu ACC."
          : "Permintaan material terkirim ke gudang.",
      );
      setSpkRef("");
      setNote("");
      setLines([{ key: `line-${crypto.randomUUID()}`, itemId: "", quantity: 1 }]);
      setRequestDate(todayIso());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Permintaan gagal dikirim.");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <h1 className="font-headline text-xl font-extrabold uppercase tracking-tight text-on-surface lg:text-2xl">
          Permintaan Material
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant">
          Ajukan kebutuhan material produksi ke gudang. Permintaan akan diproses oleh pihak gudang.
        </p>
      </header>

      {(error || notice) && (
        <p
          className={[
            "mb-4 rounded-xl border px-4 py-3 text-xs",
            error
              ? "border-red-400/30 bg-red-400/10 text-red-200"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
          ].join(" ")}
        >
          {error || notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className={cardClass}>
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList size={17} className="text-secondary" />
            <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface">
              Form Pengajuan
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                SPK <span className="text-error">*</span>
              </label>
              <select
                className={inputClass}
                value={spkRef}
                onChange={(event) => setSpkRef(event.target.value)}
              >
                <option value="">Pilih SPK...</option>
                {spk.map((item) => (
                  <option key={item.nomor} value={item.nomor}>
                    {item.nomor} - {item.namaKontraktor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tanggal</label>
              <input
                type="date"
                className={inputClass}
                value={requestDate}
                onChange={(event) => setRequestDate(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className={labelClass}>
              Penanggung Jawab <span className="text-error">*</span>
            </label>
            <input
              className={inputClass}
              value={requesterName}
              placeholder="Nama yang mengajukan (bisa mewakili orang lain)"
              onChange={(event) => setRequesterName(event.target.value)}
            />
          </div>

          <div className="mt-3">
            <label className={labelClass}>Catatan</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={note}
              placeholder="Keterangan tambahan (opsional)..."
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className={labelClass}>Barang Diminta</label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-[11px] font-bold text-secondary hover:brightness-110"
              >
                <Plus size={14} /> Tambah Barang
              </button>
            </div>
            <p className="mb-2 text-[10px] text-on-surface-variant">
              Detail dan lokasi rak terisi otomatis dari Master Stok gudang.
            </p>

            <div className="space-y-2">
              {lines.map((line) => {
                const item = line.itemId ? itemById.get(line.itemId) : undefined;
                const insufficient =
                  item !== undefined && line.quantity > item.currentStock;
                return (
                  <div
                    key={line.key}
                    className="rounded-xl border border-outline/25 bg-surface-variant/30 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        className={`${inputClass} sm:flex-1`}
                        value={line.itemId}
                        onChange={(event) => updateLine(line.key, { itemId: event.target.value })}
                      >
                        <option value="">Pilih barang...</option>
                        {itemOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.modelNo ? `[${option.modelNo}] ` : ""}
                            {option.itemName} (stok {option.currentStock})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        className={`${inputClass} sm:w-24`}
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(line.key, {
                            quantity: Math.max(1, Math.floor(Number(event.target.value) || 1)),
                          })
                        }
                      />
                      <button
                        type="button"
                        aria-label="Hapus barang"
                        onClick={() => removeLine(line.key)}
                        disabled={lines.length === 1}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg text-on-surface-variant transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30 sm:self-center"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item && (
                      <div className="mt-3 rounded-lg border border-outline/25 bg-surface-variant/40 p-3">
                        <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                          <DetailRow label="Kategori" value={item.categoryName || "-"} />
                          <DetailRow label="Merek" value={item.brand || "-"} />
                          <DetailRow label="No. Model" value={item.modelNo || "-"} />
                          <DetailRow label="Warna" value={item.color || "-"} />
                          <DetailRow
                            label="Lokasi Rak"
                            highlight
                            value={
                              item.rackGroup
                                ? `${item.rackGroup}${item.subRow ? ` · Baris ${item.subRow}` : ""}`
                                : "Belum diatur gudang"
                            }
                          />
                          <DetailRow
                            label="Stok Tersedia"
                            danger={insufficient}
                            value={String(item.currentStock)}
                          />
                        </div>
                      </div>
                    )}

                    {insufficient && (
                      <p className="mt-2 text-[10px] font-semibold text-red-300">
                        Stok hanya {item?.currentStock}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" className={`${primaryButtonClass} mt-5 w-full`} disabled={saving}>
            <Send size={15} />
            {saving ? "Mengirim..." : "Kirim Permintaan"}
          </button>
        </form>

        <section className={cardClass}>
          <h2 className="mb-4 font-headline text-sm font-bold uppercase tracking-wide text-on-surface">
            Riwayat Pengajuan
          </h2>

          {loading ? (
            <p className="py-10 text-center text-xs text-on-surface-variant">Memuat...</p>
          ) : requests.length === 0 ? (
            <p className="py-10 text-center text-xs text-on-surface-variant">
              Belum ada pengajuan material.
            </p>
          ) : (
            <ul className="space-y-3">
              {requests.map((req) => {
                const badge = statusBadge(req.status);
                return (
                  <li
                    key={req.id}
                    className="rounded-xl border border-outline/25 bg-surface-variant/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-on-surface">
                          {req.spkLabel || req.spkRef}
                        </p>
                        <p className="mt-0.5 text-[10px] text-on-surface-variant">
                          {formatDate(req.requestDate)} · {req.requesterName || "-"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {req.status === "diajukan" && (
                          <button
                            type="button"
                            onClick={() => startRevision(req)}
                            className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-secondary transition-colors hover:bg-secondary/20"
                          >
                            Revisi
                          </button>
                        )}
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <ul className="mt-2 space-y-1">
                      {req.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 text-[11px] text-on-surface-variant"
                        >
                          <span className="min-w-0">
                            <span className="block truncate">
                              {item.itemName}
                              {item.modelNo ? ` · ${item.modelNo}` : ""}
                            </span>
                            {(item.categoryName || item.rackGroup) && (
                              <span className="block truncate text-[10px] text-on-surface-variant/70">
                                {item.categoryName || "-"}
                                {item.rackGroup ? ` · Rak ${item.rackGroup}` : ""}
                                {item.subRow ? ` · Baris ${item.subRow}` : ""}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-bold text-on-surface">{item.quantity}</span>
                        </li>
                      ))}
                    </ul>

                    {req.status === "ditolak" && req.rejectReason && (
                      <p className="mt-2 border-t border-outline/20 pt-2 text-[10px] text-red-300">
                        Alasan: {req.rejectReason}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
