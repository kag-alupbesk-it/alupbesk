"use client";

import { useState } from "react";
import type { PortfolioItemFormData } from "../types/types";
import { emptyPortfolioItemForm } from "../types/types";
import { validatePortfolioItemForm } from "../helpers/helpers";
import FileUploadInput from "../../../shared/FileUploadInput/FileUploadInput";
import * as s from "../../style/style";

interface PortfolioItemFormModalProps {
  isOpen: boolean;
  editItem: { id: number; client: string; industry: string; title: string; challenge: string; solution: string; result: string; img: string; tags: string[]; year: number } | null;
  onClose: () => void;
  onSave: (form: PortfolioItemFormData, id?: number) => void;
}

export default function PortfolioItemFormModal({ isOpen, editItem, onClose, onSave }: PortfolioItemFormModalProps) {
  const [form, setForm] = useState<PortfolioItemFormData>(() => editItem ? {
    client: editItem.client,
    industry: editItem.industry,
    title: editItem.title,
    challenge: editItem.challenge,
    solution: editItem.solution,
    result: editItem.result,
    img: editItem.img,
    tags: editItem.tags.join(", "),
    year: editItem.year ? String(editItem.year) : "",
  } : emptyPortfolioItemForm());
  const [errors, setErrors] = useState<Partial<Record<keyof PortfolioItemFormData, string>>>({});

  if (!isOpen) return null;

  function handleSave() {
    const v = validatePortfolioItemForm(form);
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSave(form, editItem?.id);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <h4 className={s.modalTitle}>{editItem ? "Edit Item Portofolio" : "Tambah Item Portofolio"}</h4>
        <div className={s.modalForm}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={s.modalLabel}>Klien *</label><input className={s.modalInput} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />{errors.client && <p className={s.modalError}>{errors.client}</p>}</div>
            <div><label className={s.modalLabel}>Industri *</label><input className={s.modalInput} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />{errors.industry && <p className={s.modalError}>{errors.industry}</p>}</div>
          </div>
          <div><label className={s.modalLabel}>Judul Proyek *</label><input className={s.modalInput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />{errors.title && <p className={s.modalError}>{errors.title}</p>}</div>
          <div><label className={s.modalLabel}>Tantangan *</label><textarea className={s.modalTextarea} rows={2} value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} />{errors.challenge && <p className={s.modalError}>{errors.challenge}</p>}</div>
          <div><label className={s.modalLabel}>Solusi *</label><textarea className={s.modalTextarea} rows={2} value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} />{errors.solution && <p className={s.modalError}>{errors.solution}</p>}</div>
          <div><label className={s.modalLabel}>Hasil *</label><textarea className={s.modalTextarea} rows={2} value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} />{errors.result && <p className={s.modalError}>{errors.result}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={s.modalLabel}>Tag (pisahkan dengan koma)</label><input className={s.modalInput} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
            <div><label className={s.modalLabel}>Tahun</label><input className={s.modalInput} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
          </div>
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
