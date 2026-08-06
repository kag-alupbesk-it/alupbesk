"use client";

import type { MarketingOrder } from "@/backend/modules/marketing";
import * as s from "../style";

interface TolakModalProps {
  isOpen: boolean;
  order: MarketingOrder | null;
  onClose: () => void;
}

export default function TolakModal({ isOpen, order, onClose }: TolakModalProps) {
  if (!isOpen || !order) return null;

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className="bg-primary-container border border-outline/30 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn">
        <div className="w-16 h-16 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-4">
          <span className={`${s.icon} text-red-400 text-3xl`}>cancel</span>
        </div>
        <h4 className={s.confirmTitle}>Pesanan Ditolak</h4>
        <p className={s.confirmText}>
          Pesanan <strong>{order.id}</strong> dari <strong>{order.customer.name}</strong> ditolak oleh manajer.
        </p>

        <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Alasan Penolakan</p>
          <p className="text-sm text-on-surface">{order.managerRejectionReason ?? "Tidak ada alasan yang diberikan."}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className={s.secondaryButton}>Tutup</button>
          <a
            href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo ${order.customer.name},\n\nMohon maaf, pesanan Anda (${order.id}) belum dapat diproses karena: ${order.managerRejectionReason ?? "stok tidak tersedia"}.\n\nSilakan hubungi kami untuk alternatif produk.\n\nTim ALUPBESK`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={s.primaryButton}
          >
            <span className={s.icon}>whatsapp</span>
            Hubungi Pelanggan
          </a>
        </div>
      </div>
    </div>
  );
}
