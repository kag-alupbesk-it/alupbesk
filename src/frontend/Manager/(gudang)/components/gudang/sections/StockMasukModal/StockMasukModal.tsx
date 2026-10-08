"use client";

import { useState } from "react";
import type { GudangItem, GudangMasukInput } from "../shared/types";
import { todayIso } from "../shared/helpers";
import * as s from "../shared/style";

interface StockMasukModalProps {
  item: GudangItem;
  onClose: () => void;
  onSave: (input: GudangMasukInput) => Promise<void>;
}

interface MasukForm {
  jumlah: string;
  tanggal: string;
  sumberJenis: string;
  sumberNama: string;
  buktiNota: string;
  catatan: string;
}

export function StockMasukModal({ item, onClose, onSave }: StockMasukModalProps) {
  const [form, setForm] = useState<MasukForm>(() => ({
    jumlah: "",
    tanggal: todayIso(),
    sumberJenis: "supplier",
    sumberNama: "",
    buktiNota: "",
    catatan: "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof MasukForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const jumlahNum = Number(form.jumlah);
  const stokSesudah = item.stok + (isNaN(jumlahNum) || jumlahNum < 0 ? 0 : jumlahNum);
  const sumber = `${form.sumberJenis === "supplier" ? "Supplier" : "Tengkulak"}: ${form.sumberNama.trim()}`;

  function validate(): boolean {
    const newErrors: Partial<Record<keyof MasukForm, string>> = {};
    if (isNaN(jumlahNum) || jumlahNum <= 0) newErrors.jumlah = "Jumlah harus lebih dari 0";
    if (!form.tanggal) newErrors.tanggal = "Tanggal wajib diisi";
    if (!form.sumberNama.trim()) newErrors.sumberNama = "Nama supplier/tengkulak wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        jumlah: jumlahNum,
        tanggal: form.tanggal,
        sumber,
        buktiNota: form.buktiNota.trim() || undefined,
        catatan: form.catatan.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdropClick}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>Catat Barang Masuk</h2>
            <p className={s.modalSubtitle}>Stok bertambah otomatis setelah disimpan</p>
          </div>
          <button onClick={onClose} className={s.modalCloseButton}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={`${s.itemCard} mb-5`}>
          <div className={s.itemSkuWrapper}>
            <span className={s.itemSku}>{item.sku}</span>
            <span className={s.itemMerekBadge}>{item.merek}</span>
            <span className={s.itemMerekBadge}>{item.kategoriBarang}</span>
          </div>
          <p className={s.itemDetail}>
            {item.jenisBarang} · {item.warna} · {item.seksiLokasi}
          </p>
          <p className={s.itemStok}>
            Stok saat ini: <span className={s.itemStokValue}>{item.stok} {item.satuan}</span>
            <span className="mx-2 text-on-surface-variant/40">&rarr;</span>
            Setelah masuk: <span className={s.itemStokValue}>{stokSesudah} {item.satuan}</span>
          </p>
        </div>

        <div className={s.formGroup}>
          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>
                Jumlah Masuk <span className={s.required}>*</span>
              </label>
              <input type="number" min="1" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className={s.formInput} />
              {errors.jumlah && <p className={s.formError}>{errors.jumlah}</p>}
            </div>
            <div>
              <label className={s.formLabel}>
                Tanggal <span className={s.required}>*</span>
              </label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className={s.formInput} />
              {errors.tanggal && <p className={s.formError}>{errors.tanggal}</p>}
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Dari</label>
              <select value={form.sumberJenis} onChange={(e) => setForm({ ...form, sumberJenis: e.target.value })} className={s.formInput}>
                <option value="supplier">Supplier</option>
                <option value="tengkulak">Tengkulak</option>
              </select>
            </div>
            <div>
              <label className={s.formLabel}>
                Nama Supplier / Tengkulak <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="Contoh: PT Sinar Bangunan" value={form.sumberNama} onChange={(e) => setForm({ ...form, sumberNama: e.target.value })} className={s.formInput} />
              {errors.sumberNama && <p className={s.formError}>{errors.sumberNama}</p>}
            </div>
          </div>

          <div>
            <label className={s.formLabel}>No. Nota / Bukti</label>
            <input type="text" placeholder="Contoh: INV-2024-0812" value={form.buktiNota} onChange={(e) => setForm({ ...form, buktiNota: e.target.value })} className={s.formInput} />
          </div>

          <div>
            <label className={s.formLabel}>Catatan</label>
            <textarea rows={2} placeholder="Opsional" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className={s.formTextarea} />
          </div>
        </div>

        <div className={s.modalFooter}>
          <button onClick={onClose} className={s.cancelButton}>Batal</button>
          <button onClick={handleSave} disabled={saving} className={s.saveButton}>
            {saving ? "Menyimpan..." : "Simpan Barang Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
