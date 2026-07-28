import type { GudangItem } from "@/services/gudang";

interface GudangHeaderProps {
  totalStok: number;
  totalJenisItem: number;
  jumlahLowStock: number;
  onTambah: () => void;
}

// Header menampilkan ringkasan metrik kritis gudang di satu tempat
// agar manager bisa langsung membaca kondisi stok tanpa harus scroll ke tabel
export function GudangHeader({ totalStok, totalJenisItem, jumlahLowStock, onTambah }: GudangHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      {/* Judul & Deskripsi */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-extrabold text-on-surface tracking-tight uppercase font-headline">
            Data Gudang Inventaris
          </h1>
          {/* Badge aksen menggunakan token warna secondary (gold) yang sama dengan Manager */}
          <span className="rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold text-secondary border border-secondary/20 uppercase tracking-widest">
            Real-time Sync
          </span>
        </div>
        <p className="mt-1 text-xs text-on-surface-variant">
          Monitoring stok barang, lokasi seksi rak, dan status penyesuaian inventaris.
        </p>
      </div>

      {/* Tombol Tambah & Metrik Cards */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tombol Tambah Barang — posisi sebelum metrik cards agar lebih prominent */}
        <button
          onClick={onTambah}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:brightness-110 text-on-secondary text-xs font-bold transition-all shadow-lg shadow-secondary/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">Tambah Barang</span>
        </button>

        {/* Divider subtle antara tombol dan metrik */}
        <div className="hidden md:block w-px h-8 bg-white/10" />

        {/* Total unit stok */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-primary-container px-4 py-3 shadow-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">
              Total Unit Stok
            </p>
            <p className="text-lg font-bold text-secondary font-headline">
              {totalStok.toLocaleString("id-ID")} Pcs
            </p>
          </div>
        </div>

        {/* Variasi SKU */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-primary-container px-4 py-3 shadow-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">category</span>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">
              Variasi Item
            </p>
            <p className="text-lg font-bold text-on-surface font-headline">
              {totalJenisItem} SKU
            </p>
          </div>
        </div>

        {/* Low stock alert — hanya tampil jika ada barang dengan stok menipis */}
        {jumlahLowStock > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3 shadow-md">
            <span className="h-2.5 w-2.5 rounded-full bg-error animate-pulse shrink-0" />
            <div>
              <p className="text-[9px] font-bold tracking-widest text-error uppercase">
                Stok Menipis
              </p>
              <p className="text-lg font-bold text-error font-headline">
                {jumlahLowStock} Item
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}