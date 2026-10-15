"use client";

import { useState } from "react";
import type {
  GudangCategory,
  GudangInventoryItem,
  GudangInventoryItemInput,
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
  currentStock: string;
}

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
    currentStock: String(item?.currentStock ?? 0),
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof ItemForm, string>>>({});
  const [cooldown, setCooldown] = useState(false);

  const isFormValid = Boolean(form.categoryId && form.itemName.trim());
  const isButtonDisabled = saving || cooldown || !isFormValid;

  function set<K extends keyof ItemForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ItemForm, string>> = {};
    if (!form.categoryId) next.categoryId = "Kategori wajib dipilih";
    if (!form.itemName.trim()) next.itemName = "Nama barang wajib diisi";
    const stock = Number(form.currentStock);
    if (!Number.isInteger(stock) || stock < 0) next.currentStock = "Stok minimal 0";
    setErrors(next);
    return Object.keys(next).length === 0;
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
        currentStock: Number(form.currentStock),
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
            <p className={s.modalSubtitle}>Master stok gudang inventaris</p>
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
              <label className={s.formLabel}>Jumlah Stok</label>
              <input
                type="number"
                min="0"
                className={s.formInput}
                value={form.currentStock}
                onChange={(event) => set("currentStock", event.target.value)}
              />
              {errors.currentStock && <p className={s.formError}>{errors.currentStock}</p>}
            </div>
          </div>
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
