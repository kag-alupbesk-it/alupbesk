"use client";

import { useState, useEffect } from "react";
import type { BannerFormData } from "../../../types";
import { emptyBannerForm } from "../../../types";
import { validateBannerForm } from "./helpers";
import FileUploadInput from "../../shared/FileUploadInput";
import * as s from "../style";

interface BannerFormModalProps {
  isOpen: boolean;
  editBanner: { id: string; title: string; subtitle?: string; imageUrl: string; linkUrl?: string; active: boolean; order: number; startDate?: string; endDate?: string } | null;
  onClose: () => void;
  onSave: (form: BannerFormData, id?: string) => void;
}

export default function BannerFormModal({ isOpen, editBanner, onClose, onSave }: BannerFormModalProps) {
  const [form, setForm] = useState<BannerFormData>(emptyBannerForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BannerFormData, string>>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editBanner) {
      setForm({
        title: editBanner.title,
        subtitle: editBanner.subtitle ?? "",
        imageUrl: editBanner.imageUrl,
        linkUrl: editBanner.linkUrl ?? "",
        active: editBanner.active,
        order: editBanner.order,
        startDate: editBanner.startDate ?? "",
        endDate: editBanner.endDate ?? "",
      });
    } else {
      setForm(emptyBannerForm);
    }
    setErrors({});
  }, [isOpen, editBanner]);

  if (!isOpen) return null;

  function handleSave() {
    const v = validateBannerForm(form);
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSave(form, editBanner?.id);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <h4 className={s.modalTitle}>{editBanner ? "Edit Banner" : "Tambah Banner Baru"}</h4>
        <div className={s.modalForm}>
          <div>
            <label className={s.modalLabel}>Judul Banner *</label>
            <input className={s.modalInput} placeholder="Contoh: Promo Akhir Tahun" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className={s.modalError}>{errors.title}</p>}
          </div>
          <div>
            <label className={s.modalLabel}>Subjudul</label>
            <input className={s.modalInput} placeholder="Teks pendukung banner" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div>
            <FileUploadInput
              label="Gambar Banner *"
              value={form.imageUrl}
              onChange={(imageUrl) => setForm({ ...form, imageUrl })}
              error={errors.imageUrl}
            />
          </div>
          <div>
            <label className={s.modalLabel}>URL Tautan</label>
            <input className={s.modalInput} placeholder="/katalog" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={s.modalLabel}>Urutan</label>
              <input className={s.modalInput} type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              {errors.order && <p className={s.modalError}>{errors.order}</p>}
            </div>
            <div>
              <label className={s.modalLabel}>Status</label>
              <select className={s.modalSelect} value={form.active ? "aktif" : "nonaktif"} onChange={(e) => setForm({ ...form, active: e.target.value === "aktif" })}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={s.modalLabel}>Tanggal Mulai</label>
              <input className={s.modalInput} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className={s.modalLabel}>Tanggal Akhir</label>
              <input className={s.modalInput} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
        </div>
        <div className={s.modalActions}>
          <button onClick={onClose} className={s.modalCancelButton}>Batal</button>
          <button onClick={handleSave} className={s.modalConfirmButton}>{editBanner ? "Simpan" : "Tambah"}</button>
        </div>
      </div>
    </div>
  );
}
