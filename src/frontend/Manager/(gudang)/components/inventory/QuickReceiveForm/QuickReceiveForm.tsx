"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import * as s from "../style/style";
import type { GudangCategory, MaterialKind } from "@/backend/modules/gudangInventory";

interface Props {
  categories: GudangCategory[];
  onComplete: () => void;
}

interface QuickLot {
  length: number | null;
  width: number | null;
  quantity: number;
  rackGroup: string;
  subRow: string;
  lotCode: string;
}

const MATERIAL_KINDS: { value: MaterialKind; label: string }[] = [
  { value: "unit", label: "Satuan (unit)" },
  { value: "bar", label: "Batang (bar)" },
  { value: "sheet", label: "Lembaran (sheet)" },
  { value: "roll", label: "Gulungan (roll)" },
];

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function QuickReceiveForm({ categories, onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    itemName: string;
    categoryId: string;
    brand: string;
    modelNo: string;
    unit: string;
    materialKind: MaterialKind;
    lots: QuickLot[];
  }>({
    itemName: "",
    categoryId: categories[0]?.id || "",
    brand: "",
    modelNo: "",
    unit: "pcs",
    materialKind: "unit",
    lots: [],
  });

  const isMaterial = form.materialKind !== "unit";

  const addLot = () => {
    setForm({ ...form, lots: [...form.lots, { length: null, width: null, quantity: 1, rackGroup: "", subRow: "", lotCode: "" }] });
  };

  const removeLot = (index: number) => {
    setForm({ ...form, lots: form.lots.filter((_, i) => i !== index) });
  };

  const updateLot = (index: number, patch: Partial<QuickLot>) => {
    const newLots = [...form.lots];
    newLots[index] = { ...newLots[index], ...patch };
    setForm({ ...form, lots: newLots });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gudang/inventory/quick-receive", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        alert("Barang diterima!");
        onComplete();
      } else {
        const error = await res.json();
        alert(`Gagal menerima barang: ${error.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.itemName.trim().length > 0 && form.categoryId.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <select className={s.formInput} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className={s.formInput} placeholder="Nama Barang" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} />
        <input className={s.formInput} placeholder="Merek" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <input className={s.formInput} placeholder="No. Model" value={form.modelNo} onChange={e => setForm({ ...form, modelNo: e.target.value })} />
        <select className={s.formInput} value={form.materialKind} onChange={e => setForm({ ...form, materialKind: e.target.value as MaterialKind })}>
          {MATERIAL_KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
        <input className={s.formInput} placeholder="Satuan (pcs / m / kg)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-sm">Lot Bahan <span className="font-normal text-xs text-on-surface-variant">(opsional)</span></label>
          {form.lots.length > 0 && (
            <button type="button" onClick={() => setForm({ ...form, lots: [] })} className="text-xs text-red-500 hover:underline">
              Tanpa Lot
            </button>
          )}
        </div>

        {form.lots.map((lot, index) => (
          <div key={index} className={`grid gap-2 items-center border p-2 rounded ${isMaterial ? "grid-cols-6" : "grid-cols-4"}`}>
            {isMaterial && (
              <input
                className={s.formInput}
                type="number"
                placeholder="Panjang (mm)"
                value={lot.length ?? ""}
                onChange={e => updateLot(index, { length: toNumberOrNull(e.target.value) })}
              />
            )}
            {isMaterial && (
              <input
                className={s.formInput}
                type="number"
                placeholder="Lebar (mm)"
                value={lot.width ?? ""}
                onChange={e => updateLot(index, { width: toNumberOrNull(e.target.value) })}
              />
            )}
            <input
              className={s.formInput}
              type="number"
              placeholder="Qty"
              value={lot.quantity}
              onChange={e => updateLot(index, { quantity: Number(e.target.value) })}
            />
            <input
              className={s.formInput}
              placeholder="Rak"
              value={lot.rackGroup}
              onChange={e => updateLot(index, { rackGroup: e.target.value })}
            />
            <input
              className={s.formInput}
              placeholder="Kode Lot"
              value={lot.lotCode}
              onChange={e => updateLot(index, { lotCode: e.target.value })}
            />
            <button type="button" onClick={() => removeLot(index)} className="text-red-500 justify-self-center"><Trash2 size={16} /></button>
          </div>
        ))}

        {form.lots.length === 0 && (
          <p className="text-xs text-on-surface-variant">
            {isMaterial
              ? "Belum ada lot. Klik Tambah Lot untuk mencatat penerimaan material."
              : "Tanpa lot — stok langsung dicatat di Master Stok."}
          </p>
        )}

        <button type="button" onClick={addLot} className="text-secondary text-sm flex items-center gap-1">
          <Plus size={16} /> Tambah Lot
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !isFormValid}
        className="w-full bg-secondary text-white p-2 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save size={16} /> {loading ? "Memproses..." : "Simpan Penerimaan"}
      </button>
    </div>
  );
}
