"use client";

import { useState } from "react";
import type { CaseStudyFormData } from "./types";
import { emptyCaseStudyForm } from "./types";
import { validateCaseStudyForm } from "./helpers";
import FileUploadInput from "../../shared/FileUploadInput";
import * as s from "../style";

interface CaseStudyFormModalProps {
  isOpen: boolean;
  editItem: { id: number; client: string; logo: string; industry: string; title: string; desc: string; metrics: { label: string; value: string }[]; img: string; year: number } | null;
  onClose: () => void;
  onSave: (form: CaseStudyFormData, id?: number) => void;
}

export default function CaseStudyFormModal({ isOpen, editItem, onClose, onSave }: CaseStudyFormModalProps) {
  const [form, setForm] = useState<CaseStudyFormData>(() => editItem ? {
    client: editItem.client,
    logo: editItem.logo,
    industry: editItem.industry,
    title: editItem.title,
    desc: editItem.desc,
    metrics: editItem.metrics.map((metric) => `${metric.label}: ${metric.value}`).join("\n"),
    img: editItem.img,
    year: editItem.year ? String(editItem.year) : "",
  } : emptyCaseStudyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof CaseStudyFormData, string>>>({});

  if (!isOpen) return null;

  function handleSave() {
    const v = validateCaseStudyForm(form);
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSave(form, editItem?.id);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <h4 className={s.modalTitle}>{editItem ? "Edit Studi Kasus" : "Tambah Studi Kasus"}</h4>
        <div className={s.modalForm}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={s.modalLabel}>Klien *</label><input className={s.modalInput} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />{errors.client && <p className={s.modalError}>{errors.client}</p>}</div>
            <div><label className={s.modalLabel}>Inisial / Logo</label><input className={s.modalInput} value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={s.modalLabel}>Industri *</label><input className={s.modalInput} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />{errors.industry && <p className={s.modalError}>{errors.industry}</p>}</div>
            <div><label className={s.modalLabel}>Tahun</label><input className={s.modalInput} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
          </div>
          <div><label className={s.modalLabel}>Judul *</label><input className={s.modalInput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />{errors.title && <p className={s.modalError}>{errors.title}</p>}</div>
          <div><label className={s.modalLabel}>Deskripsi</label><textarea className={s.modalTextarea} rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
          <div><label className={s.modalLabel}>Metrik (Label: Nilai, satu per baris)</label><textarea className={s.modalTextarea} rows={3} value={form.metrics} onChange={(e) => setForm({ ...form, metrics: e.target.value })} /></div>
          <div><FileUploadInput label="Gambar Proyek" value={form.img} onChange={(img) => setForm({ ...form, img })} /></div>
        </div>
        <div className={s.modalActions}>
          <button onClick={onClose} className={s.modalCancelButton}>Batal</button>
          <button onClick={handleSave} className={s.modalConfirmButton}>{editItem ? "Simpan" : "Tambah"}</button>
        </div>
      </div>
    </div>
  );
}
