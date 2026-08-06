"use client";

import type { GudangItem } from "./types";
import * as s from "../style";

interface GudangTableProps {
  items: GudangItem[];
  searchQuery: string;
  selectedMerek: string;
  daftarMerek: string[];
  onSearchChange: (value: string) => void;
  onMerekChange: (value: string) => void;
  onStock: (item: GudangItem) => void;
}

export function GudangTable({
  items, searchQuery, selectedMerek, daftarMerek,
  onSearchChange, onMerekChange, onStock,
}: GudangTableProps) {
  return (
    <div className={s.tableCard}>
      <div className={s.tableToolbar}>
        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>search</span>
          <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari SKU, jenis, merek, atau lokasi..." className={s.searchInput} />
        </div>
        <div className={s.filterWrapper}>
          <label className={s.filterLabel}>Merek:</label>
          <select value={selectedMerek} onChange={(e) => onMerekChange(e.target.value)} className={s.filterSelect}>
            <option value="ALL">Semua Merek</option>
            {daftarMerek.map((merek) => (<option key={merek} value={merek}>{merek}</option>))}
          </select>
        </div>
      </div>

      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th scope="col" className={s.th}>SKU / No. Model</th>
              <th scope="col" className={s.th}>Jenis Barang</th>
              <th scope="col" className={s.th}>Merek</th>
              <th scope="col" className={s.thHiddenSm}>Warna</th>
              <th scope="col" className={s.th}>Lokasi / Seksi</th>
              <th scope="col" className={s.thRight}>Jumlah / Stok</th>
              <th scope="col" className={s.thHiddenMd}>Catatan</th>
              <th scope="col" className={s.thRight}>Aksi</th>
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className={s.emptyCell}>
                  Tidak ada barang yang cocok dengan pencarian atau filter yang dipilih.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLowStock = item.stok <= item.minStok;
                return (
                  <tr key={item.id} className={s.row}>
                    <td className={s.td}>
                      <span className={s.skuText}>{item.sku}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.jenisText}>{item.jenisBarang}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.merekBadge}>{item.merek}</span>
                    </td>
                    <td className={s.tdHiddenSm}>
                      <span className={s.warnaText}>{item.warna}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.lokasiWrapper}>
                        <span className={s.lokasiDot} />
                        {item.seksiLokasi}
                      </span>
                    </td>
                    <td className={s.tdRight}>
                      <div className={s.stokWrapper}>
                        <span className={isLowStock ? s.stokValueError : s.stokValue}>{item.stok}</span>
                        {isLowStock && <span className={s.lowStockBadge}>Low Stock</span>}
                      </div>
                    </td>
                    <td className={s.tdHiddenMd}>
                      {item.catatan ? (
                        <span className={s.catatanText}>{item.catatan}</span>
                      ) : (
                        <span className={s.noCatatan}>&mdash;</span>
                      )}
                    </td>
                    <td className={s.tdRight}>
                      <div className={s.aksiWrapper}>
                        <button onClick={() => onStock(item)} title="Kelola stok" className={s.editButton}>
                          <span className={s.iconSm}>inventory</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={s.tableFooter}>
        <p className={s.footerText}>
          Menampilkan <span className={s.footerAccent}>{items.length}</span> item
        </p>
        <p className={s.footerHint}>
          Klik ikon <span className={s.footerEdit}>inventaris</span> untuk kelola stok
        </p>
      </div>
    </div>
  );
}
