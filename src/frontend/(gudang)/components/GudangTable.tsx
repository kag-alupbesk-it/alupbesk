"use client";

import type { GudangItem } from "@/services/gudang";

interface GudangTableProps {
  items: GudangItem[];
  searchQuery: string;
  selectedMerek: string;
  daftarMerek: string[];
  onSearchChange: (value: string) => void;
  onMerekChange: (value: string) => void;
  onEdit: (item: GudangItem) => void;
  onDelete: (item: GudangItem) => void;
}

// Tabel menerima data yang sudah difilter dari parent (GudangPage).
// Filter logic tetap di parent agar GudangTable bisa di-reuse untuk konteks lain
// (misal: modal ringkasan, cetak laporan) tanpa membawa state filter-nya.
export function GudangTable({
  items,
  searchQuery,
  selectedMerek,
  daftarMerek,
  onSearchChange,
  onMerekChange,
  onEdit,
  onDelete,
}: GudangTableProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-primary-container shadow-2xl overflow-hidden">
      {/* Toolbar — Search & Filter */}
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-white/10 bg-white/[0.02]">
        {/* Search input menggunakan styling yang sama dengan TopBar di Manager */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari SKU, jenis, merek, atau lokasi..."
            className="w-full rounded-pill border border-white/10 bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:ring-1 focus:ring-secondary focus:border-secondary transition-all outline-none"
          />
        </div>

        {/* Dropdown filter merek */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest whitespace-nowrap">
            Merek:
          </label>
          <select
            value={selectedMerek}
            onChange={(e) => onMerekChange(e.target.value)}
            className="rounded-lg border border-white/10 bg-surface-variant px-3 py-2 text-xs text-on-surface transition-all focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
          >
            <option value="ALL">Semua Merek</option>
            {daftarMerek.map((merek) => (
              <option key={merek} value={merek}>
                {merek}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Inventaris */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-white/10">
            <tr>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4">SKU / No. Model</th>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4">Jenis Barang</th>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4">Merek</th>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">Warna</th>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4">Lokasi / Seksi</th>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-right">Jumlah / Stok</th>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 hidden md:table-cell">Catatan</th>
              <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-on-surface-variant text-xs">
                  Tidak ada barang yang cocok dengan pencarian atau filter yang dipilih.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLowStock = item.stok <= item.minStok;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* SKU — font mono + warna secondary agar mudah dibedakan dari kolom teks biasa */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5">
                      <span className="font-mono text-xs font-bold text-secondary">
                        {item.sku}
                      </span>
                    </td>

                    {/* Jenis Barang */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5">
                      <span className="text-xs font-semibold text-on-surface capitalize">
                        {item.jenisBarang}
                      </span>
                    </td>

                    {/* Merek — badge gaya yang sama dengan role badge di UsersPage */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5">
                      <span className="inline-block rounded bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold text-on-surface-variant border border-white/10 uppercase tracking-wide">
                        {item.merek}
                      </span>
                    </td>

                    {/* Warna */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5 hidden sm:table-cell">
                      <span className="text-xs text-on-surface-variant">{item.warna}</span>
                    </td>

                    {/* Lokasi Seksi — dot aksen secondary sebagai penanda visual */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-on-surface font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                        {item.seksiLokasi}
                      </span>
                    </td>

                    {/* Jumlah Stok dengan low stock badge */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`text-base font-bold ${
                            isLowStock ? "text-error" : "text-on-surface"
                          }`}
                        >
                          {item.stok}
                        </span>
                        {isLowStock && (
                          <span className="rounded bg-error/10 px-1.5 py-0.5 text-[9px] font-bold text-error border border-error/20 uppercase">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Catatan — ditampilkan sebagai pill subtle agar tidak mendominasi */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5 hidden md:table-cell">
                      {item.catatan ? (
                        <span className="rounded bg-white/[0.04] px-2 py-1 text-[10px] text-on-surface-variant border border-white/[0.06]">
                          {item.catatan}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/30 text-xs">—</span>
                      )}
                    </td>

                    {/* Kolom Aksi — Edit & Delete */}
                    <td className="px-4 lg:px-6 py-3 lg:py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          title="Edit barang"
                          className="flex items-center justify-center w-7 h-7 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          title="Hapus barang"
                          className="flex items-center justify-center w-7 h-7 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
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

      {/* Footer info jumlah item */}
      <div className="border-t border-white/10 px-4 lg:px-6 py-3 bg-white/[0.02] flex items-center justify-between">
        <p className="text-[10px] text-on-surface-variant">
          Menampilkan{" "}
          <span className="font-bold text-secondary">{items.length}</span>{" "}
          item
        </p>
        <p className="text-[10px] text-on-surface-variant/40">
          Klik ikon <span className="text-secondary">pensil</span> untuk edit · <span className="text-error">tong sampah</span> untuk hapus
        </p>
      </div>
    </div>
  );
}