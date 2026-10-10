"use client";

import type { MarketingOrder } from "@/backend/modules/marketing";
import * as s from "../../style/style";
import { statusColor, statusBg, formatCurrency, formatDate, isNewOrder } from "../helpers/helpers";
import { STATUS_LABELS } from "../data/data";

interface PesananTableProps {
  orders: MarketingOrder[];
  onSelect: (order: MarketingOrder) => void;
}

export default function PesananTable({ orders, onSelect }: PesananTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        <span className={`${s.icon} text-4xl mb-4 block`}>inbox</span>
        <p className="font-bold">Belum ada pesanan</p>
        <p className="text-xs mt-1">Pesanan dari website akan muncul di sini</p>
      </div>
    );
  }

  return (
    <>
      <div className={s.mobileList}>
        {orders.map((order) => (
          <div key={order.id} className={s.card}>
            <div className={s.cardTop}>
              <button className="min-w-0 text-left" onClick={() => onSelect(order)}>
                <span className="font-bold text-on-surface text-sm">
                  {order.id}
                  {isNewOrder(order) && <span className={s.newBadge}>Baru</span>}
                </span>
              </button>
              <span className="min-w-0 max-w-[45%] shrink-0">
                <span className={`${s.statusBadge} ${statusBg(order.status)}`}>
                  <span className={`${s.statusDot} ${statusColor(order.status)}`} />
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </span>
            </div>
            <div className={s.cardInfo}>
              <div className="font-bold text-on-surface text-sm">{order.customer.name}</div>
              <div className="truncate">{order.customer.phone}</div>
              <div>{formatDate(order.createdAt)}</div>
            </div>
            <div className={s.cardMeta}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</span>
              <span className="font-bold text-secondary text-sm">{formatCurrency(order.total)}</span>
            </div>
            <div className={s.cardActions}>
              <button onClick={() => onSelect(order)} className={`${s.secondaryButton} w-full`}>
                Lihat Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={`${s.tableContainer} ${s.desktopOnly}`}>
        <table className={s.table}>
          <thead>
            <tr className={s.tableHeaderRow}>
              <th className={s.tableHeaderCell}>ID Pesanan</th>
              <th className={s.tableHeaderCell}>Pelanggan</th>
              <th className={s.tableHeaderCell}>Tanggal</th>
              <th className={s.tableHeaderCell}>Status</th>
              <th className={s.tableHeaderCellRight}>Total</th>
            </tr>
          </thead>
          <tbody className={s.tableBody}>
            {orders.map((order) => (
              <tr key={order.id} className={s.tableRow} onClick={() => onSelect(order)}>
                <td className={s.tableCell}>
                  <span className="font-bold text-on-surface text-sm">
                    {order.id}
                    {isNewOrder(order) && <span className={s.newBadge}>Baru</span>}
                  </span>
                </td>
                <td className={s.tableCell}>
                  <p className="font-bold text-on-surface text-sm">{order.customer.name}</p>
                  <p className="text-xs text-on-surface-variant">{order.customer.phone}</p>
                </td>
                <td className={s.tableCell}>
                  <span className="text-sm text-on-surface-variant">{formatDate(order.createdAt)}</span>
                </td>
                <td className={s.tableCell}>
                  <span className={`${s.statusBadge} ${statusBg(order.status)}`}>
                    <span className={`${s.statusDot} ${statusColor(order.status)}`} />
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className={s.tableCellRight}>
                  <span className="font-bold text-secondary text-sm">{formatCurrency(order.total)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}