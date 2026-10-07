import Link from "next/link";
import type { FieldDelivery } from "../../types/types";
import { STATUS_LABELS, statusBadgeClass, statusDotClass, totalKuantitas, totalTerkirim } from "../helpers/helpers";
import * as s from "../style/style";

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

function DeliveryAction({ delivery, full = false }: { delivery: FieldDelivery; full?: boolean }) {
  const extra = full ? " w-full" : "";
  if (delivery.status === "siap-kirim") {
    return (
      <Link href="/field/surat-jalan" className={`${s.actionButton} ${s.processButton}${extra}`}>
        <span className={s.actionIcon}>description</span>
        Surat Jalan
      </Link>
    );
  }
  if (delivery.status === "dalam-pengiriman") {
    return (
      <Link href="/field/pod" className={`${s.actionButton} ${s.podButton}${extra}`}>
        <span className={s.actionIcon}>task_alt</span>
        Bukti Terima
      </Link>
    );
  }
  return (
    <span className={`${s.doneBadge}${extra}`}>
      <span className="material-symbols-outlined text-[14px] leading-none">check_circle</span>
      Selesai
    </span>
  );
}

export function FieldAntrianTable({ deliveries, onOpenDetail }: Props) {
  return (
    <>
      <div className={s.mobileList}>
        {deliveries.length === 0 && (
          <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
            Tidak ada data pengiriman.
          </div>
        )}
        {deliveries.map((delivery) => {
          const total = totalKuantitas(delivery);
          const terkirim = totalTerkirim(delivery);
          const pct = total === 0 ? 0 : Math.round((terkirim / total) * 100);
          return (
            <div key={delivery.id} className={s.card}>
              <div className={s.cardTop}>
                <button className="min-w-0 text-left" onClick={() => onOpenDetail(delivery)}>
                  <div className={s.orderIdText}>{delivery.id}</div>
                  <div className={s.produksiText}>{delivery.kodeProduksi}</div>
                </button>
                <FieldStatusBadge status={delivery.status} />
              </div>
              <div className={s.cardInfo}>
                <div className="truncate">
                  {delivery.namaKontraktor}
                  {delivery.armada?.namaSopir ? ` · Sopir: ${delivery.armada.namaSopir}` : ""}
                </div>
                <div className="truncate">{delivery.alamatProyek}</div>
              </div>
              <div className={s.cardMeta}>
                <span className={s.quantityText}>{total}</span>
                <span className={`${s.produksiSub} whitespace-nowrap`}>
                  {terkirim}/{total} · {pct}%
                </span>
              </div>
              <div className={s.itemProgress}>
                <div className={s.itemProgressFill} style={{ width: `${pct}%` }} />
              </div>
              <div className={s.cardActions}>
                <DeliveryAction delivery={delivery} full />
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
                <th className={s.thRight}>Jumlah Item</th>
                <th className={s.th}>Status</th>
                <th className={s.thRight}>Aksi</th>
              </tr>
            </thead>
            <tbody className={s.tbody}>
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className={s.emptyCell}>
                    Tidak ada data pengiriman.
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
                      <DeliveryAction delivery={delivery} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
