"use client";

import { useState } from "react";
import type {
  GudangCategory,
  GudangInventoryItem,
  GudangInventoryItemInput,
  MaterialKind,
} from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";

interface ItemFormModalProps {
  categories: GudangCategory[];
  item: GudangInventoryItem | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: GudangInventoryItemInput) => Promise<void>;
  onCreateCategory: () => void;
}

interface ItemForm {
  categoryId: string;
  itemName: string;
  brand: string;
  modelNo: string;
  color: string;
  rackGroup: string;
  subRow: string;
  unit: string;
  materialKind: MaterialKind;
  lengthPerUnit: string;
  widthPerUnit: string;
  weightPerUnit: string;
}

const MATERIAL_KINDS: { value: MaterialKind; label: string }[] = [
  { value: "unit", label: "Satuan (unit)" },
  { value: "bar", label: "Batang (bar)" },
  { value: "sheet", label: "Lembaran (sheet)" },
  { value: "roll", label: "Gulungan (roll)" },
];

const KIND_TO_UNIT: Record<MaterialKind, string> = {
  unit: "pcs",
  bar: "batang",
  sheet: "lembar",
  roll: "roll",
};

export function ItemFormModal({
  categories,
  item,
  saving,
  onClose,
  onSubmit,
  onCreateCategory,
}: ItemFormModalProps) {
  const [form, setForm] = useState<ItemForm>(() => ({
    categoryId: item?.categoryId ?? categories[0]?.id ?? "",
    itemName: item?.itemName ?? "",
    brand: item?.brand ?? "",
    modelNo: item?.modelNo ?? "",
    color: item?.color ?? "",
    rackGroup: item?.rackGroup ?? "",
    subRow: item?.subRow ?? "",
    unit: item?.unit ?? "",
    materialKind: item?.materialKind ?? "unit",
    lengthPerUnit: item?.lengthPerUnit != null ? String(item.lengthPerUnit) : "",
    widthPerUnit: item?.widthPerUnit != null ? String(item.widthPerUnit) : "",
    weightPerUnit: item?.weightPerUnit != null ? String(item.weightPerUnit) : "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof ItemForm, string>>>({});
  const [cooldown, setCooldown] = useState(false);

  const isMaterial = form.materialKind !== "unit";
  const isEditing = item !== null;
  const isFormValid = Boolean(form.categoryId && form.itemName.trim() && form.unit.trim());
  const isButtonDisabled = saving || cooldown || !isFormValid;

  function set<K extends keyof ItemForm>(key: K, value: ItemForm[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "materialKind") {
        next.unit = KIND_TO_UNIT[value as MaterialKind];
      }
      return next;
    });
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ItemForm, string>> = {};
    if (!form.categoryId) next.categoryId = "Kategori wajib dipilih";
    if (!form.itemName.trim()) next.itemName = "Nama barang wajib diisi";
    if (!form.unit.trim()) next.unit = "Satuan wajib diisi";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function toNumberOrNull(value: string): number | null {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function handleSave() {
    if (!validate() || isButtonDisabled) return;
    setCooldown(true);
    try {
      await onSubmit({
        categoryId: form.categoryId,
        itemName: form.itemName.trim(),
        brand: form.brand.trim(),
        modelNo: form.modelNo.trim(),
        color: form.color.trim(),
        rackGroup: form.rackGroup.trim(),
        subRow: form.subRow.trim(),
        unit: form.unit.trim(),
        materialKind: form.materialKind,
        lengthPerUnit: toNumberOrNull(form.lengthPerUnit),
        widthPerUnit: toNumberOrNull(form.widthPerUnit),
        weightPerUnit: toNumberOrNull(form.weightPerUnit),
      });
    } finally {
      setCooldown(false);
    }
  }

  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>{item ? "Edit Barang" : "Tambah Barang"}</h2>
            <p className={s.modalSubtitle}>
              Detail barang. Stok diubah lewat Barang Masuk / Barang Keluar.
            </p>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formGroup}>
          <div>
            <label className={s.formLabel}>
              Kategori <span className={s.required}>*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                className={s.formInput}
                value={form.categoryId}
                onChange={(event) => set("categoryId", event.target.value)}
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button className={s.ghostButton} onClick={onCreateCategory} type="button">
                <span className={s.buttonIcon}>add</span>
              </button>
            </div>
            {errors.categoryId && <p className={s.formError}>{errors.categoryId}</p>}
          </div>

          <div>
            <label className={s.formLabel}>
              Nama Barang <span className={s.required}>*</span>
            </label>
            <input
              className={s.formInput}
              placeholder="Contoh: Handle Pintu"
              value={form.itemName}
              onChange={(event) => set("itemName", event.target.value)}
            />
            {errors.itemName && <p className={s.formError}>{errors.itemName}</p>}
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Merek</label>
              <input
                className={s.formInput}
                value={form.brand}
                onChange={(event) => set("brand", event.target.value)}
              />
            </div>
            <div>
              <label className={s.formLabel}>No. Model</label>
              <input
                className={s.formInput}
                value={form.modelNo}
                onChange={(event) => set("modelNo", event.target.value)}
              />
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Warna</label>
              <input
                className={s.formInput}
                value={form.color}
                onChange={(event) => set("color", event.target.value)}
              />
            </div>
            <div>
              <label className={s.formLabel}>Lokasi Rak</label>
              <input
                className={s.formInput}
                placeholder="Contoh: Rak A"
                value={form.rackGroup}
                onChange={(event) => set("rackGroup", event.target.value)}
              />
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Baris</label>
              <input
                className={s.formInput}
                placeholder="Contoh: 3"
                value={form.subRow}
                onChange={(event) => set("subRow", event.target.value)}
              />
            </div>
            <div>
              <label className={s.formLabel}>
                Satuan <span className={s.required}>*</span>
              </label>
              <input
                className={s.formInput}
                placeholder="pcs / m / kg"
                value={form.unit}
                onChange={(event) => set("unit", event.target.value)}
              />
              {errors.unit && <p className={s.formError}>{errors.unit}</p>}
            </div>
          </div>

          <div>
            <label className={s.formLabel}>Jenis Bahan</label>
            <select
              className={s.formInput}
              value={form.materialKind}
              disabled={isEditing}
              onChange={(event) => set("materialKind", event.target.value as MaterialKind)}
            >
              {MATERIAL_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            {isEditing && (
              <p className={s.formHint}>
                Jenis bahan tidak dapat diubah setelah barang dibuat.
              </p>
            )}
          </div>

          {isMaterial && (
            <div className={s.formGrid}>
              <div>
                <label className={s.formLabel}>Panjang Acuan (mm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={s.formInput}
                  value={form.lengthPerUnit}
                  onChange={(event) => set("lengthPerUnit", event.target.value)}
                />
              </div>
              <div>
                <label className={s.formLabel}>Lebar Acuan (mm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={s.formInput}
                  value={form.widthPerUnit}
                  onChange={(event) => set("widthPerUnit", event.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className={s.modalFooter}>
          <button className={s.cancelButton} onClick={onClose}>
            Batal
          </button>
          <button
            className={`${s.saveButton} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            onClick={handleSave}
            disabled={isButtonDisabled}
          >
            {saving || cooldown ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
