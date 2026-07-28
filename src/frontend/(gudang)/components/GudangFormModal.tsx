"use client";

import { useState, useEffect } from "react";
import type { GudangItem } from "@/services/gudang";

// Form state dipisah dari GudangItem karena stok dan minStok diinput sebagai string
// sebelum dikonversi ke number — menghindari masalah controlled input dengan nilai numerik
interface FormState {
  sku: string;
  jenisBarang: "handle" | "mortise";
  merek: string;
  warna: string;
  seksiLokasi: string;
  stok: string;
  minStok: string;
  catatan: string;
}

const EMPTY_FORM: FormState = {
  sku: "",
  jenisBarang: "handle",
  merek: "",
  warna: "",
  seksiLokasi: "Seksi 1",
  stok: "0",
  minStok: "10",
  catatan: "",
};

const SEKSI_OPTIONS = ["Seksi 1", "Seksi 2", "Seksi 3", "Rak B (Atas)"];

interface GudangFormModalProps {
  isOpen: boolean;
  // Jika editItem diisi, modal berfungsi sebagai form Edit; jika null, sebagai form Tambah
  editItem: GudangItem | null;
  onClose: () => void;
  onSave: (item: GudangItem) => void;
}

export function GudangFormModal({ isOpen, editItem, onClose, onSave }: GudangFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Saat modal dibuka untuk Edit, isi form dengan data existing.
  // Saat dibuka untuk Tambah (editItem null), reset ke form kosong.
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
      // Pertahankan id lama saat edit; generate id baru saat tambah
      id: editItem?.id ?? `gd-${Date.now()}`,
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
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-primary-container border border-white/10 rounded-2xl p-6 shadow-2xl max-w-lg w-full text-on-surface max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-extrabold text-on-surface uppercase tracking-tight font-headline">
              {isEdit ? "Edit Data Barang" : "Tambah Barang Baru"}
            </h2>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              {isEdit ? `Mengubah data untuk SKU: ${editItem.sku}` : "Isi detail barang untuk ditambahkan ke inventaris"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* SKU */}
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              SKU / No. Model <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Contoh: HND-DKS-BK-001"
              className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
            />
            {errors.sku && <p className="text-error text-[10px] mt-1">{errors.sku}</p>}
          </div>

          {/* Jenis Barang & Merek — 2 kolom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Jenis Barang
              </label>
              <select
                value={form.jenisBarang}
                onChange={(e) => setForm({ ...form, jenisBarang: e.target.value as "handle" | "mortise" })}
                className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              >
                <option value="handle">Handle</option>
                <option value="mortise">Mortise</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Merek <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={form.merek}
                onChange={(e) => setForm({ ...form, merek: e.target.value })}
                placeholder="Contoh: DEKSON"
                className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
              {errors.merek && <p className="text-error text-[10px] mt-1">{errors.merek}</p>}
            </div>
          </div>

          {/* Warna & Lokasi Seksi — 2 kolom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Warna
              </label>
              <input
                type="text"
                value={form.warna}
                onChange={(e) => setForm({ ...form, warna: e.target.value })}
                placeholder="Contoh: Black Matte"
                className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Lokasi / Seksi
              </label>
              <select
                value={form.seksiLokasi}
                onChange={(e) => setForm({ ...form, seksiLokasi: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              >
                {SEKSI_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stok & Min Stok — 2 kolom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Jumlah Stok <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
              {errors.stok && <p className="text-error text-[10px] mt-1">{errors.stok}</p>}
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Min. Stok Alert
              </label>
              <input
                type="number"
                min="0"
                value={form.minStok}
                onChange={(e) => setForm({ ...form, minStok: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
              {errors.minStok && <p className="text-error text-[10px] mt-1">{errors.minStok}</p>}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Catatan Lokasi / Kondisi
            </label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Contoh: Beda rak dari Seksi 3"
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-surface-variant px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-all border border-white/10"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-secondary hover:brightness-110 text-on-secondary text-sm font-bold transition-all shadow-lg shadow-secondary/20"
          >
            {isEdit ? "Simpan Perubahan" : "Tambah Barang"}
          </button>
        </div>
      </div>
    </div>
  );
}