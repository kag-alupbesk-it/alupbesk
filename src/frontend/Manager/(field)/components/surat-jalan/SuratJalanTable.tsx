"use client";

import type { FieldDelivery } from "../types";
import { STATUS_LABELS, statusBadgeClass, statusDotClass, totalKuantitas, totalTerkirim } from "../antrean/helpers";
import { formatTanggal } from "../antrean/helpers";
import * as s from "./style";

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

export function SuratJalanTable({ deliveries, loading, onSelect, onOpenDetail }: Props) {
  if (loading) return <div className={`${s.tableCard} ${s.emptyCell}`}>Memuat...</div>;

  return (
    <div className={s.tableCard}>
      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th className={s.th}>Kode Produksi</th>
              <th className={s.th}>Kontraktor</th>
              <th className={s.thHiddenSm}>Alamat Proyek</th>
              <th className={s.thRight}>Kuantitas</th>
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
            {deliveries.map((delivery) => {
              const sisa = totalKuantitas(delivery) - totalTerkirim(delivery);
              const dapatForm = delivery.status !== "selesai-kirim" && sisa > 0;
              return (
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
                    {dapatForm ? (
                      <div className={s.aksiWrapper}>
                        <button className={`${s.actionButton} ${s.formButton}`} onClick={() => onSelect(delivery)}>
                          Buat Surat Jalan
                        </button>
                      </div>
                    ) : (
                      <span className={s.doneBadge}>Selesai</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}