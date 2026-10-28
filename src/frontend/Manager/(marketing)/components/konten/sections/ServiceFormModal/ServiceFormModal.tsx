"use client";

import { useState } from "react";
import type { ServiceFormData } from "../types/types";
import { emptyServiceForm } from "../types/types";
import { validateServiceForm } from "../helpers/helpers";
import * as s from "../../style/style";

interface ServiceFormModalProps {
  isOpen: boolean;
  editItem: { id: string; icon: string; title: string; description: string; sortOrder: number; active: boolean } | null;
  onClose: () => void;
  onSave: (form: ServiceFormData, id?: string) => void;
}

export default function ServiceFormModal({ isOpen, editItem, onClose, onSave }: ServiceFormModalProps) {
  const [form, setForm] = useState<ServiceFormData>(() => editItem ? {
    icon: editItem.icon,
    title: editItem.title,
    description: editItem.description,
    sortOrder: editItem.sortOrder,
    active: editItem.active,
  } : emptyServiceForm());
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});

  if (!isOpen) return null;

  function handleSave() {
    const v = validateServiceForm(form);
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSave(form, editItem?.id);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <h4 className={s.modalTitle}>{editItem ? "Edit Layanan" : "Tambah Layanan Baru"}</h4>
        <div className={s.modalForm}>
          <div>
            <label className={s.modalLabel}>Ikon (Material Symbols) *</label>
            <input className={s.modalInput} placeholder="Contoh: build, precision_manufacturing" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            {errors.icon && <p className={s.modalError}>{errors.icon}</p>}
          </div>
          <div>
            <label className={s.modalLabel}>Judul Layanan *</label>
            <input className={s.modalInput} placeholder="Contoh: Fabrikasi Custom" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className={s.modalError}>{errors.title}</p>}
          </div>
          <div>
            <label className={s.modalLabel}>Deskripsi *</label>
            <textarea className={s.modalTextarea} rows={3} placeholder="Deskripsi singkat layanan" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {errors.description && <p className={s.modalError}>{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={s.modalLabel}>Urutan</label>
              <input className={s.modalInput} type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className={s.modalLabel}>Status</label>
              <select className={s.modalSelect} value={form.active ? "aktif" : "nonaktif"} onChange={(e) => setForm({ ...form, active: e.target.value === "aktif" })}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>
        <div className={s.modalActions}>
          <button onClick={onClose} className={s.modalCancelButton}>Batal</button>
          <button onClick={handleSave} className={s.modalConfirmButton}>{editItem ? "Simpan" : "Tambah"}</button>
        </div>
      </div>
    </div>
  );
}
