"use client";

import * as s from "../../style/style";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  saving,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>{title}</h2>
            <p className={s.modalSubtitle}>Konfirmasi tindakan</p>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>

        <div className={s.modalFooter}>
          <button className={s.cancelButton} onClick={onClose}>
            Batal
          </button>
          <button className={s.dangerButton} onClick={onConfirm} disabled={saving}>
            {saving ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
