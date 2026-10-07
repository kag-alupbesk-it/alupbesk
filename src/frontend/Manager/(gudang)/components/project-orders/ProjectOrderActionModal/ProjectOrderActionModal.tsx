import type { ProjectOrder, ProjectOrderAction } from "../types/types";
import { itemLabel } from "../helpers/helpers";
import * as s from "../style/style";

interface Props {
  order: ProjectOrder | null;
  action: ProjectOrderAction | null;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ProjectOrderActionModal({ order, action, pending, onConfirm, onClose }: Props) {
  if (!order || !action) return null;

  const isProses = action === "proses";

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>{order.id}</div>
            <div className={s.modalSubtitle}>{order.namaProyek}</div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.confirmIcon}>
          <span className="material-symbols-outlined text-tertiary">
            {isProses ? "inventory_2" : "check_circle"}
          </span>
        </div>
        <div className={s.confirmTitle}>
          {isProses ? "Proses Pesanan Ini?" : "Tandai Selesai?"}
        </div>
        <div className={s.confirmText}>
          {isProses
            ? "Stok item proyek akan dipotong otomatis dan dicatat sebagai barang keluar ke proyek ini. Jika stok kurang, pesanan tidak dapat diproses — catat barang masuk dulu."
            : "Pastikan barang sudah keluar dari gudang dan dikirim ke proyek. Pesanan akan ditandai selesai."}
        </div>

        <div className="mb-5">
          {order.items.map((item) => (
            <div key={item.gudangItemId} className={s.itemCard}>
              <div className={s.itemTitle}>{item.sku}</div>
              <div className={s.itemQty}>{itemLabel(item)}</div>
              <div className={s.itemSubtotal}>
                {item.quantity} {item.satuan}
              </div>
            </div>
          ))}
        </div>

        <div className={s.totalRow}>
          <span className={s.totalLabel}>Total Barang</span>
          <span className={s.totalValue}>{order.totalQuantity} unit</span>
        </div>

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose} disabled={pending}>
            Batal
          </button>
          <button className={s.primaryButton} onClick={onConfirm} disabled={pending}>
            <span className="material-symbols-outlined text-[16px]">
              {pending ? "progress_activity" : isProses ? "bolt" : "check"}
            </span>
            {pending ? "Memproses..." : isProses ? "Proses Pesanan" : "Tandai Selesai"}
          </button>
        </div>
      </div>
    </div>
  );
}
