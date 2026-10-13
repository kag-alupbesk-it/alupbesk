"use client";

import { useMemo } from "react";
import type {
  GudangCategory,
  GudangInventoryItem,
} from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";

interface MasterStokTabProps {
  items: GudangInventoryItem[];
  categories: GudangCategory[];
  categoryNames: Map<string, string>;
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  readOnly: boolean;
  busy: boolean;
  onAdd: () => void;
  onCreateCategory: () => void;
  onEdit: (item: GudangInventoryItem) => void;
  onDelete: (item: GudangInventoryItem) => void;
  onRecordIn: () => void;
  onRecordOut: () => void;
}

export function MasterStokTab({
  items,
  categories,
  categoryNames,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  readOnly,
  busy,
  onAdd,
  onCreateCategory,
  onEdit,
  onDelete,
  onRecordIn,
  onRecordOut,
}: MasterStokTabProps) {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "ALL" && item.categoryId !== categoryFilter) {
        return false;
      }
      if (!query) return true;
      return [item.itemName, item.brand, item.modelNo, item.color, item.rackGroup, item.subRow]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search, categoryFilter]);

  return (
    <div className={s.tableCard}>
      <div className={s.tableToolbar}>
        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>search</span>
          <input
            className={s.searchInput}
            placeholder="Cari nama, model, merek..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Kategori</span>
          <select
            className={s.filterSelect}
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
          >
            <option value="ALL">Semua</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {!readOnly && (
            <>
              <button className={s.ghostButton} onClick={onCreateCategory} disabled={busy}>
                <span className={s.buttonIcon}>category</span>
                Kategori
              </button>
              <button className={s.ghostButton} onClick={onRecordIn} disabled={busy}>
                <span className={s.buttonIcon}>move_to_inbox</span>
                Masuk
              </button>
              <button className={s.ghostButton} onClick={onRecordOut} disabled={busy}>
                <span className={s.buttonIcon}>outbox</span>
                Keluar
              </button>
              <button className={s.primaryButton} onClick={onAdd} disabled={busy}>
                <span className={s.buttonIcon}>add</span>
                Tambah Barang
              </button>
            </>
          )}
        </div>
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th className={s.th}>Kategori</th>
              <th className={s.th}>Nama Barang</th>
              <th className={s.th}>Merek</th>
              <th className={s.th}>No. Model</th>
              <th className={s.th}>Warna</th>
              <th className={s.th}>Lokasi Rak</th>
              <th className={s.th}>Baris</th>
              <th className={s.thRight}>Stok</th>
              {!readOnly && <th className={s.thRight}>Aksi</th>}
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {filtered.length === 0 ? (
              <tr>
                <td className={s.emptyCell} colSpan={readOnly ? 8 : 9}>
                  Belum ada barang pada master stok.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className={s.row}>
                  <td className={s.td}>
                    <span className={s.categoryBadge}>
                      {categoryNames.get(item.categoryId) ?? "-"}
                    </span>
                  </td>
                  <td className={s.td}>
                    <div className={s.nameText}>{item.itemName}</div>
                  </td>
                  <td className={s.td}>
                    <span className={s.badge}>{item.brand || "-"}</span>
                  </td>
                  <td className={s.td}>
                    <span className={s.modelText}>{item.modelNo || "-"}</span>
                  </td>
                  <td className={s.td}>
                    <span className={s.subText}>{item.color || "-"}</span>
                  </td>
                  <td className={s.td}>
                    <span className={s.nameText}>{item.rackGroup || "-"}</span>
                  </td>
                  <td className={s.td}>
                    <span className={s.subText}>{item.subRow || "-"}</span>
                  </td>
                  <td className={s.tdRight}>
                    <span className={item.currentStock <= 0 ? s.stockLow : s.stockText}>
                      {item.currentStock}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className={s.tdRight}>
                      <div className={s.actionCell}>
                        <button
                          className={s.editButton}
                          title="Edit"
                          onClick={() => onEdit(item)}
                          disabled={busy}
                        >
                          <span className={s.iconSm}>edit</span>
                        </button>
                        <button
                          className={s.deleteButton}
                          title="Hapus"
                          onClick={() => onDelete(item)}
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
          {items.length} barang
        </span>
      </div>
    </div>
  );
}
