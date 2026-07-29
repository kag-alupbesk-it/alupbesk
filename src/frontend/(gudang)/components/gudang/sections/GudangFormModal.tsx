"use client";

import { useState, useEffect } from "react";
import type { GudangItem } from "./types";
import { EMPTY_FORM, SEKSI_OPTIONS } from "./data";
import { generateId } from "./helpers";
import type { FormState } from "./data";
import * as s from "../style";

interface GudangFormModalProps {
  isOpen: boolean;
  editItem: GudangItem | null;
  onClose: () => void;
  onSave: (item: GudangItem) => void;
}

export function GudangFormModal({ isOpen, editItem, onClose, onSave }: GudangFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      setForm({
        sku: editItem.sku,
        jenisBarang: editItem.jenisBarang,
        merek: editItem.merek,
        warna: editItem.warna,
        seksiLokasi: editItem.seksiLokasi,
        stok: String(editItem.stok),
        minStok: String(editItem.minStok),
        catatan: editItem.catatan ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.sku.trim()) newErrors.sku = "SKU wajib diisi";
    if (!form.merek.trim()) newErrors.merek = "Merek wajib diisi";
    const stokNum = Number(form.stok);
    if (isNaN(stokNum) || stokNum < 0) newErrors.stok = "Stok harus angka minimal 0";
    const minStokNum = Number(form.minStok);
    if (isNaN(minStokNum) || minStokNum < 0) newErrors.minStok = "Min stok harus angka minimal 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const saved: GudangItem = {
      id: editItem?.id ?? generateId(),
      sku: form.sku.trim().toUpperCase(),
      jenisBarang: form.jenisBarang,
      merek: form.merek.trim().toUpperCase(),
      warna: form.warna.trim(),
      seksiLokasi: form.seksiLokasi,
      stok: Number(form.stok),
      minStok: Number(form.minStok),
      catatan: form.catatan.trim() || undefined,
    };
    onSave(saved);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const isEdit = !!editItem;

  return (
    <div className={s.modalBackdrop} onClick={handleBackdropClick}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>
              {isEdit ? "Edit Data Barang" : "Tambah Barang Baru"}
            </h2>
            <p className={s.modalSubtitle}>
              {isEdit ? `Mengubah data untuk SKU: ${editItem.sku}` : "Isi detail barang untuk ditambahkan ke inventaris"}
            </p>
          </div>
          <button onClick={onClose} className={s.modalCloseButton}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formGroup}>
          <div>
            <label className={s.formLabel}>
              SKU / No. Model <span className={s.required}>*</span>
            </label>
            <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Contoh: HND-DKS-BK-001" className={s.formInput} />
            {errors.sku && <p className={s.formError}>{errors.sku}</p>}
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Jenis Barang</label>
              <select value={form.jenisBarang} onChange={(e) => setForm({ ...form, jenisBarang: e.target.value as "handle" | "mortise" })} className={s.formInput}>
                <option value="handle">Handle</option>
                <option value="mortise">Mortise</option>
              </select>
            </div>
            <div>
              <label className={s.formLabel}>Merek <span className={s.required}>*</span></label>
              <input type="text" value={form.merek} onChange={(e) => setForm({ ...form, merek: e.target.value })}
                placeholder="Contoh: DEKSON" className={s.formInput} />
              {errors.merek && <p className={s.formError}>{errors.merek}</p>}
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Warna</label>
              <input type="text" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })}
                placeholder="Contoh: Black Matte" className={s.formInput} />
            </div>
            <div>
              <label className={s.formLabel}>Lokasi / Seksi</label>
              <select value={form.seksiLokasi} onChange={(e) => setForm({ ...form, seksiLokasi: e.target.value })} className={s.formInput}>
                {SEKSI_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Jumlah Stok <span className={s.required}>*</span></label>
              <input type="number" min="0" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} className={s.formInput} />
              {errors.stok && <p className={s.formError}>{errors.stok}</p>}
            </div>
            <div>
              <label className={s.formLabel}>Min. Stok Alert</label>
              <input type="number" min="0" value={form.minStok} onChange={(e) => setForm({ ...form, minStok: e.target.value })} className={s.formInput} />
              {errors.minStok && <p className={s.formError}>{errors.minStok}</p>}
            </div>
          </div>

          <div>
            <label className={s.formLabel}>Catatan Lokasi / Kondisi</label>
            <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Contoh: Beda rak dari Seksi 3" rows={2} className={s.formTextarea} />
          </div>
        </div>

        <div className={s.modalFooter}>
          <button onClick={onClose} className={s.cancelButton}>Batal</button>
          <button onClick={handleSave} className={s.saveButton}>
            {isEdit ? "Simpan Perubahan" : "Tambah Barang"}
          </button>
        </div>
      </div>
    </div>
  );
}
