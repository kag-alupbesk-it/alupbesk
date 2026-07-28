"use client";

import type { GudangItem } from "@/services/gudang";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: GudangItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

// Modal konfirmasi hapus dipisah dari form modal agar concern-nya jelas:
// form modal untuk data entry, delete modal khusus untuk aksi destruktif.
// Ini juga memudahkan penambahan animasi atau logika soft-delete di masa mendatang.
export function DeleteConfirmModal({ isOpen, item, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen || !item) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-primary-container border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full text-on-surface">
        {/* Icon peringatan */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 border border-error/20 mx-auto mb-4">
          <span className="material-symbols-outlined text-error text-[24px]">delete_forever</span>
        </div>

        {/* Judul & Pesan */}
        <div className="text-center mb-6">
          <h2 className="text-base font-extrabold text-on-surface uppercase tracking-tight font-headline mb-2">
            Hapus Data Barang?
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Kamu akan menghapus barang berikut dari inventaris gudang:
          </p>

          {/* Detail barang yang akan dihapus — ditampilkan agar user tidak salah hapus */}
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-secondary">{item.sku}</span>
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[9px] font-bold text-on-surface-variant border border-white/10 uppercase">
                {item.merek}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant capitalize">
              {item.jenisBarang} · {item.warna} · {item.seksiLokasi}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              Stok saat ini: <span className="font-bold text-on-surface">{item.stok} pcs</span>
            </p>
          </div>

          <p className="text-[10px] text-error/70 mt-3">
            Aksi ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-all border border-white/10"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(item.id)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-error hover:brightness-110 text-white text-sm font-bold transition-all shadow-lg shadow-error/20"
          >
            Hapus Barang
          </button>
        </div>
      </div>
    </div>
  );
}