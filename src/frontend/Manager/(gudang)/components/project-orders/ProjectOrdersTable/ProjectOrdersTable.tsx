import type { ProjectOrder, ProjectOrderAction } from "../types/types";
import { STATUS_LABELS, itemLabel, statusBadgeClass, statusDotClass } from "../helpers/helpers";
import * as s from "../style/style";

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

function ProjectOrderAction({
  order,
  onAction,
  onDelete,
  full = false,
}: {
  order: ProjectOrder;
  onAction: (order: ProjectOrder, action: ProjectOrderAction) => void;
  onDelete: (order: ProjectOrder) => void;
  full?: boolean;
}) {
  const extra = full ? " w-full" : "";
  if (order.status === "diajukan") {
    return (
      <>
        <button className={`${s.actionButton} ${s.processButton}${extra}`} onClick={() => onAction(order, "proses")}>
          Proses
        </button>
        <button className={`${s.actionButton} ${s.deleteButton}${extra}`} onClick={() => onDelete(order)}>
          Hapus
        </button>
      </>
    );
  }
  if (order.status === "diproses") {
    return (
      <button className={`${s.actionButton} ${s.completeButton}${extra}`} onClick={() => onAction(order, "selesai")}>
        Selesai
      </button>
    );
  }
  return <span className={`${s.doneBadge}${extra}`}>Selesai</span>;
}

export function ProjectOrdersTable({ orders, onOpenDetail, onAction, onDelete }: Props) {
  return (
    <>
      <div className={s.mobileList}>
        {orders.length === 0 && (
          <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
            Tidak ada pesanan proyek.
          </div>
        )}
        {orders.map((order) => (
          <div key={order.id} className={s.card}>
            <div className={s.cardTop}>
              <button className="min-w-0 text-left" onClick={() => onOpenDetail(order)}>
                <div className={s.orderIdText}>{order.id}</div>
                <div className={`${s.proyekName} truncate`}>{order.namaProyek}</div>
              </button>
              <ProjectOrderStatusBadge status={order.status} />
            </div>
            <div className={s.cardInfo}>
              {order.requestId && <div className={s.requestBadge}>Custom</div>}
              <div className="truncate">{order.pelanggan}</div>
              {order.perusahaan && <div className="truncate">{order.perusahaan}</div>}
              <div className="truncate">{itemSummary(order)}</div>
            </div>
            <div className={s.cardMeta}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Jumlah</span>
              <span className={s.totalText}>{order.totalQuantity} unit</span>
            </div>
            <div className={`${s.cardActions} flex-col gap-2 sm:flex-row`}>
              <ProjectOrderAction order={order} onAction={onAction} onDelete={onDelete} full />
            </div>
          </div>
        ))}
      </div>

      <div className={`${s.tableCard} ${s.desktopOnly}`}>
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
                    <ProjectOrderAction order={order} onAction={onAction} onDelete={onDelete} />
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
