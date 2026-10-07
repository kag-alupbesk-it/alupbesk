import type { GudangOrder, OrderAction } from "../types/types";
import { formatCurrency, segmenBadgeClass, statusBadgeClass, statusDotClass } from "../helpers/helpers";
import * as s from "../style/style";

interface Props {
  orders: GudangOrder[];
  onOpenDetail: (order: GudangOrder) => void;
  onAction: (order: GudangOrder, action: OrderAction) => void;
}

export function OrderStatusBadge({ status }: { status: GudangOrder["status"] }) {
  return (
    <span className={`${s.statusBadge} ${statusBadgeClass(status)}`}>
      <span className={`${s.statusDot} ${statusDotClass(status)}`} />
      {status === "confirmed" ? "Menunggu Proses" : status === "processing" ? "Dalam Proses" : "Selesai"}
    </span>
  );
}

function productSummary(order: GudangOrder): string {
  const first = order.items[0];
  const suffix = order.items.length > 1 ? ` +${order.items.length - 1} lainnya` : "";
  return `${first?.title ?? "-"}${suffix}`;
}

function OrderAction({
  order,
  onAction,
  full = false,
}: {
  order: GudangOrder;
  onAction: (order: GudangOrder, action: OrderAction) => void;
  full?: boolean;
}) {
  const extra = full ? " w-full" : "";
  if (order.status === "confirmed") {
    return (
      <button className={`${s.actionButton} ${s.processButton}${extra}`} onClick={() => onAction(order, "process")}>
        Proses
      </button>
    );
  }
  if (order.status === "processing") {
    return (
      <button className={`${s.actionButton} ${s.completeButton}${extra}`} onClick={() => onAction(order, "complete")}>
        Selesai
      </button>
    );
  }
  return <span className={`${s.doneBadge}${extra}`}>Selesai</span>;
}

export function OrdersTable({ orders, onOpenDetail, onAction }: Props) {
  return (
    <>
      <div className={s.mobileList}>
        {orders.length === 0 && (
          <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
            Tidak ada pesanan.
          </div>
        )}
        {orders.map((order) => (
          <div key={order.id} className={s.card}>
            <div className={s.cardTop}>
              <button className="min-w-0 text-left" onClick={() => onOpenDetail(order)}>
                <div className={s.orderIdText}>{order.id}</div>
              </button>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className={s.cardInfo}>
              <div className="truncate font-semibold text-on-surface">{order.customer.name}</div>
              <div className="truncate">{order.items.length} item</div>
              <div className="truncate">{productSummary(order)}</div>
              <div className={`${s.segmenBadge} ${segmenBadgeClass(order.segmen)}`}>
                {order.segmen === "proyek" ? "Proyek" : order.segmen === "mixed" ? "Campuran" : "Eceran"}
              </div>
            </div>
            <div className={s.cardMeta}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</span>
              <span className={s.totalText}>{formatCurrency(order.total)}</span>
            </div>
            <div className={s.cardActions}>
              <OrderAction order={order} onAction={onAction} full />
            </div>
          </div>
        ))}
      </div>

      <div className={`${s.tableCard} ${s.desktopOnly}`}>
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead className={s.tableHead}>
              <tr>
                <th className={s.th}>ID Order</th>
                <th className={s.th}>Pelanggan</th>
                <th className={s.thHiddenSm}>Produk</th>
                <th className={s.th}>Status</th>
                <th className={s.thRight}>Total</th>
                <th className={s.thRight}>Aksi</th>
              </tr>
            </thead>
            <tbody className={s.tbody}>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className={s.emptyCell}>
                    Tidak ada pesanan.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className={s.row}>
                  <td className={s.td}>
                    <button className={s.orderIdText} onClick={() => onOpenDetail(order)}>
                      {order.id}
                    </button>
                    <div className={`${s.segmenBadge} ${segmenBadgeClass(order.segmen)}`}>
                      {order.segmen === "proyek" ? "Proyek" : order.segmen === "mixed" ? "Campuran" : "Eceran"}
                    </div>
                  </td>
                  <td className={s.td}>
                    <span className="text-on-surface font-semibold text-xs lg:text-sm">{order.customer.name}</span>
                    <div className={s.jumlahBaris}>{order.items.length} item</div>
                  </td>
                  <td className={s.tdHiddenSm}>
                    <span className="text-on-surface text-xs">{productSummary(order)}</span>
                  </td>
                  <td className={s.td}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className={s.tdRight}>
                    <span className={s.totalText}>{formatCurrency(order.total)}</span>
                  </td>
                  <td className={s.tdRight}>
                    <OrderAction order={order} onAction={onAction} />
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
