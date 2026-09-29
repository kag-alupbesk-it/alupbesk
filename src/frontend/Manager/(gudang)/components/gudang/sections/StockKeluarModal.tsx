"use client";

import { useState } from "react";
import type { GudangItem, GudangKeluarInput } from "./types";
import { todayIso } from "./helpers";
import * as s from "../style";

interface StockKeluarModalProps {
  item: GudangItem;
  onClose: () => void;
  onSave: (input: GudangKeluarInput) => Promise<void>;
}

interface KeluarForm {
  jumlah: string;
  tanggal: string;
  tujuanJenis: string;
  tujuanNama: string;
  penerima: string;
  catatan: string;
}

export function StockKeluarModal({ item, onClose, onSave }: StockKeluarModalProps) {
  const [form, setForm] = useState<KeluarForm>(() => ({
    jumlah: "",
    tanggal: todayIso(),
    tujuanJenis: "proyek",
    tujuanNama: "",
    penerima: "",
    catatan: "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof KeluarForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const jumlahNum = Number(form.jumlah);
  const stokSesudah = item.stok - (isNaN(jumlahNum) || jumlahNum < 0 ? 0 : jumlahNum);
  const stokCukup = !isNaN(jumlahNum) && jumlahNum <= item.stok;
  const tujuan = `${form.tujuanJenis === "proyek" ? "Proyek" : "Penjualan"}: ${form.tujuanNama.trim()}`;

  function validate(): boolean {
    const newErrors: Partial<Record<keyof KeluarForm, string>> = {};
    if (isNaN(jumlahNum) || jumlahNum <= 0) newErrors.jumlah = "Jumlah harus lebih dari 0";
    else if (jumlahNum > item.stok) newErrors.jumlah = `Stok hanya ${item.stok} ${item.satuan}`;
    if (!form.tanggal) newErrors.tanggal = "Tanggal wajib diisi";
    if (!form.tujuanNama.trim()) newErrors.tujuanNama = "Nama proyek/penjualan wajib diisi";
    if (!form.penerima.trim()) newErrors.penerima = "Nama penerima wajib diisi";
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
        tujuan,
        penerima: form.penerima.trim(),
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
            <h2 className={s.modalTitle}>Catat Barang Keluar</h2>
            <p className={s.modalSubtitle}>Stok berkurang otomatis setelah disimpan</p>
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
            Setelah keluar: <span className={stokCukup ? s.itemStokValue : "font-bold text-error"}>{Math.max(0, stokSesudah)} {item.satuan}</span>
          </p>
        </div>

        <div className={s.formGroup}>
          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>
                Jumlah Keluar <span className={s.required}>*</span>
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
              <label className={s.formLabel}>Tujuan</label>
              <select value={form.tujuanJenis} onChange={(e) => setForm({ ...form, tujuanJenis: e.target.value })} className={s.formInput}>
                <option value="proyek">Proyek</option>
                <option value="penjualan">Penjualan</option>
              </select>
            </div>
            <div>
              <label className={s.formLabel}>
                Nama Proyek / Penjualan <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="Contoh: Proyek Apartemen Citra 2" value={form.tujuanNama} onChange={(e) => setForm({ ...form, tujuanNama: e.target.value })} className={s.formInput} />
              {errors.tujuanNama && <p className={s.formError}>{errors.tujuanNama}</p>}
            </div>
          </div>

          <div>
            <label className={s.formLabel}>
              Penerima <span className={s.required}>*</span>
            </label>
            <input type="text" placeholder="Contoh: Pak Budi (kepala proyek)" value={form.penerima} onChange={(e) => setForm({ ...form, penerima: e.target.value })} className={s.formInput} />
            {errors.penerima && <p className={s.formError}>{errors.penerima}</p>}
          </div>

          <div>
            <label className={s.formLabel}>Catatan</label>
            <textarea rows={2} placeholder="Opsional" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className={s.formTextarea} />
          </div>
        </div>

        <div className={s.modalFooter}>
          <button onClick={onClose} className={s.cancelButton}>Batal</button>
          <button onClick={handleSave} disabled={saving} className={s.saveButton}>
            {saving ? "Menyimpan..." : "Simpan Barang Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}
