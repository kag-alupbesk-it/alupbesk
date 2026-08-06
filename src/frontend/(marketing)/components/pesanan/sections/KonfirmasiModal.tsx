"use client";

import * as s from "../style";
import type { MarketingOrder } from "@/backend/modules/marketing";
import { formatCurrency } from "./helpers";

interface KonfirmasiModalProps {
  isOpen: boolean;
  order: MarketingOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function KonfirmasiModal({ isOpen, order, onClose, onConfirm }: KonfirmasiModalProps) {
  if (!isOpen || !order) return null;

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const waText = encodeURIComponent(
    `Halo ${order.customer.name},\n\nPesanan Anda *${order.id}* telah dikonfirmasi oleh tim marketing kami dan sedang diajukan ke manajer untuk verifikasi.\n\nDetail Pesanan:\n${order.items.map((i) => `- ${i.title} x${i.quantity} = ${formatCurrency(i.subtotal)}`).join("\n")}\nTotal: ${formatCurrency(order.total)}\n\nKami akan mengabari Anda setelah proses verifikasi selesai.\n\nTerima kasih.\nTim ALUPBESK`
  );
  const waUrl = `https://wa.me/${order.customer.phone.replace(/[^0-9]/g, "")}?text=${waText}`;

  return (
    <div className={s.modalOverlay} onClick={handleBackdrop}>
      <div className="bg-primary-container border border-outline/30 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn">
        <div className={s.confirmIcon}>
          <span className={`${s.icon} text-secondary text-3xl`}>how_to_reg</span>
        </div>
        <h4 className={s.confirmTitle}>Konfirmasi Pesanan</h4>
        <p className={s.confirmText}>
          Anda akan mengonfirmasi pesanan <strong>{order.id}</strong> dari <strong>{order.customer.name}</strong> dan mengajukannya ke manajer untuk verifikasi stok &amp; harga.
        </p>

        <div className={s.infoRow}><span className={s.infoLabel}>No. Telepon</span><span className={s.infoValue}>{order.customer.phone}</span></div>
        <div className={s.infoRow}><span className={s.infoLabel}>Total</span><span className={s.infoValue}>{formatCurrency(order.total)}</span></div>

        <div className="mt-4 p-3 bg-surface-variant/30 rounded-xl border border-outline/10">
          <p className="text-xs text-on-surface-variant mb-2">Notifikasi WhatsApp akan dikirim ke pelanggan:</p>
          <p className="text-[10px] text-on-surface-variant leading-relaxed break-all">{waUrl}</p>
        </div>

        <div className={`${s.actionsWrapper} mt-4 pt-4`}>
          <button onClick={onClose} className={s.secondaryButton}>Batal</button>
          <button onClick={onConfirm} className={s.primaryButton}>
            <span className={s.icon}>send</span>
            Konfirmasi &amp; Kirim Notifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
