import type { GudangOrder } from "./types";
import { formatCurrency, formatDate, segmenBadgeClass } from "./helpers";
import * as s from "./style";
import { OrderStatusBadge } from "./OrdersTable";

interface Props {
  order: GudangOrder | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: Props) {
  if (!order) return null;
  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>{order.id}</div>
            <div className={s.modalSubtitle}>
              {order.customer.name} · {formatDate(order.createdAt)}
            </div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.confirmIcon}>
          <span className={`${s.statusDot} ${order.status === "confirmed" ? "bg-blue-400" : order.status === "processing" ? "bg-yellow-400" : "bg-success"} w-3 h-3`} />
        </div>
        <div className={s.confirmTitle}>Pesanan {order.id}</div>
        <div className="flex justify-center mb-6">
          <OrderStatusBadge status={order.status} />
          <span className={`${s.segmenBadge} ${segmenBadgeClass(order.segmen)} ml-2`}>
            {order.segmen === "proyek" ? "Proyek" : order.segmen === "mixed" ? "Campuran" : "Eceran"}
          </span>
        </div>

        <div className={s.infoRow}>
          <span className={s.infoLabel}>Pelanggan</span>
          <span className={s.infoValue}>{order.customer.name}</span>
        </div>
        {order.customer.phone && (
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Telepon</span>
            <span className={s.infoValue}>{order.customer.phone}</span>
          </div>
        )}
        <div className={s.infoRow}>
          <span className={s.infoLabel}>Alamat</span>
          <span className={s.infoValue}>{order.customer.address}</span>
        </div>
        <div className={s.infoRow}>
          <span className={s.infoLabel}>Tanggal</span>
          <span className={s.infoValue}>{formatDate(order.createdAt)}</span>
        </div>

        <div className={s.totalRow}>
          <span className={s.totalLabel}>Jumlah Item</span>
          <span className={s.totalValue}>{order.items.length}</span>
        </div>

        <div className={s.infoRow} style={{ textTransform: "none" }}>
          <span className={s.infoLabel}>Item Pesanan</span>
          <span className={s.infoValue} />
        </div>
        {order.items.map((item) => (
          <div key={item.productId} className={s.itemCard}>
            <div className={s.itemTitle}>{item.title}</div>
            <div className={s.itemQty}>
              {item.quantity} × {formatCurrency(item.unitPrice)}
            </div>
            <div className={s.itemSubtotal}>{formatCurrency(item.subtotal)}</div>
          </div>
        ))}

        <div className={s.totalRow}>
          <span className={s.totalLabel}>Total</span>
          <span className={s.totalValue}>{formatCurrency(order.total)}</span>
        </div>

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
