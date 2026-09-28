import type { FieldDelivery } from "../types";
import { formatTanggal, sisaItem, STATUS_LABELS, statusBadgeClass, statusDotClass } from "./helpers";
import * as s from "./style";

interface Props {
  delivery: FieldDelivery | null;
  onClose: () => void;
}

export function FieldDeliveryDetailModal({ delivery, onClose }: Props) {
  if (!delivery) return null;
  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>{delivery.id}</div>
            <div className={s.modalSubtitle}>
              {delivery.kodeProduksi} · {delivery.namaKontraktor}
            </div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.confirmIcon}>
          <span className={`${s.statusDot} ${statusDotClass(delivery.status)} w-3 h-3`} />
        </div>
        <div className={s.confirmTitle}>Surat Jalan {delivery.id}</div>
        <div className="flex justify-center mb-6">
          <span className={`${s.statusBadge} ${statusBadgeClass(delivery.status)}`}>
            <span className={`${s.statusDot} ${statusDotClass(delivery.status)}`} />
            {STATUS_LABELS[delivery.status]}
          </span>
        </div>

        <div className={s.infoRow}>
          <span className={s.infoLabel}>Kode Produksi</span>
          <span className={s.infoValue}>{delivery.kodeProduksi}</span>
        </div>
        <div className={s.infoRow}>
          <span className={s.infoLabel}>Kontraktor</span>
          <span className={s.infoValue}>{delivery.namaKontraktor}</span>
        </div>
        {delivery.telepon && (
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Telepon</span>
            <span className={s.infoValue}>{delivery.telepon}</span>
          </div>
        )}
        <div className={s.infoRow}>
          <span className={s.infoLabel}>Alamat Proyek</span>
          <span className={s.infoValue}>{delivery.alamatProyek}</span>
        </div>
        <div className={s.infoRow}>
          <span className={s.infoLabel}>Tanggal Terakhir Kirim</span>
          <span className={s.infoValue}>{formatTanggal(delivery.tanggalKirim)}</span>
        </div>
        {delivery.armada && (
          <div className="mt-4 rounded-lg border border-outline/20 bg-surface-variant/40 px-4 py-3">
            <div className={s.infoLabel}>Armada</div>
            <div className="text-xs text-on-surface font-bold mt-1">
              {delivery.armada.namaSopir} · {delivery.armada.platNomor}
            </div>
            <div className={s.produksiSub}>{delivery.armada.jenisArmada}</div>
          </div>
        )}

        <div className={s.totalRow}>
          <span className={s.totalLabel}>Rincian Barang</span>
          <span className={s.totalValue}>{delivery.items.length} item</span>
        </div>
        {delivery.items.map((item) => (
          <div key={item.id} className={s.itemCard}>
            <div className={s.itemTitle}>{item.namaBarang}</div>
            <div className={s.itemQty}>
              Pesan {item.kuantitas} {item.satuan} · Terkirim {item.kuantitasTerkirim} · Sisa{" "}
              {sisaItem(item)}
            </div>
            {item.spesifikasi && <div className={s.itemQty}>{item.spesifikasi}</div>}
          </div>
        ))}

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}