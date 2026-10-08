"use client";

import { useState } from "react";
import type { PartnerFormData } from "../types/types";
import { emptyPartnerForm } from "../types/types";
import { validatePartnerForm } from "../helpers/helpers";
import FileUploadInput from "../../../shared/FileUploadInput/FileUploadInput";
import * as s from "../../style/style";

interface PartnerFormModalProps {
  isOpen: boolean;
  editPartner: { id: string; name: string; initials: string; logoUrl?: string; sortOrder: number; active: boolean } | null;
  onClose: () => void;
  onSave: (form: PartnerFormData, id?: string) => void;
}

export default function PartnerFormModal({ isOpen, editPartner, onClose, onSave }: PartnerFormModalProps) {
  const [form, setForm] = useState<PartnerFormData>(() => editPartner ? {
    name: editPartner.name,
    initials: editPartner.initials,
    logoUrl: editPartner.logoUrl ?? "",
    sortOrder: editPartner.sortOrder,
    active: editPartner.active,
  } : emptyPartnerForm());
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({});

  if (!isOpen) return null;

  function handleSave() {
    const v = validatePartnerForm(form);
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSave(form, editPartner?.id);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <h4 className={s.modalTitle}>{editPartner ? "Edit Mitra" : "Tambah Mitra Baru"}</h4>
        <div className={s.modalForm}>
          <div>
            <label className={s.modalLabel}>Nama Mitra *</label>
            <input className={s.modalInput} placeholder="PT Contoh Industri" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className={s.modalError}>{errors.name}</p>}
          </div>
          <div>
            <label className={s.modalLabel}>Inisial *</label>
            <input className={s.modalInput} placeholder="CI" value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} />
            {errors.initials && <p className={s.modalError}>{errors.initials}</p>}
          </div>
          <div>
            <FileUploadInput
              label="Logo"
              value={form.logoUrl}
              onChange={(logoUrl) => setForm({ ...form, logoUrl })}
            />
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
          <button onClick={handleSave} className={s.modalConfirmButton}>{editPartner ? "Simpan" : "Tambah"}</button>
        </div>
      </div>
    </div>
  );
}
