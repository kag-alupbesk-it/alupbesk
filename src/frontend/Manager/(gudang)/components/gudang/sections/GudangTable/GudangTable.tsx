"use client";

import type { GudangItem } from "../types/types";
import * as s from "../../style/style";

interface GudangTableProps {
  items: GudangItem[];
  searchQuery: string;
  selectedMerek: string;
  selectedKategori: string;
  selectedProyek: string;
  daftarMerek: string[];
  daftarProyek: string[];
  onSearchChange: (value: string) => void;
  onMerekChange: (value: string) => void;
  onKategoriChange: (value: string) => void;
  onProyekChange: (value: string) => void;
  onStock: (item: GudangItem) => void;
  onMasuk: (item: GudangItem) => void;
  onKeluar: (item: GudangItem) => void;
  /** Mode pantau Owner: seluruh tombol aksi disembunyikan. */
  readOnly?: boolean;
}

export function GudangTable({
  items, searchQuery, selectedMerek, selectedKategori, selectedProyek,
  daftarMerek, daftarProyek,
  onSearchChange, onMerekChange, onKategoriChange, onProyekChange,
  onStock, onMasuk, onKeluar,
  readOnly = false,
}: GudangTableProps) {
  return (
    <div className={s.tableCard}>
      <div className={s.tableToolbar}>
        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>search</span>
          <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari SKU, jenis, merek, kategori, atau lokasi..." className={s.searchInput} />
        </div>
        <div className={s.filterGroup}>
          <div className={s.filterWrapper}>
            <label className={s.filterLabel}>Merek:</label>
            <select value={selectedMerek} onChange={(e) => onMerekChange(e.target.value)} className={s.filterSelect}>
              <option value="ALL">Semua Merek</option>
              {daftarMerek.map((merek) => (<option key={merek} value={merek}>{merek}</option>))}
            </select>
          </div>
          <div className={s.filterWrapper}>
            <label className={s.filterLabel}>Kategori:</label>
            <select value={selectedKategori} onChange={(e) => onKategoriChange(e.target.value)} className={s.filterSelect}>
              <option value="ALL">Semua</option>
              <option value="eceran">Barang Eceran</option>
              <option value="proyek">Proyek / Inventaris</option>
            </select>
          </div>
          {daftarProyek.length > 0 && (
            <div className={s.filterWrapper}>
              <label className={s.filterLabel}>Proyek:</label>
              <select value={selectedProyek} onChange={(e) => onProyekChange(e.target.value)} className={s.filterSelect}>
                <option value="ALL">Semua Proyek</option>
                {daftarProyek.map((proyek) => (<option key={proyek} value={proyek}>{proyek}</option>))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className={s.mobileList}>
        {items.length === 0 ? (
          <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
            Tidak ada barang yang cocok dengan pencarian atau filter yang dipilih.
          </div>
        ) : (
          items.map((item) => {
            const isLowStock = item.stok <= item.minStok;
            return (
              <div key={item.id} data-focus-id={isLowStock ? "stok-kritis" : undefined} className={s.card}>
                <div className={s.cardTop}>
                  <div className="min-w-0">
                    <div className={s.skuText}>{item.sku}</div>
                    <div className={`${s.jenisText} truncate`}>{item.jenisBarang}</div>
                  </div>
                  <span className={item.kategoriBarang === "proyek" ? s.kategoriProyekBadge : s.kategoriEceranBadge}>
                    {item.kategoriBarang === "proyek" ? "Proyek" : "Eceran"}
                  </span>
                </div>
                <div className={s.cardInfo}>
                  <div className="truncate">
                    <span className={s.merekBadge}>{item.merek}</span>{" "}
                    <span className={s.warnaText}>{item.warna}</span>
                  </div>
                  <div className={s.lokasiWrapper}>
                    <span className={s.lokasiDot} />
                    {item.seksiLokasi}
                  </div>
                  {item.proyek && <div className="truncate">{item.proyek}</div>}
                  {item.catatan && <div className="truncate">{item.catatan}</div>}
                </div>
                <div className={s.cardMeta}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Stok</span>
                  <span className={s.stokWrapper}>
                    <span className={isLowStock ? s.stokValueError : s.stokValue}>{item.stok}</span>
                    <span className={s.satuanText}>{item.satuan}</span>
                    {isLowStock && <span className={s.lowStockBadge}>Low Stock</span>}
                  </span>
                </div>
                <div className={`${s.cardActions} flex-col gap-2`}>
                  {!readOnly && (
                    <>
                      <button onClick={() => onMasuk(item)} className={`${s.editButton} w-full`}>
                        <span className={s.iconSm}>login</span>
                        <span className="ml-1 text-[10px] font-bold uppercase tracking-wide">Masuk</span>
                      </button>
                      <button onClick={() => onKeluar(item)} className={`${s.editButton} w-full`}>
                        <span className={s.iconSm}>logout</span>
                        <span className="ml-1 text-[10px] font-bold uppercase tracking-wide">Keluar</span>
                      </button>
                      <button onClick={() => onStock(item)} className={`${s.editButton} w-full`}>
                        <span className={s.iconSm}>inventory</span>
                        <span className="ml-1 text-[10px] font-bold uppercase tracking-wide">Kelola Stok</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={`${s.tableWrapper} ${s.desktopOnly}`}>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th scope="col" className={s.th}>SKU / No. Model</th>
              <th scope="col" className={s.th}>Jenis Barang</th>
              <th scope="col" className={s.thHiddenSm}>Kategori</th>
              <th scope="col" className={s.th}>Merek</th>
              <th scope="col" className={s.thHiddenSm}>Warna</th>
              <th scope="col" className={s.th}>Lokasi / Seksi</th>
              <th scope="col" className={s.thHiddenMd}>Proyek</th>
              <th scope="col" className={s.thRight}>Jumlah / Stok</th>
              <th scope="col" className={s.thHiddenMd}>Catatan</th>
              {!readOnly && <th scope="col" className={s.thRight}>Aksi</th>}
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className={s.emptyCell}>
                  Tidak ada barang yang cocok dengan pencarian atau filter yang dipilih.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLowStock = item.stok <= item.minStok;
                return (
                  <tr key={item.id} data-focus-id={isLowStock ? "stok-kritis" : undefined} className={s.row}>
                    <td className={s.td}>
                      <span className={s.skuText}>{item.sku}</span>
                    </td>
                    <td className={s.td}>
                      <span className={s.jenisText}>{item.jenisBarang}</span>
                    </td>
                    <td className={s.tdHiddenSm}>
                      <span className={item.kategoriBarang === "proyek" ? s.kategoriProyekBadge : s.kategoriEceranBadge}>
                        {item.kategoriBarang === "proyek" ? "Proyek" : "Eceran"}
                      </span>
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
                    <td className={s.tdHiddenMd}>
                      {item.proyek ? (
                        <span className={s.proyekText}>{item.proyek}</span>
                      ) : (
                        <span className={s.noCatatan}>&mdash;</span>
                      )}
                    </td>
                    <td className={s.tdRight}>
                      <div className={s.stokWrapper}>
                        <span className={isLowStock ? s.stokValueError : s.stokValue}>{item.stok}</span>
                        <span className={s.satuanText}>{item.satuan}</span>
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
                      {!readOnly && (
                        <div className={s.aksiWrapper}>
                          <button onClick={() => onMasuk(item)} title="Catat barang masuk" className={s.editButton}>
                            <span className={s.iconSm}>login</span>
                          </button>
                          <button onClick={() => onKeluar(item)} title="Catat barang keluar" className={s.editButton}>
                            <span className={s.iconSm}>logout</span>
                          </button>
                          <button onClick={() => onStock(item)} title="Kelola stok" className={s.editButton}>
                            <span className={s.iconSm}>inventory</span>
                          </button>
                        </div>
                      )}
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
        {!readOnly && (
          <p className={s.footerHint}>
            Ikon <span className={s.footerEdit}>masuk / keluar</span> untuk catat pergerakan barang
          </p>
        )}
      </div>
    </div>
  );
}
