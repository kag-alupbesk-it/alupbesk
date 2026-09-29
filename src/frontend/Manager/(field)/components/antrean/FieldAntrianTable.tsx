import Link from "next/link";
import type { FieldDelivery } from "../types";
import { STATUS_LABELS, statusBadgeClass, statusDotClass, totalKuantitas, totalTerkirim } from "./helpers";
import * as s from "./style";

interface Props {
  deliveries: FieldDelivery[];
  onOpenDetail: (delivery: FieldDelivery) => void;
}

export function FieldStatusBadge({ status }: { status: FieldDelivery["status"] }) {
  return (
    <span className={`${s.statusBadge} ${statusBadgeClass(status)}`}>
      <span className={`${s.statusDot} ${statusDotClass(status)}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function FieldAntrianTable({ deliveries, onOpenDetail }: Props) {
  return (
    <div className={s.tableCard}>
      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th className={s.th}>Kode Produksi</th>
              <th className={s.th}>Kontraktor</th>
              <th className={s.thHiddenSm}>Alamat Proyek</th>
              <th className={s.thRight}>Kuantitas Item</th>
              <th className={s.th}>Status</th>
              <th className={s.thRight}>Aksi</th>
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {deliveries.length === 0 && (
              <tr>
                <td colSpan={6} className={s.emptyCell}>
                  Tidak ada antrean pengiriman.
                </td>
              </tr>
            )}
            {deliveries.map((delivery) => {
              const total = totalKuantitas(delivery);
              const terkirim = totalTerkirim(delivery);
              const pct = total === 0 ? 0 : Math.round((terkirim / total) * 100);
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
                    {delivery.armada?.namaSopir && (
                      <div className={s.produksiSub}>Sopir: {delivery.armada.namaSopir}</div>
                    )}
                  </td>
                  <td className={s.tdHiddenSm}>
                    <span className={s.produksiSub}>{delivery.alamatProyek}</span>
                  </td>
                  <td className={s.tdRight}>
                    <span className={s.quantityText}>{total}</span>
                    <div className={`${s.produksiSub} whitespace-nowrap`}>
                      {terkirim}/{total} · {pct}%
                    </div>
                    <div className={s.itemProgress}>
                      <div className={s.itemProgressFill} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className={s.td}>
                    <FieldStatusBadge status={delivery.status} />
                  </td>
                  <td className={s.tdRight}>
                    {delivery.status === "siap-kirim" && (
                      <Link
                        href="/field/surat-jalan"
                        className={`${s.actionButton} ${s.processButton}`}
                      >
                        Surat Jalan
                      </Link>
                    )}
                    {delivery.status === "dalam-pengiriman" && (
                      <Link href="/field/pod" className={`${s.actionButton} ${s.podButton}`}>
                        POD
                      </Link>
                    )}
                    {delivery.status === "selesai-kirim" && (
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