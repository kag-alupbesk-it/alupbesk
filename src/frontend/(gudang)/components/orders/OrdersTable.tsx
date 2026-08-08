import type { GudangOrder, OrderAction } from "./types";
import { formatCurrency, segmenBadgeClass, statusBadgeClass, statusDotClass } from "./helpers";
import * as s from "./style";

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

export function OrdersTable({ orders, onOpenDetail, onAction }: Props) {
  return (
    <div className={s.tableCard}>
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
                  {order.status === "confirmed" && (
                    <div className={s.aksiWrapper}>
                      <button className={`${s.actionButton} ${s.processButton}`} onClick={() => onAction(order, "process")}>
                        Proses
                      </button>
                    </div>
                  )}
                  {order.status === "processing" && (
                    <div className={s.aksiWrapper}>
                      <button className={`${s.actionButton} ${s.completeButton}`} onClick={() => onAction(order, "complete")}>
                        Selesai
                      </button>
                    </div>
                  )}
                  {order.status === "completed" && <span className={s.doneBadge}>Selesai</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
