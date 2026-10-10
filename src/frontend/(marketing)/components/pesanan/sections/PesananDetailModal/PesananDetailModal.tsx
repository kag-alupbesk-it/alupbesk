"use client";

import type { MarketingOrder } from "@/backend/modules/marketing";
import * as s from "../../style/style";
import { statusColor, statusBg, formatCurrency, formatDate } from "../helpers/helpers";
import { STATUS_LABELS } from "../data/data";
import { useReadOnly } from "@/frontend/shared/access/AccessModeProvider";

interface PesananDetailModalProps {
  isOpen: boolean;
  order: MarketingOrder | null;
  onClose: () => void;
  onConfirm: (order: MarketingOrder) => void;
}

export default function PesananDetailModal({ isOpen, order, onClose, onConfirm }: PesananDetailModalProps) {
  const readOnly = useReadOnly();

  if (!isOpen || !order) return null;

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const canConfirm = order.status === "pending";
  const isPendingManager = order.status === "submitted_to_manager";
  const isRejected = order.status === "rejected_by_manager";

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className={s.modalTitle}>{order.id}</h4>
            <p className={s.modalSubtitle}>Detail pesanan pelanggan</p>
          </div>
          <button onClick={onClose} className={s.modalCloseButton}>
            <span className={`${s.icon} text-xl`}>close</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className={`${s.statusBadge} ${statusBg(order.status)}`}>
            <span className={`${s.statusDot} ${statusColor(order.status)}`} />
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {isRejected && (
            <span className="px-2 py-0.5 bg-red-400/10 text-red-400 text-[10px] font-bold rounded-pill">
              Lihat Alasan
            </span>
          )}
        </div>

        <div className={s.modalSection}>
          <h5 className={s.modalSectionTitle}>Data Pelanggan</h5>
          <div className={s.infoRow}><span className={s.infoLabel}>Nama</span><span className={s.infoValue}>{order.customer.name}</span></div>
          <div className={s.infoRow}><span className={s.infoLabel}>Telepon</span><span className={s.infoValue}>{order.customer.phone}</span></div>
          {order.customer.email && <div className={s.infoRow}><span className={s.infoLabel}>Email</span><span className={s.infoValue}>{order.customer.email}</span></div>}
          <div className={s.infoRow}><span className={s.infoLabel}>Alamat</span><span className={s.infoValue}>{order.customer.address}</span></div>
          {order.customer.note && <div className={s.infoRow}><span className={s.infoLabel}>Catatan</span><span className={s.infoValue}>{order.customer.note}</span></div>}
        </div>

        <div className={s.modalSection}>
          <h5 className={s.modalSectionTitle}>Pesanan ({order.items.length} item)</h5>
          {order.items.map((item, i) => (
            <div key={i} className={s.itemCard}>
              <div className={s.itemHeader}>
                <div>
                  <p className={s.itemTitle}>{item.title}</p>
                  <p className={s.itemQty}>{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                </div>
                <span className={s.itemSubtotal}>{formatCurrency(item.subtotal)}</span>
              </div>
              {item.variants && Object.keys(item.variants).length > 0 && (
                <div className={s.itemVariants}>
                  {Object.entries(item.variants).map(([key, val]) => (
                    <span key={key} className={s.variantChip}>{key}: {val}</span>
                  ))}
                </div>
              )}
              {item.note && <p className="text-xs text-on-surface-variant mt-2 italic">Catatan: {item.note}</p>}
            </div>
          ))}
        </div>

        <div className={s.totalRow}>
          <span className={s.totalLabel}>Total Pesanan</span>
          <span className={s.totalValue}>{formatCurrency(order.total)}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-4">
          <span>Dibuat: {formatDate(order.createdAt)}</span>
          {order.marketingConfirmedAt && <span>| Konfirmasi: {formatDate(order.marketingConfirmedAt)}</span>}
        </div>

        {isRejected && order.managerRejectionReason && (
          <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Alasan Penolakan Manager</p>
            <p className="text-sm text-on-surface">{order.managerRejectionReason}</p>
          </div>
        )}

        <div className={s.actionsWrapper}>
          {canConfirm && (
            <>
              <button onClick={onClose} className={s.secondaryButton}>Tutup</button>
              {!readOnly && (
                <button onClick={() => onConfirm(order)} className={s.primaryButton}>
                  <span className={s.icon}>check_circle</span>
                  Konfirmasi &amp; Ajukan ke Manager
                </button>
              )}
            </>
          )}
          {(isPendingManager || isRejected) && (
            <button onClick={onClose} className={s.secondaryButton}>Tutup</button>
          )}
        </div>
      </div>
    </div>
  );
}
