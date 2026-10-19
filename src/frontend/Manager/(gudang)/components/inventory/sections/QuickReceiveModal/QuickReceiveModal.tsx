"use client";

import { GudangCategory } from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";
import QuickReceiveForm from "../../QuickReceiveForm/QuickReceiveForm";

interface Props {
  categories: GudangCategory[];
  onClose: () => void;
  onComplete: () => void;
}

export function QuickReceiveModal({ categories, onClose, onComplete }: Props) {
  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>Penerimaan Barang Cepat</h2>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>
        <QuickReceiveForm categories={categories} onComplete={onComplete} />
      </div>
    </div>
  );
}
