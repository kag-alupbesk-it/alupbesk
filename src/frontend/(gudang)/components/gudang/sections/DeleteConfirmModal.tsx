"use client";

import type { GudangItem } from "./types";
import * as s from "../style";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: GudangItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteConfirmModal({ isOpen, item, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen || !item) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdropClick}>
      <div className={s.deleteModalContent}>
        <div className={s.deleteIconWrapper}>
          <span className={s.iconLg}>delete_forever</span>
        </div>
        <div className="text-center mb-6">
          <h2 className={s.deleteModalTitle}>Hapus Data Barang?</h2>
          <p className={s.deleteModalText}>Kamu akan menghapus barang berikut dari inventaris gudang:</p>
          <div className={s.itemCard}>
            <div className={s.itemSkuWrapper}>
              <span className={s.itemSku}>{item.sku}</span>
              <span className={s.itemMerekBadge}>{item.merek}</span>
            </div>
            <p className={s.itemDetail}>{item.jenisBarang} · {item.warna} · {item.seksiLokasi}</p>
            <p className={s.itemStok}>Stok saat ini: <span className={s.itemStokValue}>{item.stok} pcs</span></p>
          </div>
          <p className={s.warningText}>Aksi ini tidak dapat dibatalkan.</p>
        </div>
        <div className={s.deleteModalFooter}>
          <button onClick={onClose} className={s.deleteCancelButton}>Batal</button>
          <button onClick={() => onConfirm(item.id)} className={s.deleteConfirmButton}>Hapus Barang</button>
        </div>
      </div>
    </div>
  );
}
