"use client";

import { useState } from "react";
import type { GudangCategory } from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";

interface CategoryModalProps {
  categories: GudangCategory[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function CategoryModal({ categories, saving, onClose, onSubmit }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }
    setError("");
    await onSubmit(name.trim());
  }

  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>Kategori Barang</h2>
            <p className={s.modalSubtitle}>Kelola kategori master stok gudang</p>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formGroup}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category.id} className={s.categoryBadge}>
                {category.name}
              </span>
            ))}
          </div>

          <div>
            <label className={s.formLabel}>Kategori Baru</label>
            <div className="flex items-center gap-2">
              <input
                className={s.formInput}
                placeholder="Contoh: Alumunium"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSubmit();
                }}
              />
              <button className={s.primaryButton} onClick={handleSubmit} disabled={saving}>
                <span className={s.buttonIcon}>add</span>
                Tambah
              </button>
            </div>
            {error && <p className={s.formError}>{error}</p>}
          </div>
        </div>

        <div className={s.modalFooter}>
          <button className={s.cancelButton} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
