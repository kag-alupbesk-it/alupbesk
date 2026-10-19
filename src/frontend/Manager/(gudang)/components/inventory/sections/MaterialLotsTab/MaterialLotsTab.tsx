"use client";

import { useMemo } from "react";
import type {
  GudangInventoryItem,
  GudangMaterialLotView,
} from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";

interface MaterialLotsTabProps {
  lots: GudangMaterialLotView[];
  items: GudangInventoryItem[];
  search: string;
  onSearchChange: (value: string) => void;
  readOnly: boolean;
  busy: boolean;
  onAdd: () => void;
  onEdit: (lot: GudangMaterialLotView) => void;
  onDelete: (lot: GudangMaterialLotView) => void;
}

const STATUS_LABEL: Record<string, string> = {
  tersedia: "Tersedia",
  sisa: "Sisa",
  scrap: "Scrap",
  habis: "Habis",
};

export function MaterialLotsTab({
  lots,
  items,
  search,
  onSearchChange,
  readOnly,
  busy,
  onAdd,
  onEdit,
  onDelete,
}: MaterialLotsTabProps) {
  const itemName = useMemo(
    () => new Map(items.map((item) => [item.id, item.itemName])),
    [items],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return lots;
    return lots.filter((lot) =>
      [lot.itemName, lot.modelNo, lot.lotCode, lot.rackGroup, lot.subRow, lot.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [lots, search]);

  const usableCount = useMemo(
    () => lots.filter((lot) => lot.status === "tersedia" || lot.status === "sisa").length,
    [lots],
  );

  return (
    <div className={s.tableCard}>
      <div className={s.tableToolbar}>
        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>search</span>
          <input
            className={s.searchInput}
            placeholder="Cari barang, kode lot, lokasi..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className={s.filterGroup}>
          <span className={s.filterLabel}>
            {usableCount} lot siap pakai
          </span>
          {!readOnly && (
            <button className={s.primaryButton} onClick={onAdd} disabled={busy}>
              <span className={s.buttonIcon}>add</span>
              Tambah Lot
            </button>
          )}
        </div>
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th className={s.th}>Barang</th>
              <th className={s.th}>Kode Lot</th>
              <th className={s.th}>Tgl Terima</th>
              <th className={s.thRight}>Panjang (cm)</th>
              <th className={s.thRight}>Jumlah</th>
              <th className={s.th}>Lokasi</th>
              <th className={s.th}>Status</th>
              {!readOnly && <th className={s.thRight}>Aksi</th>}
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {filtered.length === 0 ? (
              <tr>
                <td className={s.emptyCell} colSpan={readOnly ? 7 : 8}>
                  Belum ada lot bahan. Tambahkan lot untuk mulai melacak sisa potong.
                </td>
              </tr>
            ) : (
              filtered.map((lot) => (
                <tr key={lot.id} className={s.row}>
                  <td className={s.td}>
                    <div className={s.nameText}>
                      {itemName.get(lot.itemId) ?? lot.itemName}
                    </div>
                    <span className={s.subText}>{lot.modelNo || "-"}</span>
                  </td>
                  <td className={s.td}>
                    <span className={s.modelText}>{lot.lotCode || "-"}</span>
                  </td>
                  <td className={s.td}>
                    <span className={s.subText}>{lot.receivedDate}</span>
                  </td>
                  <td className={s.tdRight}>
                    <span className={s.subText}>
                      {lot.length != null ? lot.length : "-"}
                    </span>
                  </td>
                  <td className={s.tdRight}>
                    <span className={s.stockText}>
                      {lot.quantity} {lot.unit}
                    </span>
                  </td>
                  <td className={s.td}>
                    <span className={s.nameText}>
                      {lot.rackGroup || "-"}
                      {lot.subRow ? ` / ${lot.subRow}` : ""}
                    </span>
                  </td>
                  <td className={s.td}>
                    <span className={s.badge}>{STATUS_LABEL[lot.status] ?? lot.status}</span>
                  </td>
                  {!readOnly && (
                    <td className={s.tdRight}>
                      <div className={s.actionCell}>
                        <button
                          className={s.editButton}
                          title="Edit"
                          onClick={() => onEdit(lot)}
                          disabled={busy}
                        >
                          <span className={s.iconSm}>edit</span>
                        </button>
                        <button
                          className={s.deleteButton}
                          title="Hapus"
                          onClick={() => onDelete(lot)}
                          disabled={busy}
                        >
                          <span className={s.iconSm}>delete</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={s.footer}>
        <span className={s.footerText}>
          Menampilkan <span className="font-bold text-secondary">{filtered.length}</span> dari{" "}
          {lots.length} lot
        </span>
      </div>
    </div>
  );
}
