import type { GudangOrder, OrderAction } from "../shared/types";
import { formatCurrency } from "../shared/helpers";
import * as s from "../shared/style";

interface Props {
  order: GudangOrder | null;
  action: OrderAction | null;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function OrderActionModal({ order, action, pending, onConfirm, onClose }: Props) {
  if (!order || !action) return null;

  const isProcess = action === "process";

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>{order.id}</div>
            <div className={s.modalSubtitle}>{order.customer.name}</div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.confirmIcon}>
          <span className={`material-symbols-outlined text-secondary ${isProcess ? "" : ""}`}>{isProcess ? "inventory_2" : "check_circle"}</span>
        </div>
        <div className={s.confirmTitle}>
          {isProcess ? "Proses Pesanan Ini?" : "Tandai Selesai?"}
        </div>
        <div className={s.confirmText}>
          {isProcess
            ? "Stok gudang akan dipotong otomatis sesuai item pesanan. Item yang tidak terdaftar di gudang akan dilewati. Jika stok gudang kurang, pesanan tidak dapat diproses — catat barang masuk dulu sebelum mencoba lagi."
            : "Pastikan barang sudah keluar dari gudang dan dikirim ke pelanggan. Pesanan akan ditandai selesai."}
        </div>

        <div className="mb-5">
          {order.items.map((item) => (
            <div key={item.productId} className={s.itemCard}>
              <div className={s.itemTitle}>{item.title}</div>
              <div className={s.itemQty}>
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </div>
              <div className={s.itemSubtotal}>{formatCurrency(item.subtotal)}</div>
            </div>
          ))}
        </div>

        <div className={s.totalRow}>
          <span className={s.totalLabel}>Total</span>
          <span className={s.totalValue}>{formatCurrency(order.total)}</span>
        </div>

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose} disabled={pending}>
            Batal
          </button>
          <button className={s.primaryButton} onClick={onConfirm} disabled={pending}>
            <span className="material-symbols-outlined text-[16px]">
              {pending ? "progress_activity" : isProcess ? "bolt" : "check"}
            </span>
            {pending ? "Memproses..." : isProcess ? "Proses Pesanan" : "Tandai Selesai"}
          </button>
        </div>
      </div>
    </div>
  );
}
