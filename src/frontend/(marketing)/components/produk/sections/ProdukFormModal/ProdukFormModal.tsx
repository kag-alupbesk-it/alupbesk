"use client";

import { useState } from "react";
import type { MarketingProduct, ProductFormData } from "../types/types";
import { EMPTY_PRODUCT_FORM } from "../types/types";
import FileUploadInput from "../../../shared/FileUploadInput/FileUploadInput";
import * as s from "../../style/style";

interface ProdukFormModalProps {
  editProduct: MarketingProduct | null;
  onClose: () => void;
  onSave: (form: ProductFormData, id?: number) => void;
}

function initialForm(editProduct: MarketingProduct | null): ProductFormData {
  if (!editProduct) return EMPTY_PRODUCT_FORM;
  return {
    title: editProduct.title,
    category: editProduct.category,
    sku: editProduct.sku,
    price: String(editProduct.price),
    stock: String(editProduct.stock),
    img: editProduct.img,
    desc: editProduct.desc,
  };
}

export default function ProdukFormModal({ editProduct, onClose, onSave }: ProdukFormModalProps) {
  const [form, setForm] = useState<ProductFormData>(() => initialForm(editProduct));
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.title.trim()) nextErrors.title = "Nama produk wajib diisi";
    if (!form.category.trim()) nextErrors.category = "Kategori wajib diisi";
    if (!form.sku.trim()) nextErrors.sku = "SKU wajib diisi";
    const price = Number(form.price);
    if (isNaN(price) || price < 0) nextErrors.price = "Harga harus angka minimal 0";
    const stock = Number(form.stock);
    if (isNaN(stock) || stock < 0) nextErrors.stock = "Stok harus angka minimal 0";
    if (!form.img.trim()) nextErrors.img = "URL gambar wajib diisi";
    if (!form.desc.trim()) nextErrors.desc = "Deskripsi wajib diisi";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(form, editProduct?.id);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <h4 className={s.modalTitle}>{editProduct ? `Edit Produk: ${editProduct.sku}` : "Upload Produk Baru"}</h4>
        <div className={s.modalForm}>
          <div>
            <label className={s.modalLabel}>Nama Produk *</label>
            <input className={s.modalInput} placeholder="Contoh: T-Slot Aluminum 4040" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className={s.modalError}>{errors.title}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={s.modalLabel}>Kategori *</label>
              <input className={s.modalInput} placeholder="Contoh: AKSESORIS" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              {errors.category && <p className={s.modalError}>{errors.category}</p>}
            </div>
            <div>
              <label className={s.modalLabel}>SKU *</label>
              <input className={s.modalInput} placeholder="Contoh: ALU-4040-500" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              {errors.sku && <p className={s.modalError}>{errors.sku}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={s.modalLabel}>Harga (Rp) *</label>
              <input className={s.modalInput} type="number" min="0" placeholder="Contoh: 125000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              {errors.price && <p className={s.modalError}>{errors.price}</p>}
            </div>
            <div>
              <label className={s.modalLabel}>Stok *</label>
              <input className={s.modalInput} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              {errors.stock && <p className={s.modalError}>{errors.stock}</p>}
            </div>
          </div>
          <div>
            <FileUploadInput
              label="Gambar Produk *"
              value={form.img}
              onChange={(img) => setForm({ ...form, img })}
              error={errors.img}
            />
          </div>
          <div>
            <label className={s.modalLabel}>Deskripsi *</label>
            <textarea className={s.modalTextarea} rows={3} placeholder="Deskripsi singkat produk" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            {errors.desc && <p className={s.modalError}>{errors.desc}</p>}
          </div>
        </div>
        <div className={s.modalActions}>
          <button onClick={onClose} className={s.modalCancelButton}>Batal</button>
          <button onClick={handleSave} className={s.modalConfirmButton}>{editProduct ? "Simpan Perubahan" : "Upload Produk"}</button>
        </div>
      </div>
    </div>
  );
}
