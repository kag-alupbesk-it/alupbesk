"use client";

import { useMemo } from "react";
import type {
  GudangInTransactionView,
  GudangOutTransactionView,
} from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";

interface TransactionsTabProps {
  kind: "in" | "out";
  inTransactions: GudangInTransactionView[];
  outTransactions: GudangOutTransactionView[];
  search: string;
  onSearchChange: (value: string) => void;
  readOnly: boolean;
  onAdd: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function TransactionsTab({
  kind,
  inTransactions,
  outTransactions,
  search,
  onSearchChange,
  readOnly,
  onAdd,
}: TransactionsTabProps) {
  const isOut = kind === "out";

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = isOut ? outTransactions : inTransactions;
    if (!query) return source;
    return source.filter((trx) => {
      const haystack = [
        trx.itemName,
        trx.modelNo,
        trx.brand,
        trx.color,
        trx.rackGroup,
        trx.categoryName,
        trx.createdBy,
        ...(isOut
          ? [(trx as GudangOutTransactionView).projectName]
          : []),
      ];
      return haystack.join(" ").toLowerCase().includes(query);
    });
  }, [isOut, inTransactions, outTransactions, search]);

  const totalQuantity = rows.reduce((sum, trx) => sum + trx.quantity, 0);
  const columnCount = isOut ? 11 : 10;

  return (
    <div className={s.tableCard}>
      <div className={s.tableToolbar}>
        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>search</span>
          <input
            className={s.searchInput}
            placeholder={isOut ? "Cari barang, proyek, pengambil..." : "Cari barang, model, penerima..."}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        {!readOnly && (
          <button className={s.primaryButton} onClick={onAdd}>
            <span className={s.buttonIcon}>{isOut ? "outbox" : "move_to_inbox"}</span>
            {isOut ? "Catat Barang Keluar" : "Catat Barang Masuk"}
          </button>
        )}
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th className={s.th}>No</th>
              <th className={s.th}>Tanggal</th>
              <th className={s.th}>Kategori</th>
              <th className={s.th}>Nama Barang</th>
              <th className={s.th}>Merek</th>
              <th className={s.th}>No. Model</th>
              <th className={s.th}>Warna</th>
              <th className={s.th}>Lokasi Rak</th>
              {isOut && <th className={s.th}>Proyek</th>}
              <th className={s.thRight}>{isOut ? "Jumlah Keluar" : "Jumlah Masuk"}</th>
              <th className={s.th}>{isOut ? "Pengambil" : "Penerima"}</th>
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {rows.length === 0 ? (
              <tr>
                <td className={s.emptyCell} colSpan={columnCount}>
                  Belum ada riwayat {isOut ? "barang keluar" : "barang masuk"}.
                </td>
              </tr>
            ) : (
              rows.map((trx, index) => {
                const out = trx as GudangOutTransactionView;
                return (
                  <tr key={trx.id} className={s.row}>
                    <td className={s.td}>
                      <span className={s.subText}>{index + 1}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.nameText}>{formatDate(trx.transactionDate)}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.categoryBadge}>{trx.categoryName || "-"}</span>
                    </td>
                    <td className={s.td}>
                      <div className={s.nameText}>{trx.itemName || "-"}</div>
                    </td>
                    <td className={s.td}>
                      <span className={s.badge}>{trx.brand || "-"}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.modelText}>{trx.modelNo || "-"}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.subText}>{trx.color || "-"}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.nameText}>{trx.rackGroup || "-"}</span>
                    </td>
                    {isOut && (
                      <td className={s.td}>
                        <span className={s.subText}>{out.projectName || "-"}</span>
                      </td>
                    )}
                    <td className={s.tdRight}>
                      <span className={s.stockText}>{trx.quantity}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.subText}>{trx.createdBy || "-"}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={s.footer}>
        <span className={s.footerText}>
          {rows.length} transaksi &middot; total{" "}
          <span className="font-bold text-secondary">{totalQuantity}</span> unit
        </span>
      </div>
    </div>
  );
}
