"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { GudangMaterialLotView } from "@/backend/modules/gudangInventory";
import type {
  ExecuteAllocationInput,
  LeftoverStatus,
  PMCutList,
} from "@/backend/modules/pm/cutting";

interface ExecuteCutModalProps {
  cutList: PMCutList;
  lots: GudangMaterialLotView[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (allocations: ExecuteAllocationInput[]) => Promise<void>;
}

interface DraftAllocation {
  key: string;
  cutListItemId: string;
  lotId: string;
  quantity: string;
  lengthUsed: string;
  leftoverStatus: LeftoverStatus;
}

const cardClass =
  "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4";
const panelClass =
  "my-8 w-full max-w-4xl rounded-2xl border border-outline/30 bg-surface-container-low p-5 lg:p-6";
const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant";
const inputClass =
  "w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-secondary focus:ring-1 focus:ring-secondary";
const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

function remainingFor(cutList: PMCutList, itemId: string): number {
  const item = cutList.items.find((entry) => entry.id === itemId);
  if (!item) return 0;
  const allocated = item.allocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
  return Math.max(0, item.quantity - allocated);
}

export function ExecuteCutModal({
  cutList,
  lots,
  saving,
  onClose,
  onSubmit,
}: ExecuteCutModalProps) {
  const usableLots = useMemo(
    () => lots.filter((lot) => lot.status === "tersedia" || lot.status === "sisa"),
    [lots],
  );

  const [rows, setRows] = useState<DraftAllocation[]>(() =>
    cutList.items
      .filter((item) => remainingFor(cutList, item.id) > 0)
      .map((item) => ({
        key: `al-${crypto.randomUUID()}`,
        cutListItemId: item.id,
        lotId:
          usableLots.find((lot) => lot.itemId === item.materialItemId)?.id ??
          "",
        quantity: String(remainingFor(cutList, item.id)),
        lengthUsed: item.length != null ? String(item.length) : "",
        leftoverStatus: "reusable" as LeftoverStatus,
      })),
  );
  const [error, setError] = useState("");

  const itemById = useMemo(
    () => new Map(cutList.items.map((item) => [item.id, item])),
    [cutList.items],
  );
  const lotById = useMemo(() => new Map(lots.map((lot) => [lot.id, lot])), [lots]);

  function addRow() {
    setRows((current) => [
      ...current,
      {
        key: `al-${crypto.randomUUID()}`,
        cutListItemId: cutList.items[0]?.id ?? "",
        lotId: "",
        quantity: "1",
        lengthUsed: "",
        leftoverStatus: "reusable",
      },
    ]);
  }

  function removeRow(key: string) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  function updateRow(key: string, patch: Partial<DraftAllocation>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  async function handleSubmit() {
    setError("");
    const allocations: ExecuteAllocationInput[] = [];
    for (const row of rows) {
      if (!row.cutListItemId || !row.lotId || Number(row.quantity) <= 0) {
        setError("Lengkapi item, lot, dan jumlah pada setiap alokasi.");
        return;
      }
      allocations.push({
        cutListItemId: row.cutListItemId,
        lotId: row.lotId,
        quantity: Number(row.quantity),
        lengthUsed: row.lengthUsed.trim() === "" ? null : Number(row.lengthUsed),
        leftoverStatus: row.leftoverStatus,
      });
    }
    if (allocations.length === 0) {
      setError("Tambahkan minimal satu alokasi potong.");
      return;
    }
    await onSubmit(allocations);
  }

  return (
    <div className={cardClass}>
      <div className={panelClass}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-headline text-base font-bold uppercase tracking-wide text-on-surface">
              Eksekusi Potong
            </h2>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">
              {cutList.title || "Daftar potong"} — pilih lot bahan dan tentukan sisa potong.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="mb-4 space-y-1 rounded-xl border border-outline/25 bg-surface-variant/20 p-3">
          {cutList.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-on-surface">
                {item.componentName}
                {item.length != null ? ` · ${item.length} mm` : ""}
              </span>
              <span className="font-bold text-on-surface-variant">
                sisa {remainingFor(cutList, item.id)} / {item.quantity}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[11px] text-red-200">
            {error}
          </p>
        )}

        <div className="mb-2 flex items-center justify-between gap-2">
          <label className={labelClass}>Alokasi Potong</label>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-[11px] font-bold text-secondary hover:brightness-110"
          >
            <Plus size={14} /> Tambah Alokasi
          </button>
        </div>

        <div className="space-y-2">
          {rows.map((row) => {
            const item = itemById.get(row.cutListItemId);
            const lot = row.lotId ? lotById.get(row.lotId) : undefined;
            const lengthUsed =
              row.lengthUsed.trim() === "" ? item?.length ?? null : Number(row.lengthUsed);
            const leftover =
              lot?.length != null && lengthUsed != null && lot.length > lengthUsed
                ? Math.round((lot.length - lengthUsed) * 100) / 100
                : null;
            return (
              <div
                key={row.key}
                className="rounded-xl border border-outline/25 bg-surface-variant/30 p-3"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <select
                    className={`${inputClass} sm:col-span-4`}
                    value={row.cutListItemId}
                    onChange={(event) => updateRow(row.key, { cutListItemId: event.target.value })}
                  >
                    {cutList.items.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.componentName}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${inputClass} sm:col-span-4`}
                    value={row.lotId}
                    onChange={(event) => updateRow(row.key, { lotId: event.target.value })}
                  >
                    <option value="">Pilih lot...</option>
                    {usableLots
                      .filter((option) => !item?.materialItemId || option.itemId === item.materialItemId)
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.itemName}
                          {option.lotCode ? ` · ${option.lotCode}` : ""}
                          {option.length != null ? ` · ${option.length}mm` : ""}
                          {` · sisa ${option.quantity}`}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Pakai mm"
                    value={row.lengthUsed}
                    onChange={(event) => updateRow(row.key, { lengthUsed: event.target.value })}
                  />
                  <button
                    type="button"
                    aria-label="Hapus alokasi"
                    onClick={() => removeRow(row.key)}
                    className="flex h-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-red-400/10 hover:text-red-300 sm:col-span-12 sm:h-9"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-on-surface-variant">
                    {lot
                      ? `Sisa lot ${lot.quantity} ${lot.unit}${lot.rackGroup ? ` · Rak ${lot.rackGroup}` : ""}`
                      : "Pilih lot bahan"}
                    {leftover != null ? ` · sisa potong ${leftover} mm` : ""}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <label className="flex items-center gap-1 text-on-surface-variant">
                      <input
                        type="radio"
                        name={`leftover-${row.key}`}
                        checked={row.leftoverStatus === "reusable"}
                        onChange={() => updateRow(row.key, { leftoverStatus: "reusable" })}
                      />
                      Sisa masih bisa dipakai
                    </label>
                    <label className="flex items-center gap-1 text-on-surface-variant">
                      <input
                        type="radio"
                        name={`leftover-${row.key}`}
                        checked={row.leftoverStatus === "scrap"}
                        onChange={() => updateRow(row.key, { leftoverStatus: "scrap" })}
                      />
                      Scrap
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-outline/30 px-4 py-2.5 text-xs font-bold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Batal
          </button>
          <button className={primaryButtonClass} onClick={handleSubmit} disabled={saving}>
            {saving ? "Menyimpan..." : "Eksekusi Potong"}
          </button>
        </div>
      </div>
    </div>
  );
}
