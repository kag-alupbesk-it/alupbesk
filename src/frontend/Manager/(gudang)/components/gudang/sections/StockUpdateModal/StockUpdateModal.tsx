"use client";

import { useState } from "react";
import type { GudangItem } from "../shared/types";
import * as s from "../shared/style";

interface StockUpdateModalProps {
  item: GudangItem;
  onClose: () => void;
  onSave: (item: GudangItem) => void;
}

interface StockForm {
  stok: string;
  minStok: string;
}

export function StockUpdateModal({ item, onClose, onSave }: StockUpdateModalProps) {
  const [form, setForm] = useState<StockForm>(() => ({ stok: String(item.stok), minStok: String(item.minStok) }));
  const [errors, setErrors] = useState<Partial<Record<keyof StockForm, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof StockForm, string>> = {};
    const stokNum = Number(form.stok);
    if (isNaN(stokNum) || stokNum < 0) newErrors.stok = "Stok harus angka minimal 0";
    const minStokNum = Number(form.minStok);
    if (isNaN(minStokNum) || minStokNum < 0) newErrors.minStok = "Min stok harus angka minimal 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({ ...item, stok: Number(form.stok), minStok: Number(form.minStok) });
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdropClick}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>Kelola Stok</h2>
            <p className={s.modalSubtitle}>Perbarui jumlah stok barang berikut</p>
          </div>
          <button onClick={onClose} className={s.modalCloseButton}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={`${s.itemCard} mb-5`}>
          <div className={s.itemSkuWrapper}>
            <span className={s.itemSku}>{item.sku}</span>
            <span className={s.itemMerekBadge}>{item.merek}</span>
          </div>
          <p className={s.itemDetail}>
            {item.jenisBarang} · {item.warna} · {item.seksiLokasi}
          </p>
        </div>

        <div className={s.formGroup}>
          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>
                Jumlah Stok <span className={s.required}>*</span>
              </label>
              <input type="number" min="0" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} className={s.formInput} />
              {errors.stok && <p className={s.formError}>{errors.stok}</p>}
            </div>
            <div>
              <label className={s.formLabel}>
                Min. Stok Alert <span className={s.required}>*</span>
              </label>
              <input type="number" min="0" value={form.minStok} onChange={(e) => setForm({ ...form, minStok: e.target.value })} className={s.formInput} />
              {errors.minStok && <p className={s.formError}>{errors.minStok}</p>}
            </div>
          </div>
        </div>

        <div className={s.modalFooter}>
          <button onClick={onClose} className={s.cancelButton}>Batal</button>
          <button onClick={handleSave} className={s.saveButton}>Simpan Stok</button>
        </div>
      </div>
    </div>
  );
}
