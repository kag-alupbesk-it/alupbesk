"use client";

import { useState, useEffect } from "react";
import type { FaqFormData } from "../types/types";
import { emptyFaqForm } from "../types/types";
import { validateFaqForm } from "../helpers/helpers";
import * as s from "../../style/style";

interface FaqFormModalProps {
  isOpen: boolean;
  editItem: { id: string; question: string; answer: string; sortOrder: number; active: boolean } | null;
  onClose: () => void;
  onSave: (form: FaqFormData, id?: string) => void;
}

export default function FaqFormModal({ isOpen, editItem, onClose, onSave }: FaqFormModalProps) {
  const [form, setForm] = useState<FaqFormData>(emptyFaqForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FaqFormData, string>>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      setForm({
        question: editItem.question,
        answer: editItem.answer,
        sortOrder: editItem.sortOrder,
        active: editItem.active,
      });
    } else {
      setForm(emptyFaqForm());
    }
    setErrors({});
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  function handleSave() {
    const v = validateFaqForm(form);
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    onSave(form, editItem?.id);
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <h4 className={s.modalTitle}>{editItem ? "Edit FAQ" : "Tambah FAQ Baru"}</h4>
        <div className={s.modalForm}>
          <div>
            <label className={s.modalLabel}>Pertanyaan *</label>
            <input className={s.modalInput} placeholder="Pertanyaan yang sering diajukan" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            {errors.question && <p className={s.modalError}>{errors.question}</p>}
          </div>
          <div>
            <label className={s.modalLabel}>Jawaban *</label>
            <textarea className={s.modalTextarea} rows={4} placeholder="Jawaban lengkap" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            {errors.answer && <p className={s.modalError}>{errors.answer}</p>}
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
