"use client";

import type { FieldDelivery } from "../../types";
import { STATUS_LABELS, statusBadgeClass, statusDotClass, totalKuantitas, totalTerkirim } from "../../antrean/shared/helpers";
import { formatTanggal } from "../../antrean/shared/helpers";
import * as s from "../shared/style";

interface Props {
  deliveries: FieldDelivery[];
  loading: boolean;
  onSelect: (delivery: FieldDelivery) => void;
  onOpenDetail: (delivery: FieldDelivery) => void;
}

export function FieldDeliveryRow({ delivery }: { delivery: FieldDelivery }) {
  const total = totalKuantitas(delivery);
  const terkirim = totalTerkirim(delivery);
  const sisa = total - terkirim;
  return (
    <div className={s.produksiSub}>
      Total {total} · Terkirim {terkirim} · <span className="text-secondary font-bold">Sisa {sisa}</span>
    </div>
  );
}

function RowAction({
  delivery,
  onSelect,
  full = false,
}: {
  delivery: FieldDelivery;
  onSelect: (delivery: FieldDelivery) => void;
  full?: boolean;
}) {
  const sisa = totalKuantitas(delivery) - totalTerkirim(delivery);
  const dapatForm = delivery.status !== "selesai-kirim" && sisa > 0;
  const extra = full ? " w-full" : "";

  if (!dapatForm) {
    return (
      <span className={`${s.doneBadge}${extra}`}>
        <span className="material-symbols-outlined text-[14px] leading-none">check_circle</span>
        Selesai
      </span>
    );
  }

  return (
    <button className={`${s.actionButton} ${s.formButton}${extra}`} onClick={() => onSelect(delivery)}>
      <span className={s.actionIcon}>note_add</span>
      Buat Surat Jalan
    </button>
  );
}

export function SuratJalanTable({ deliveries, loading, onSelect, onOpenDetail }: Props) {
  if (loading) return <div className={`${s.tableCard} ${s.emptyCell}`}>Memuat...</div>;

  return (
    <>
      <div className={s.mobileList}>
        {deliveries.length === 0 && (
          <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
            Tidak ada data surat jalan.
          </div>
        )}
        {deliveries.map((delivery) => {
          const total = totalKuantitas(delivery);
          const terkirim = totalTerkirim(delivery);
          const sisa = total - terkirim;
          return (
            <div key={delivery.id} className={s.card}>
              <div className={s.cardTop}>
                <button className="min-w-0 text-left" onClick={() => onOpenDetail(delivery)}>
                  <div className={s.orderIdText}>{delivery.id}</div>
                  <div className={s.produksiText}>{delivery.kodeProduksi}</div>
                </button>
                <span className={`${s.statusBadge} ${statusBadgeClass(delivery.status)}`}>
                  <span className={`${s.statusDot} ${statusDotClass(delivery.status)}`} />
                  {STATUS_LABELS[delivery.status]}
                </span>
              </div>
              <div className={s.cardInfo}>
                <div className="truncate">{delivery.namaKontraktor}</div>
                <div className="truncate">{delivery.alamatProyek}</div>
              </div>
              <div className={s.cardMeta}>
                <span className={s.quantityText}>{total}</span>
                <span className={s.produksiSub}>
                  Terkirim {terkirim} · <span className="text-secondary font-bold">Sisa {sisa}</span>
                </span>
              </div>
              <div className={s.cardActions}>
                <RowAction delivery={delivery} onSelect={onSelect} full />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${s.tableCard} ${s.desktopOnly}`}>
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead className={s.tableHead}>
              <tr>
                <th className={s.th}>Kode Produksi</th>
                <th className={s.th}>Kontraktor</th>
                <th className={s.thHiddenSm}>Alamat Proyek</th>
                <th className={s.thRight}>Jumlah</th>
                <th className={s.th}>Status</th>
                <th className={s.thRight}>Aksi</th>
              </tr>
            </thead>
            <tbody className={s.tbody}>
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className={s.emptyCell}>
                    Tidak ada data surat jalan.
                  </td>
                </tr>
              )}
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className={s.row}>
                  <td className={s.td}>
                    <button className={s.orderIdText} onClick={() => onOpenDetail(delivery)}>
                      {delivery.id}
                    </button>
                    <div className={s.produksiText}>{delivery.kodeProduksi}</div>
                  </td>
                  <td className={s.td}>
                    <span className="text-on-surface font-semibold text-xs lg:text-sm">{delivery.namaKontraktor}</span>
                    <div className={s.produksiSub}>{formatTanggal(delivery.tanggalKirim)}</div>
                  </td>
                  <td className={s.tdHiddenSm}>
                    <span className={s.produksiSub}>{delivery.alamatProyek}</span>
                  </td>
                  <td className={s.tdRight}>
                    <span className={s.quantityText}>{totalKuantitas(delivery)}</span>
                    <FieldDeliveryRow delivery={delivery} />
                  </td>
                  <td className={s.td}>
                    <span className={`${s.statusBadge} ${statusBadgeClass(delivery.status)}`}>
                      <span className={`${s.statusDot} ${statusDotClass(delivery.status)}`} />
                      {STATUS_LABELS[delivery.status]}
                    </span>
                  </td>
                  <td className={s.tdRight}>
                    <div className={s.aksiWrapper}>
                      <RowAction delivery={delivery} onSelect={onSelect} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
