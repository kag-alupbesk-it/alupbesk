"use client";

import { useState } from "react";
import type { GudangItemInput } from "../shared/types";
import * as s from "../shared/style";

interface ItemFormModalProps {
  onClose: () => void;
  onSave: (input: GudangItemInput) => Promise<void>;
}

interface ItemForm {
  sku: string;
  jenisBarang: string;
  kategoriBarang: "eceran" | "proyek";
  satuan: string;
  merek: string;
  warna: string;
  seksiLokasi: string;
  proyek: string;
  stokAwal: string;
  minStok: string;
  catatan: string;
  sumberAwal: string;
}

const emptyForm: ItemForm = {
  sku: "",
  jenisBarang: "",
  kategoriBarang: "eceran",
  satuan: "pcs",
  merek: "",
  warna: "",
  seksiLokasi: "",
  proyek: "",
  stokAwal: "0",
  minStok: "0",
  catatan: "",
  sumberAwal: "",
};

export function ItemFormModal({ onClose, onSave }: ItemFormModalProps) {
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ItemForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const stokAwalNum = Number(form.stokAwal);
  const minStokNum = Number(form.minStok);
  const isProyek = form.kategoriBarang === "proyek";

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ItemForm, string>> = {};
    if (!form.sku.trim()) newErrors.sku = "SKU wajib diisi";
    if (!form.jenisBarang.trim()) newErrors.jenisBarang = "Jenis barang wajib diisi";
    if (!form.satuan.trim()) newErrors.satuan = "Satuan wajib diisi";
    if (!form.merek.trim()) newErrors.merek = "Merek wajib diisi";
    if (!form.warna.trim()) newErrors.warna = "Warna wajib diisi";
    if (!form.seksiLokasi.trim()) newErrors.seksiLokasi = "Lokasi / seksi wajib diisi";
    if (isProyek && !form.proyek.trim()) newErrors.proyek = "Nama proyek wajib diisi";
    if (isNaN(stokAwalNum) || stokAwalNum < 0) newErrors.stokAwal = "Stok awal minimal 0";
    if (isNaN(minStokNum) || minStokNum < 0) newErrors.minStok = "Min stok minimal 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        sku: form.sku.trim(),
        jenisBarang: form.jenisBarang.trim(),
        kategoriBarang: form.kategoriBarang,
        satuan: form.satuan.trim(),
        merek: form.merek.trim(),
        warna: form.warna.trim(),
        seksiLokasi: form.seksiLokasi.trim(),
        stokAwal: stokAwalNum,
        minStok: minStokNum,
        proyek: isProyek ? form.proyek.trim() : undefined,
        catatan: form.catatan.trim() || undefined,
        sumberAwal: stokAwalNum > 0 && form.sumberAwal.trim() ? form.sumberAwal.trim() : undefined,
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
            <h2 className={s.modalTitle}>Tambah Barang Baru</h2>
            <p className={s.modalSubtitle}>Registrasi item gudang beserta stok awal</p>
          </div>
          <button onClick={onClose} className={s.modalCloseButton}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formGroup}>
          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>
                SKU / No. Model <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="Contoh: BGT-M5-100" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={s.formInput} />
              {errors.sku && <p className={s.formError}>{errors.sku}</p>}
              {isProyek && (
                <p className={s.formHint}>
                  SKU harus unik. Material yang sama dipakai di proyek lain — gunakan SKU berbeda, contoh: KSN-ALU-900-CITRA2.
                </p>
              )}
            </div>
            <div>
              <label className={s.formLabel}>
                Jenis Barang <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="Contoh: baut, handle, kusen" value={form.jenisBarang} onChange={(e) => setForm({ ...form, jenisBarang: e.target.value })} className={s.formInput} />
              {errors.jenisBarang && <p className={s.formError}>{errors.jenisBarang}</p>}
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>
                Kategori <span className={s.required}>*</span>
              </label>
              <select value={form.kategoriBarang} onChange={(e) => setForm({ ...form, kategoriBarang: e.target.value as "eceran" | "proyek" })} className={s.formInput}>
                <option value="eceran">Barang Eceran</option>
                <option value="proyek">Proyek / Inventaris</option>
              </select>
            </div>
            <div>
              <label className={s.formLabel}>
                Satuan <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="pcs, set, batang, box..." value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className={s.formInput} />
              {errors.satuan && <p className={s.formError}>{errors.satuan}</p>}
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>
                Merek <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="Contoh: DEKSON" value={form.merek} onChange={(e) => setForm({ ...form, merek: e.target.value })} className={s.formInput} />
              {errors.merek && <p className={s.formError}>{errors.merek}</p>}
            </div>
            <div>
              <label className={s.formLabel}>
                Warna <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="Contoh: Black Matte" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} className={s.formInput} />
              {errors.warna && <p className={s.formError}>{errors.warna}</p>}
            </div>
          </div>

          <div>
            <label className={s.formLabel}>
              Lokasi / Seksi <span className={s.required}>*</span>
            </label>
            <input type="text" placeholder="Contoh: Seksi 4" value={form.seksiLokasi} onChange={(e) => setForm({ ...form, seksiLokasi: e.target.value })} className={s.formInput} />
            {errors.seksiLokasi && <p className={s.formError}>{errors.seksiLokasi}</p>}
          </div>

          {isProyek && (
            <div>
              <label className={s.formLabel}>
                Nama Proyek <span className={s.required}>*</span>
              </label>
              <input type="text" placeholder="Contoh: Proyek Apartemen Citra 2" value={form.proyek} onChange={(e) => setForm({ ...form, proyek: e.target.value })} className={s.formInput} />
              {errors.proyek && <p className={s.formError}>{errors.proyek}</p>}
            </div>
          )}

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Stok Awal</label>
              <input type="number" min="0" value={form.stokAwal} onChange={(e) => setForm({ ...form, stokAwal: e.target.value })} className={s.formInput} />
              {errors.stokAwal && <p className={s.formError}>{errors.stokAwal}</p>}
            </div>
            <div>
              <label className={s.formLabel}>Min. Stok Alert</label>
              <input type="number" min="0" value={form.minStok} onChange={(e) => setForm({ ...form, minStok: e.target.value })} className={s.formInput} />
              {errors.minStok && <p className={s.formError}>{errors.minStok}</p>}
            </div>
          </div>

          {stokAwalNum > 0 && (
            <div>
              <label className={s.formLabel}>Sumber Stok Awal (supplier/tengkulak)</label>
              <input type="text" placeholder="Contoh: Supplier: PT Sinar Bangunan" value={form.sumberAwal} onChange={(e) => setForm({ ...form, sumberAwal: e.target.value })} className={s.formInput} />
            </div>
          )}

          <div>
            <label className={s.formLabel}>Catatan</label>
            <textarea rows={2} placeholder="Opsional" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className={s.formTextarea} />
          </div>
        </div>

        <div className={s.modalFooter}>
          <button onClick={onClose} className={s.cancelButton}>Batal</button>
          <button onClick={handleSave} disabled={saving} className={s.saveButton}>
            {saving ? "Menyimpan..." : "Simpan Barang"}
          </button>
        </div>
      </div>
    </div>
  );
}
