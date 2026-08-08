import type { ProjectOrder, ProjectOrderAction } from "./types";
import { STATUS_LABELS, itemLabel, statusBadgeClass, statusDotClass } from "./helpers";
import * as s from "./style";

interface Props {
  orders: ProjectOrder[];
  onOpenDetail: (order: ProjectOrder) => void;
  onAction: (order: ProjectOrder, action: ProjectOrderAction) => void;
  onDelete: (order: ProjectOrder) => void;
}

export function ProjectOrderStatusBadge({ status }: { status: ProjectOrder["status"] }) {
  return (
    <span className={`${s.statusBadge} ${statusBadgeClass(status)}`}>
      <span className={`${s.statusDot} ${statusDotClass(status)}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function itemSummary(order: ProjectOrder): string {
  const first = order.items[0];
  const suffix = order.items.length > 1 ? ` +${order.items.length - 1} lainnya` : "";
  return `${itemLabel(first)}${suffix}`;
}

export function ProjectOrdersTable({ orders, onOpenDetail, onAction, onDelete }: Props) {
  return (
    <div className={s.tableCard}>
      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th className={s.th}>ID Pesanan</th>
              <th className={s.th}>Proyek</th>
              <th className={s.thHiddenSm}>Pelanggan</th>
              <th className={s.thHiddenSm}>Barang</th>
              <th className={s.th}>Status</th>
              <th className={s.thRight}>Jumlah</th>
              <th className={s.thRight}>Aksi</th>
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className={s.emptyCell}>
                  Tidak ada pesanan proyek.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className={s.row}>
                <td className={s.td}>
                  <button className={s.orderIdText} onClick={() => onOpenDetail(order)}>
                    {order.id}
                  </button>
                  {order.requestId && <div className={s.requestBadge}>Custom</div>}
                </td>
                <td className={s.td}>
                  <div className={s.proyekName}>{order.namaProyek}</div>
                  {order.perusahaan && <div className={s.proyekSub}>{order.perusahaan}</div>}
                </td>
                <td className={s.tdHiddenSm}>
                  <span className={s.proyekSub}>{order.pelanggan}</span>
                </td>
                <td className={s.tdHiddenSm}>
                  <span className={s.itemSummary}>{itemSummary(order)}</span>
                </td>
                <td className={s.td}>
                  <ProjectOrderStatusBadge status={order.status} />
                </td>
                <td className={s.tdRight}>
                  <span className={s.totalText}>{order.totalQuantity} unit</span>
                </td>
                <td className={s.tdRight}>
                  {order.status === "diajukan" && (
                    <div className={s.aksiWrapper}>
                      <button className={`${s.actionButton} ${s.processButton}`} onClick={() => onAction(order, "proses")}>
                        Proses
                      </button>
                      <button className={`${s.actionButton} ${s.deleteButton}`} onClick={() => onDelete(order)}>
                        Hapus
                      </button>
                    </div>
                  )}
                  {order.status === "diproses" && (
                    <div className={s.aksiWrapper}>
                      <button className={`${s.actionButton} ${s.completeButton}`} onClick={() => onAction(order, "selesai")}>
                        Selesai
                      </button>
                    </div>
                  )}
                  {order.status === "selesai" && <span className={s.doneBadge}>Selesai</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
