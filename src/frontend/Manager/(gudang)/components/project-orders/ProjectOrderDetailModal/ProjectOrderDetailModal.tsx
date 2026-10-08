import type { ProjectOrder } from "../shared/types";
import { formatDate, itemLabel } from "../shared/helpers";
import * as s from "../shared/style";
import { ProjectOrderStatusBadge } from "../ProjectOrdersTable/ProjectOrdersTable";

interface Props {
  order: ProjectOrder | null;
  onClose: () => void;
}

export function ProjectOrderDetailModal({ order, onClose }: Props) {
  if (!order) return null;
  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>{order.id}</div>
            <div className={s.modalSubtitle}>
              {order.pelanggan} · {formatDate(order.createdAt)}
            </div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.confirmIcon}>
          <span className="material-symbols-outlined text-tertiary">apartment</span>
        </div>
        <div className={s.confirmTitle}>{order.namaProyek}</div>
        <div className="flex justify-center mb-6">
          <ProjectOrderStatusBadge status={order.status} />
        </div>

        <div className={s.infoRow}>
          <span className={s.infoLabel}>Proyek</span>
          <span className={s.infoValue}>{order.namaProyek}</span>
        </div>
        <div className={s.infoRow}>
          <span className={s.infoLabel}>Pelanggan</span>
          <span className={s.infoValue}>{order.pelanggan}</span>
        </div>
        {order.perusahaan && (
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Perusahaan</span>
            <span className={s.infoValue}>{order.perusahaan}</span>
          </div>
        )}
        {order.telepon && (
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Telepon</span>
            <span className={s.infoValue}>{order.telepon}</span>
          </div>
        )}
        <div className={s.infoRow}>
          <span className={s.infoLabel}>Tanggal Pesan</span>
          <span className={s.infoValue}>{formatDate(order.createdAt)}</span>
        </div>
        {order.catatan && (
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Catatan</span>
            <span className={s.infoValue}>{order.catatan}</span>
          </div>
        )}

        <div className={s.infoRow} style={{ textTransform: "none" }}>
          <span className={s.infoLabel}>Barang Proyek</span>
          <span className={s.infoValue} />
        </div>
        {order.items.map((item) => (
          <div key={item.gudangItemId} className={s.itemCard}>
            <div className={s.itemTitle}>{item.sku}</div>
            <div className={s.itemQty}>{itemLabel(item)}</div>
            <div className={s.itemSubtotal}>
              {item.quantity} {item.satuan}
            </div>
          </div>
        ))}

        <div className={s.totalRow}>
          <span className={s.totalLabel}>Total Barang</span>
          <span className={s.totalValue}>{order.totalQuantity} unit</span>
        </div>

        {order.status === "diproses" && order.processedAt && (
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Diproses</span>
            <span className={s.infoValue}>{formatDate(order.processedAt)}</span>
          </div>
        )}
        {order.status === "selesai" && order.completedAt && (
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Selesai</span>
            <span className={s.infoValue}>{formatDate(order.completedAt)}</span>
          </div>
        )}

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
