"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { GudangInventoryItemView } from "@/backend/modules/gudangInventory";
import type {
  CreateCutListInput,
  PMCutList,
  PMCutListItemInput,
  UpdateCutListInput,
} from "@/backend/modules/pm/cutting";
import type { DimensionUnit } from "@/frontend/shared/units/dimensions";
import { toCm } from "@/frontend/shared/units/dimensions";

interface SpkOption {
  id: string;
  label: string;
}

interface CutListFormModalProps {
  spkOptions: SpkOption[];
  materials: GudangInventoryItemView[];
  cutList: PMCutList | null;
  saving: boolean;
  onClose: () => void;
  onCreate: (input: CreateCutListInput) => Promise<void>;
  onUpdate: (id: string, input: UpdateCutListInput) => Promise<void>;
}

interface DraftItem {
  key: string;
  componentName: string;
  quantity: string;
  length: string;
  width: string;
  unit: DimensionUnit;
  materialItemId: string;
  note: string;
}

const cardClass =
  "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4";
const panelClass =
  "my-8 w-full max-w-3xl rounded-2xl border border-outline/30 bg-surface-container-low p-5 lg:p-6";
const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant";
const inputClass =
  "w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary";
const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

function dimensionToCm(value: string, unit: DimensionUnit): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? toCm(parsed, unit) : null;
}

export function CutListFormModal({
  spkOptions,
  materials,
  cutList,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: CutListFormModalProps) {
  const [orderId, setOrderId] = useState(cutList?.orderId ?? spkOptions[0]?.id ?? "");
  const [title, setTitle] = useState(cutList?.title ?? "");
  const [note, setNote] = useState(cutList?.note ?? "");
  const [items, setItems] = useState<DraftItem[]>(() =>
    cutList && cutList.items.length
      ? cutList.items.map((item) => ({
          key: item.id,
          componentName: item.componentName,
          quantity: String(item.quantity),
          length: item.length != null ? String(item.length) : "",
          width: item.width != null ? String(item.width) : "",
          unit: "cm",
          materialItemId: item.materialItemId ?? "",
          note: item.note,
        }))
      : [
          {
            key: `row-${crypto.randomUUID()}`,
            componentName: "",
            quantity: "1",
            length: "",
            width: "",
            unit: "cm",
            materialItemId: "",
            note: "",
          },
        ],
  );
  const [error, setError] = useState("");

  const materialOptions = [...materials].sort((left, right) =>
    left.itemName.localeCompare(right.itemName),
  );

  function addRow() {
    setItems((current) => [
      ...current,
      {
        key: `row-${crypto.randomUUID()}`,
        componentName: "",
        quantity: "1",
        length: "",
        width: "",
        unit: "cm",
        materialItemId: "",
        note: "",
      },
    ]);
  }

  function removeRow(key: string) {
    setItems((current) =>
      current.length === 1 ? current : current.filter((row) => row.key !== key),
    );
  }

  function updateRow(key: string, patch: Partial<DraftItem>) {
    setItems((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function buildItemInputs(): PMCutListItemInput[] {
    return items
      .filter((row) => row.componentName.trim() && Number(row.quantity) > 0)
      .map((row) => ({
        componentName: row.componentName.trim(),
        quantity: Math.max(1, Math.floor(Number(row.quantity) || 1)),
        length: dimensionToCm(row.length, row.unit),
        width: dimensionToCm(row.width, row.unit),
        materialItemId: row.materialItemId || null,
        note: row.note.trim(),
      }));
  }

  async function handleSave() {
    setError("");
    if (!cutList && !orderId) {
      setError("Pilih SPK terlebih dahulu.");
      return;
    }
    const itemInputs = buildItemInputs();
    if (itemInputs.length === 0) {
      setError("Tambahkan minimal satu item potong dengan nama & jumlah.");
      return;
    }

    if (cutList) {
      await onUpdate(cutList.id, { title, note, items: itemInputs });
    } else {
      await onCreate({ orderId, title, note, items: itemInputs });
    }
  }

  return (
    <div className={cardClass}>
      <div className={panelClass}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-headline text-base font-bold uppercase tracking-wide text-on-surface">
              {cutList ? "Edit Daftar Potong" : "Buat Daftar Potong"}
            </h2>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">
              Rancang kebutuhan potongan material untuk SPK ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[11px] text-red-200">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>SPK</label>
            <select
              className={inputClass}
              value={orderId}
              disabled={Boolean(cutList)}
              onChange={(event) => setOrderId(event.target.value)}
            >
              <option value="">Pilih SPK...</option>
              {spkOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Judul</label>
            <input
              className={inputClass}
              placeholder="Contoh: Cutting rangka jendela"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className={labelClass}>Catatan</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className={labelClass}>Item Potong</label>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 text-[11px] font-bold text-secondary hover:brightness-110"
            >
              <Plus size={14} /> Tambah Item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((row) => (
              <div
                key={row.key}
                className="rounded-xl border border-outline/25 bg-surface-variant/30 p-3"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <input
                    className={`${inputClass} sm:col-span-3`}
                    placeholder="Nama komponen"
                    value={row.componentName}
                    onChange={(event) => updateRow(row.key, { componentName: event.target.value })}
                  />
                  <input
                    type="number"
                    min={1}
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
                    placeholder="Panjang"
                    value={row.length}
                    onChange={(event) => updateRow(row.key, { length: event.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Lebar"
                    value={row.width}
                    onChange={(event) => updateRow(row.key, { width: event.target.value })}
                  />
                  <select
                    className={`${inputClass} sm:col-span-2`}
                    value={row.unit}
                    onChange={(event) =>
                      updateRow(row.key, { unit: event.target.value as DimensionUnit })
                    }
                  >
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                  </select>
                  <button
                    type="button"
                    aria-label="Hapus item"
                    onClick={() => removeRow(row.key)}
                    disabled={items.length === 1}
                    className="flex h-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30 sm:col-span-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <select
                  className={`${inputClass} mt-2`}
                  value={row.materialItemId}
                  onChange={(event) => updateRow(row.key, { materialItemId: event.target.value })}
                >
                  <option value="">Pilih bahan (opsional)...</option>
                  {materialOptions.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.modelNo ? `[${material.modelNo}] ` : ""}
                      {material.itemName}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-outline/30 px-4 py-2.5 text-xs font-bold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Batal
          </button>
          <button className={primaryButtonClass} onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
