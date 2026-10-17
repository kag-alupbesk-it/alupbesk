"use client";

import type { MarketingOrder } from "@/backend/modules/marketing";
import * as s from "../../style/style";
import { statusColor, statusBg, formatCurrency, formatDate, buildOrderTimeline } from "../helpers/helpers";
import { STATUS_LABELS } from "../data/data";

interface PesananDetailModalProps {
  isOpen: boolean;
  order: MarketingOrder | null;
  onClose: () => void;
}

export default function PesananDetailModal({ isOpen, order, onClose }: PesananDetailModalProps) {
  if (!isOpen || !order) return null;

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const isRejected = order.status === "rejected_by_manager";
  const timeline = buildOrderTimeline(order);

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



        <div className={s.modalSection}>
          <h5 className={s.modalSectionTitle}>Riwayat Pesanan</h5>
          <ol className="relative border-l border-outline/30 ml-2 space-y-4">
            {timeline.map((entry, index) => (
              <li key={`${entry.label}-${index}`} className="ml-4">
                <span
                  className={`absolute -left-[5px] w-2.5 h-2.5 rounded-full ${
                    entry.tone === "danger" ? "bg-red-400" : entry.tone === "active" ? "bg-secondary" : "bg-success"
                  }`}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-bold text-on-surface">{entry.label}</p>
                  <span className="text-[11px] text-on-surface-variant">{formatDate(entry.at)}</span>
                </div>
                {entry.detail && <p className="text-xs text-on-surface-variant mt-0.5">{entry.detail}</p>}
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-on-surface-variant mt-3">
            Terakhir diperbarui {formatDate(order.updatedAt)}
          </p>
        </div>

        {isRejected && order.managerRejectionReason && (
          <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Alasan Penolakan Manager</p>
            <p className="text-sm text-on-surface">{order.managerRejectionReason}</p>
          </div>
        )}

        <div className={s.actionsWrapper}>
          <button onClick={onClose} className={s.secondaryButton}>Tutup</button>
        </div>
      </div>
    </div>
  );
}